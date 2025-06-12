// src/pages/CookbookPage.jsx

import { useState } from 'react';
import RecipeParserForm from '../components/RecipeParserForm'; // We will create this next

export default function CookbookPage() {
  // This state will control whether the "Add Recipe" form is visible
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Recipes</h1>
        {/* The button that opens our form */}
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition duration-300"
        >
          + Add Recipe
        </button>
      </div>

      {/* This is where the list of recipe cards will go later */}
      <div className="p-10 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-center text-gray-500">Your saved recipes will appear here.</p>
      </div>

      {/* --- The Magic Part --- */}
      {/* Conditionally render the form modal only when isFormVisible is true */}
      {isFormVisible && (
        <RecipeParserForm 
          // We pass a function to the form so it can tell this page to close it
          onClose={() => setIsFormVisible(false)} 
        />
      )}
    </div>
  );
}