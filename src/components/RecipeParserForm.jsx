// src/components/RecipeParserForm.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // 👈 Import our auth hook

// We are now accepting a new prop, onSaveSuccess, to trigger a refresh
export default function RecipeParserForm({ onClose, onSaveSuccess }) {
  const { session } = useAuth(); // 👈 Get the user's session from context

  // --- State Management ---
  const [url, setUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [recipeData, setRecipeData] = useState(null);

  // --- API Call: Parse Recipe ---
  const handleParseRecipe = async (e) => {
    e.preventDefault();
    setIsParsing(true);
    setError(null);
    setRecipeData(null);

    try {
      const response = await fetch('/.netlify/functions/parse-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass the auth token so the function can check if the recipe is already saved
          'Authorization': `Bearer ${session?.access_token}`, 
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to parse recipe.');
      }

      const data = await response.json();
      setRecipeData(data); // Store the parsed data, including the `isAlreadySaved` flag
    } catch (err) {
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // --- API Call: Save Recipe ---
  const handleSaveRecipe = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The auth token is REQUIRED for saving
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save recipe.');
      }

      alert('Recipe saved successfully!');
      onSaveSuccess(); // 👈 Trigger the refresh function passed from the parent
      onClose(); // Close the modal
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Recipe</h2>
          <button onClick={onClose} className="text-2xl font-bold">×</button>
        </div>

        {/* --- Step 1: URL Input Form (Only shows if no recipe data is loaded) --- */}
        {!recipeData && (
          <form onSubmit={handleParseRecipe}>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Recipe URL</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="url" id="url" required value={url} onChange={(e) => setUrl(e.target.value)}
                className="block w-full rounded-none rounded-l-md border-gray-300"
                placeholder="https://..."
              />
              <button
                type="submit" disabled={isParsing}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200"
              >
                {isParsing ? 'Parsing...' : 'Fetch Recipe'}
              </button>
            </div>
          </form>
        )}
        
        {/* --- Step 2: Parsed Data Display (Shows after successful parse) --- */}
        {recipeData && (
          <div className="space-y-4">
            {/* We can make these fields editable later. For now, we just display the AI's output. */}
            <h3 className="text-xl font-bold">{recipeData.recipeName}</h3>
            <div>
              <h4 className="text-lg font-semibold">Ingredients</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                {recipeData.ingredients.map((ing, index) => (
                  <li key={index}>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Instructions</h4>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                {recipeData.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* --- Global Messages & Action Buttons --- */}
        {error && <p className="mt-4 text-center text-red-500 font-bold">{error}</p>}
        
        {recipeData && (
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} type="button" className="mr-3 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSaveRecipe}
              disabled={isSaving || recipeData.isAlreadySaved}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg shadow hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : recipeData.isAlreadySaved ? 'Already in Cookbook' : 'Save Recipe'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}