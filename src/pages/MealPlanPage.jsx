// src/pages/MealPlanPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

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
    // We don't need to manually specify the user_id.
    // As long as the user is logged in, the `supabase` client object
    // will send the user's auth token automatically.
    // The RLS policy on the backend will then allow the insert.
    const { error } = await supabase
      .from('meal_plan_recipes')
      .insert({ recipe_id: recipeId }); // 👈 REMOVED user_id

    if (error) {
      // It's good practice to log the error to see what's happening
      console.error("Error adding to plan:", error);
      alert("Could not add recipe to your plan.");
    } else {
      // Reload all data to reflect the change
      loadData();
    }
  };

  const handleResetCart = async () => {
    await fetch('/.netlify/functions/cart-reset', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
    loadData(); // Reload all data
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

        {/* --- Right Column: The Organized Meal Plan --- */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">The Plan</h2>
          <div className="space-y-6">
            {organizedCart.planned?.map(recipe => (
              <div key={recipe.id} className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-bold mb-3">{recipe.name}</h3>
                <ul>
                  {recipe.ingredients.map(ing => (
                    <li key={ing.id} className="flex items-center space-x-3 py-1">
                      {ing.inCart ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500 font-bold">!</span>
                      )}
                      <span>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.products.name}`}</span>
                      {!ing.inCart && <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Missing</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {organizedCart.unassigned.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Unassigned Items</h3>
                <ul className="text-sm text-gray-600">
                  {organizedCart.unassigned.map(item => <li key={item.id}>- {item.products.name}</li>)}
                </ul>
              </div>
            )}
            {plannedRecipes.length === 0 && <p className="text-gray-500">Add a recipe from the suggestions to start building your plan!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}