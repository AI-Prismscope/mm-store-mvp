// src/pages/CookbookPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import RecipeParserForm from '../components/RecipeParserForm';
import RecipeCard from '../components/RecipeCard'; // 👈 Import our new card
import { Link } from 'react-router-dom';

export default function CookbookPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // This function fetches only the recipes favorited by the current user
  const fetchUserRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .select('recipes(*)'); // This is a Supabase feature to "join" tables

    if (data) {
      // The data is nested like [{ recipes: {...} }], so we map to extract it
      const userRecipes = data.map(item => item.recipes).filter(Boolean); // filter(Boolean) removes any nulls
      setRecipes(userRecipes);
    }
    if (error) {
      console.error('Error fetching user recipes:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserRecipes();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Cookbook</h1>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition"
        >
          + Add Recipe
        </button>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <p>Loading your cookbook...</p>
      ) : (
        <>
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Link 
              to={`/recipe/${recipe.id}`} // The link destination uses the recipe's ID
              className="block bg-white rounded-lg shadow overflow-hidden group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700">Your cookbook is empty!</h3>
                <p className="text-gray-500 mt-2">Add a recipe from the web to get started.</p>
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition"
                >
                  Add Your First Recipe
                </button>
              </div>
            </Link>
          )}
        </>
      )}

      {/* The "Add Recipe" Modal Form */}
      {isFormVisible && (
        <RecipeParserForm 
          onClose={() => setIsFormVisible(false)} 
          onSaveSuccess={() => {
            fetchUserRecipes(); // Re-fetch the recipes after a new one is saved
            setIsFormVisible(false); // Also close the form
          }}
        />
      )}
    </div>
  );
}