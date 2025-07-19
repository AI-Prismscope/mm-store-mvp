// src/pages/MealPlanPage.jsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFridge } from '../context/FridgeContext';
import { supabase } from '../lib/supabaseClient';
import PlannedRecipeCard from '../components/PlannedRecipeCard';
import ShoppingListSummary from '../components/ShoppingListSummary';
import FridgeOverview from '../components/FridgeOverview';
import { useUI } from '../context/UIContext';

export default function MealPlanPage() {
  const { session } = useAuth();
  const { cart, refetchCart } = useCart();
  const { fridgeItems, refetchFridge } = useFridge();
  const [suggestions, setSuggestions] = useState([]);
  const [plannedRecipes, setPlannedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const { isCartOpen } = useUI();

  const fetchSuggestions = useCallback(async () => {
    if (!session) return;
    try {
      const sugRes = await fetch('/.netlify/functions/suggest-recipes', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const sugData = await sugRes.json();
      setSuggestions(Array.isArray(sugData) ? sugData : []);
    } catch (e) {
      setSuggestions([]); // fallback to empty array on error
      console.error("Error fetching suggestions:", e);
    }
  }, [session]);

  const fetchPlan = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await supabase.from('meal_plan_recipes').select('*, recipes(*, recipe_ingredients(*, products(*)))');
      setPlannedRecipes(data || []);
    } catch (e) { console.error("Error fetching plan:", e); }
  }, [session]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refetchCart(),
      fetchSuggestions(),
      fetchPlan(),
      refetchFridge()
    ]);
    setLoading(false);
  }, [session, refetchCart, fetchSuggestions, fetchPlan, refetchFridge]);

  const handleFullReset = async () => {
    setIsResetting(true);
    console.log("Initiating full cart and plan reset...");

    await Promise.all([
      fetch('/.netlify/functions/cart-reset', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } }),
      fetch('/.netlify/functions/plan-clear', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } })
    ]);

    console.log("Cart and plan cleared. Fetching new data...");
    
    await initialLoad();
    setIsResetting(false);
  };

  useEffect(() => {
    if (session) {
      initialLoad();
    }
  }, [session, initialLoad]);

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

  const { assignedItems, unassignedItems, plannedFridgeItems, unplannedFridgeItems } = useMemo(() => {
    if (!plannedRecipes || plannedRecipes.length === 0) {
      return { 
        assignedItems: [], 
        unassignedItems: cart,
        plannedFridgeItems: [],
        unplannedFridgeItems: fridgeItems,
      };
    }
    
    // Create a Set of all product IDs required by the planned recipes
    const requiredProductIds = new Set();
    plannedRecipes.forEach(planItem => {
      planItem.recipes.recipe_ingredients.forEach(ing => {
        requiredProductIds.add(ing.product_id);
      });
    });
    
    // Partition the cartItems
    const assigned = [];
    const unassigned = [];
    cart.forEach(cartItem => {
      if (requiredProductIds.has(cartItem.product_id)) {
        assigned.push(cartItem);
      } else {
        unassigned.push(cartItem);
      }
    });

    // Partition the fridgeItems using the same logic
    const plannedFridge = [];
    const unplannedFridge = [];
    fridgeItems.forEach(fridgeItem => {
      if (requiredProductIds.has(fridgeItem.product_id)) {
        plannedFridge.push(fridgeItem);
      } else {
        unplannedFridge.push(fridgeItem);
      }
    });

    return { 
      assignedItems: assigned, 
      unassignedItems: unassigned,
      plannedFridgeItems: plannedFridge,
      unplannedFridgeItems: unplannedFridge,
    };
  }, [cart, fridgeItems, plannedRecipes]);

  if (loading) return <p className="p-4">Building your plan...</p>;

  return (
    <div>
      <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Weekly Meal Plan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recipe Suggestions</h2>
              <button 
                onClick={handleFullReset}
                disabled={isResetting}
                className="text-sm bg-[#4CAF50] hover:bg-[#388e3c] disabled:bg-green-300 text-white font-bold px-3 py-1 rounded-lg transition-colors"
                title="Get a new set of random ingredients"
              >
                {isResetting ? 'Loading...' : 'Get New Ingredients'}
              </button>
            </div>
            <div className="space-y-3">
              {isResetting && <p className="text-center text-gray-500">Finding new suggestions...</p>}
              {Array.isArray(suggestions) && suggestions.map(recipe => (
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
                      Missing: <span className="font-medium text-red-600">{recipe.gapCount}</span>,<br></br>
                      {recipe.matchPercentage === 100 && (<span className="ml-1 text-xl" role="img" aria-label="checkmark">✅</span>)}
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
              {!isResetting && suggestions.length === 0 && !loading && (
                <p className="text-sm text-gray-500 text-center">No suggestions for your current cart.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 transition-all duration-300 min-w-0">
          <ShoppingListSummary 
            cartItems={cart}
            assignedItems={assignedItems}
            unassignedItems={unassignedItems} 
          />
          <FridgeOverview 
            plannedItems={plannedFridgeItems} 
            unplannedItems={unplannedFridgeItems} 
          />
          <h2 className="text-2xl font-bold mb-4 mt-8">Your Meal Plan</h2>
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
        <div className="hidden lg:block lg:col-span-1"></div>
      </div>
      </div>
    </div>
  );
}