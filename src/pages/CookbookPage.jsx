// src/pages/CookbookPage.jsx
import { useState, useEffect } from 'react'; // 👈 Add useEffect
import RecipeParserForm from '../components/RecipeParserForm';
import { supabase } from '../lib/supabaseClient'; // 👈 Import supabase

export default function CookbookPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [recipes, setRecipes] = useState([]); // 👈 Add state for recipes
  const [loading, setLoading] = useState(true);

  // 👇 This function will fetch the user's favorite recipes
  const fetchUserRecipes = async () => {
    setLoading(true);
    // This query fetches all recipes (*) related to the current user
    // through the user_favorite_recipes table. RLS handles the security.
    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .select('recipes(*)');

    if (data) {
      // The data is nested, so we extract the recipe objects
      setRecipes(data.map(item => item.recipes));
    }
    if (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  // 👇 Fetch recipes when the page first loads
  useEffect(() => {
    fetchUserRecipes();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Recipes</h1>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-purple-700"
        >
          + Add Recipe
        </button>
      </div>

      {/* 👇 This is the real recipe list now */}
      {loading ? (
        <p>Loading your cookbook...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold">{recipe.name}</h3>
            </div>
          ))}
          {recipes.length === 0 && <p>Your cookbook is empty. Add a recipe to get started!</p>}
        </div>
      )}

      {isFormVisible && (
        <RecipeParserForm 
          onClose={() => setIsFormVisible(false)} 
          onSaveSuccess={fetchUserRecipes} // 👈 Pass the fetch function as a prop
        />
      )}
    </div>
  );
}