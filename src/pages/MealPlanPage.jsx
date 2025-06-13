// src/pages/MealPlanPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function MealPlanPage() {
  const { session } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [plannedRecipes, setPlannedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch all necessary data
  const loadData = async () => {
    setLoading(true);
    // 1. Get cart items. If empty, reset and fetch again.
    let { data: items } = await supabase.from('cart_items').select('*, products(*)');
    if (items.length === 0) {
      await fetch('/.netlify/functions/cart-reset', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const { data: newItems } = await supabase.from('cart_items').select('*, products(*)');
      items = newItems;
    }
    setCartItems(items);

    // 2. Get recipe suggestions based on the new cart
    const sugRes = await fetch('/.netlify/functions/suggest-recipes', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } });
    const sugData = await sugRes.json();
    setSuggestions(sugData);
    
    // 3. Get currently planned recipes
    const { data: plan } = await supabase.from('meal_plan_recipes').select('*, recipes(*)');
    setPlannedRecipes(plan);

    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  // Function to add a recipe to the user's meal plan
  const handleAddToPlan = async (recipeId) => {
    await supabase.from('meal_plan_recipes').insert({ recipe_id: recipeId, user_id: session.user.id });
    loadData(); // Reload all data to reflect the change
  };

  if (loading) return <p className="p-4">Building your plan...</p>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Column 1: Recipe Suggestions */}
      <div className="md:col-span-1">
        <h2 className="text-2xl font-bold mb-4">Recipe Suggestions</h2>
        <div className="space-y-4">
          {suggestions.map(recipe => (
            <div key={recipe.id} className="bg-white p-3 rounded-lg shadow">
              <p className="font-bold">{recipe.name}</p>
              <p className="text-sm text-gray-500">Matches: {recipe.matchCount}, Missing: {recipe.gapCount}</p>
              <button onClick={() => handleAddToPlan(recipe.id)} className="mt-2 text-sm bg-purple-600 text-white px-3 py-1 rounded">
                + Add to Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Organized Cart & Meal Plan */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Your Meal Plan & Cart</h2>
        {/* Here we would build the final <OrganizedCartView /> component */}
        <p className="text-center p-8 bg-gray-100 rounded-lg">
          The organized cart view will be built here, showing your planned recipes and highlighting which ingredients you have and which are missing.
        </p>
      </div>
    </div>
  );
}