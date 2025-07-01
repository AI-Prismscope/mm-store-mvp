import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import FridgeSearch from '../components/FridgeSearch';
import FridgeOverview from '../components/FridgeOverview';

export default function MyFridgePage() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [plannedRecipes, setPlannedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fridgeRes, planRes] = await Promise.all([
        supabase.from('fridge_items').select(`*, products(*, product_tags(tags(*)))`),
        supabase.from('meal_plan_recipes').select('*, recipes(*, recipe_ingredients(*))')
      ]);
      if (fridgeRes.error) throw fridgeRes.error;
      if (planRes.error) throw planRes.error;
      setFridgeItems(fridgeRes.data || []);
      setPlannedRecipes(planRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Partition fridge items into planned/unplanned
  const { plannedFridgeItems, unplannedFridgeItems } = useMemo(() => {
    if (!plannedRecipes || plannedRecipes.length === 0) {
      return { plannedFridgeItems: [], unplannedFridgeItems: fridgeItems };
    }
    const requiredProductIds = new Set();
    plannedRecipes.forEach(p => p.recipes.recipe_ingredients.forEach(i => requiredProductIds.add(i.product_id)));
    const planned = [], unplanned = [];
    fridgeItems.forEach(item => {
      if (requiredProductIds.has(item.product_id)) planned.push(item);
      else unplanned.push(item);
    });
    return { plannedFridgeItems: planned, unplannedFridgeItems: unplanned };
  }, [fridgeItems, plannedRecipes]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Fridge & Pantry</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <FridgeSearch onFridgeUpdate={fetchData} />
        </div>
        <div className="md:w-2/3">
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {!loading && !error && (
            <FridgeOverview
              plannedItems={plannedFridgeItems}
              unplannedItems={unplannedFridgeItems}
            />
          )}
        </div>
      </div>
    </div>
  );
} 