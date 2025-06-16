// src/pages/RecipeDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams is the hook to get the :id from the URL
import { supabase } from '../lib/supabaseClient';

export default function RecipeDetailPage() {
  const { id } = useParams(); // 👈 Get the recipe ID from the URL
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return; // Don't run if there's no ID

      setLoading(true);
      setError(null);

      // This is our powerful Supabase query.
      // It fetches the recipe with the matching ID, AND it fetches all related
      // ingredients and their product names in a single network request.
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            products ( name )
          )
        `)
        .eq('id', id)
        .single(); // .single() expects exactly one result, which is perfect for an ID lookup

      if (error) {
        console.error("Error fetching recipe details:", error);
        setError(error.message);
      } else {
        setRecipe(data);
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id]); // This effect re-runs whenever the ID in the URL changes

  if (loading) {
    return <div className="p-8 text-center">Loading recipe...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }
  
  if (!recipe) {
    return <div className="p-8 text-center">Recipe not found.</div>;
  }

  // --- Render the Recipe Details ---
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg">
      <Link to="/my-recipes" className="text-purple-600 hover:underline mb-4 inline-block">← Back to Cookbook</Link>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
      
      {/* Optional: Display source URL if it exists */}
      {recipe.source_url && (
        <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 break-all">
          Source: {recipe.source_url}
        </a>
      )}

      {/* --- METADATA (Servings, Time, etc.) --- */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 my-6 border-y py-4">
        {recipe.servings && <p><span className="font-semibold">Servings:</span> {recipe.servings}</p>}
        {recipe.prep_time_minutes && <p><span className="font-semibold">Prep Time:</span> {recipe.prep_time_minutes} mins</p>}
        {recipe.cook_time_minutes && <p><span className="font-semibold">Cook Time:</span> {recipe.cook_time_minutes} mins</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* --- INGREDIENTS Column --- */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.recipe_ingredients.map((ing) => (
              <li key={ing.id} className="flex items-start">
                <input type="checkbox" className="mt-1 mr-2" />
                <span>
                  {ing.quantity && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} `}
                  {ing.products.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* --- INSTRUCTIONS Column --- */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
          <ol className="list-decimal list-inside space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="pl-2">{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}