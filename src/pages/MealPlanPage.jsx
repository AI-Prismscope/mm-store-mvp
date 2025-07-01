// src/pages/MealPlanPage.jsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import PlannedRecipeCard from '../components/PlannedRecipeCard';
import ShoppingListSummary from '../components/ShoppingListSummary';

export default function MealPlanPage() {
  const { session } = useAuth();
  const { cart, refetchCart } = useCart();
  const [suggestions, setSuggestions] = useState([]);
  const [plannedRecipes, setPlannedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!session) return;
    try {
      const sugRes = await fetch('/.netlify/functions/suggest-recipes', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const sugData = await sugRes.json();
      setSuggestions(sugData);
    } catch (e) { console.error("Error fetching suggestions:", e); }
  }, [session]);

  const fetchPlan = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await supabase.from('meal_plan_recipes').select('*, recipes(*, recipe_ingredients(*, products(*)))');
      setPlannedRecipes(data || []);
    } catch (e) { console.error("Error fetching plan:", e); }
  }, [session]);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([
        refetchCart(),
        fetchSuggestions(),
        fetchPlan()
      ]);
      setLoading(false);
    };

    if (session) {
      initialLoad();
    }
  }, [session, refetchCart, fetchSuggestions, fetchPlan]);

  const handleAddToPlan = async (recipeId) => {
    const { error } = await supabase.from('meal_plan_recipes').insert({ recipe_id: recipeId });
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      await fetchPlan(); 
    }
  };

  const handleRemoveFromPlan = async (planItemId) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from('meal_plan_recipes').delete().eq('id', planItemId);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      await fetchPlan();
    }
  };

  const { assignedItems, unassignedItems } = useMemo(() => {
    if (!plannedRecipes || plannedRecipes.length === 0) {
      return { assignedItems: new Set(), unassignedItems: cart };
    }
    const assignedProductIds = new Set();
    plannedRecipes.forEach(planItem => {
      planItem.recipes.recipe_ingredients.forEach(ing => {
        assignedProductIds.add(ing.product_id);
      });
    });
    const assigned = [];
    const unassigned = [];
    cart.forEach(cartItem => {
      if (assignedProductIds.has(cartItem.product_id)) {
        assigned.push(cartItem);
      } else {
        unassigned.push(cartItem);
      }
    });
    return { assignedItems: assigned, unassignedItems: unassigned };
  }, [cart, plannedRecipes]);

  if (loading) return <p className="p-4">Building your plan...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Weekly Meal Plan</h1>
        <button
          onClick={async () => { await fetch('/.netlify/functions/cart-reset', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } }); await refetchCart(); }}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-600 transition"
        >
          Get New Ingredients
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Recipe Suggestions</h2>
            <div className="space-y-3">
              {suggestions.map(recipe => (
                <div key={recipe.id} className="bg-white p-2 rounded-lg shadow flex items-center space-x-3">
                  <div className="flex-shrink-0 w-16 h-16">
                    <img 
                      src={recipe.image_url || 'https://via.placeholder.com/150'}
                      alt={recipe.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm leading-tight text-gray-800">{recipe.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Matches: <span className="font-medium text-green-600">{recipe.matchCount}</span>, 
                      Missing: <span className="font-medium text-red-600">{recipe.gapCount}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleAddToPlan(recipe.id)} 
                    className="flex-shrink-0 bg-purple-100 text-purple-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-purple-200"
                    title="Add to Plan"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              ))}
              {suggestions.length === 0 && !loading && (
                <p className="text-sm text-gray-500 text-center">No suggestions for your current cart.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ShoppingListSummary 
            cartItems={cart}
            assignedItems={assignedItems}
            unassignedItems={unassignedItems} 
          />
          <h2 className="text-2xl font-bold mb-4">Your Meal Plan</h2>
          <div className="space-y-4">
            {plannedRecipes.length > 0 ? (
              plannedRecipes.map(planItem => (
                <PlannedRecipeCard
                  key={planItem.id}
                  planItem={planItem}
                  onRemove={handleRemoveFromPlan}
                  cartItems={cart}
                />
              ))
            ) : (
              <p className="text-gray-500">No recipes planned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}