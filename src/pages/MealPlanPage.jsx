// src/pages/MealPlanPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import PlannedRecipeCard from '../components/PlannedRecipeCard';

export default function MealPlanPage() {
  const { session } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [plannedRecipes, setPlannedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching Logic (mostly unchanged) ---
  const loadData = async () => {
    setLoading(true);
    // 1. Get cart items. If empty, reset and fetch again.
    let { data: itemsData } = await supabase.from('cart_items').select('*, products(*)');
    if (itemsData && itemsData.length === 0) {
      await fetch('/.netlify/functions/cart-reset', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const { data: newItems } = await supabase.from('cart_items').select('*, products(*)');
      itemsData = newItems || [];
    }
    setCartItems(itemsData || []);

    // 2. Get recipe suggestions
    const sugRes = await fetch('/.netlify/functions/suggest-recipes', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
    const sugData = await sugRes.json();
    setSuggestions(sugData || []);
    
    // 3. Get currently planned recipes
    const { data: planData } = await supabase.from('meal_plan_recipes').select('*, recipes(*, recipe_ingredients(*, products(*)))');
    setPlannedRecipes(planData || []);

    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  // --- User Actions ---
  const handleAddToPlan = async (recipeId) => {
    // Safety check: Don't do anything if the user isn't logged in
    if (!session?.user) {
      alert("Please log in to add recipes to your plan.");
      return;
    }

    // THE FIX: We now explicitly include the user_id in the object we're inserting.
    const { error } = await supabase
      .from('meal_plan_recipes')
      .insert({
        recipe_id: recipeId,
        user_id: session.user.id // 👈 This is the crucial line
      });

    if (error) {
      console.error("Error adding to plan:", error);
      alert(`Could not add recipe to your plan. Error: ${error.message}`);
    } else {
      console.log('Successfully added to plan!');
      // Reload all data to reflect the change
      loadData();
    }
  };

  const handleResetCart = async () => {
    await fetch('/.netlify/functions/cart-reset', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
    loadData(); // Reload all data
  };

  // --- NEW: Remove from Plan Handler ---
  const handleRemoveFromPlan = async (planItemId) => {
    if (!window.confirm("Are you sure you want to remove this recipe from your plan?")) {
      return;
    }
    const { error } = await supabase
      .from('meal_plan_recipes')
      .delete()
      .eq('id', planItemId);
    if (error) {
      console.error("Error removing from plan:", error);
      alert("Could not remove the recipe. Please try again.");
    } else {
      console.log("Recipe removed from plan successfully.");
      loadData();
    }
  };

  // --- Derived State for the Organized Cart View ---
  const organizedCart = useMemo(() => {
    if (plannedRecipes.length === 0) return { unassigned: cartItems };

    const plannedRecipeIds = new Set(plannedRecipes.map(p => p.recipe_id));
    const cartProductIds = new Set(cartItems.map(item => item.product_id));
    let assignedProductIds = new Set();
    
    const structuredPlan = plannedRecipes.map(plan => {
      const recipe = plan.recipes;
      const ingredients = recipe.recipe_ingredients.map(ing => {
        assignedProductIds.add(ing.product_id);
        return {
          ...ing,
          inCart: cartProductIds.has(ing.product_id)
        };
      });
      return { ...recipe, ingredients };
    });

    const unassigned = cartItems.filter(item => !assignedProductIds.has(item.product_id));

    return { planned: structuredPlan, unassigned };
  }, [cartItems, plannedRecipes]);


  if (loading) return <div className="text-center p-8">Loading your plan...</div>;

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Weekly Meal Plan</h1>
        <button
          onClick={handleResetCart}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-600 transition"
        >
          Get New Ingredients
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- Left Column: Suggestions & Cart --- */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Recipe Suggestions</h2>
            <div className="space-y-3">
              {suggestions.map(recipe => (
                <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="font-semibold">{recipe.name}</p>
                  <p className="text-sm text-gray-500">Matches: {recipe.matchCount}, Missing: {recipe.gapCount}</p>
                  <button onClick={() => handleAddToPlan(recipe.id)} className="mt-2 text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700">
                    + Add to Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Your Ingredients</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <ul className="space-y-2">
                {cartItems.map(item => (
                  <li key={item.id} className="text-gray-700">{item.products.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* --- Right Column: Meal Plan --- */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Your Meal Plan</h2>
          <div className="space-y-4">
            {plannedRecipes.length > 0 ? (
              plannedRecipes.map(planItem => (
                <PlannedRecipeCard
                  key={planItem.id}
                  planItem={planItem}
                  onRemove={handleRemoveFromPlan}
                  cartItems={cartItems}
                />
              ))
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Your meal plan is empty.</p>
                <p className="text-gray-500">Add a recipe from the suggestions to get started!</p>
              </div>
            )}
          </div>

          {/* This is where the ingredient list will go next */}
          <h2 className="text-2xl font-bold mt-8 mb-4">Your Shopping List</h2>
          <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
            The organized ingredient list will be built here.
          </div>
        </div>
      </div>
    </div>
  );
}