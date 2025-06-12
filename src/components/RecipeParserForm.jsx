// src/components/RecipeParserForm.jsx

import { useState } from 'react';

export default function RecipeParserForm({ onClose }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipeData, setRecipeData] = useState(null); // This will hold the JSON from our function

  async function handleFetchRecipe(e) {
    e.preventDefault(); // Prevent the form from submitting traditionally
    setIsLoading(true);
    setError(null);
    setRecipeData(null);

    try {
      // We are calling the LIVE, DEPLOYED function endpoint
      const response = await fetch('/.netlify/functions/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch recipe.');
      }

      const data = await response.json();
      setRecipeData(data); // Success! Store the parsed data in our state
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Temporary handler for the save button
  function handleSaveRecipe() {
    alert("Save functionality will be built in the next step!");
    onClose(); // Close the modal for now
  }

  return (
    // This is the modal container: a backdrop and the form itself
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Recipe</h2>
          <button onClick={onClose} className="text-2xl font-bold">×</button>
        </div>

        {/* --- Initial Form State --- */}
        {!recipeData && (
          <form onSubmit={handleFetchRecipe}>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Recipe URL</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="url"
                id="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder="https://your-favorite-recipe.com/..."
              />
              <button
                type="submit"
                disabled={isLoading}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Fetching...' : 'Fetch Recipe'}
              </button>
            </div>
          </form>
        )}
        
        {/* --- Populated Form State --- */}
        {recipeData && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Recipe Name</label>
              <input type="text" defaultValue={recipeData.recipeName} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {recipeData.ingredients.map((ing, index) => (
                  <li key={index}>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Instructions</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                {recipeData.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* --- Global Messages & Actions --- */}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        
        {recipeData && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveRecipe}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-700 transition duration-300"
            >
              Save Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}