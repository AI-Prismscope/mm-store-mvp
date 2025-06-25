// src/components/PlannedRecipeCard.jsx
import { useState } from 'react';

// A simple X icon for the close button
const DeleteIcon = () => (
  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// NEW: Icons for ingredient status
const CheckIcon = () => (
  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const MissingIcon = () => (
  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

// The component now accepts `cartItems` as a prop
export default function PlannedRecipeCard({ planItem, onRemove, cartItems }) {
  // `planItem` is the full row from our `meal_plan_recipes` table.
  // The actual recipe details are nested inside it.
  const recipe = planItem.recipes;
  const cartProductIds = new Set(cartItems.map(item => item.product_id));
  const [isExpanded, setIsExpanded] = useState(false);

  // This prevents the app from crashing if the recipe data is somehow missing
  if (!recipe) {
    return (
      <div className="bg-red-100 p-3 rounded-lg shadow text-red-700">
        Error: Could not load recipe data for this plan item.
      </div>
    );
  }

  return (
    <div onClick={() => setIsExpanded(!isExpanded)} className="bg-white p-4 rounded-lg shadow-md cursor-pointer">
      <div className="flex items-center space-x-4">
        {/* Left Side: Square Image */}
        <div className="flex-shrink-0 w-20 h-20">
          <img 
            src={recipe.image_url || 'https://via.placeholder.com/150'}
            alt={recipe.name}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        
        {/* Center: Recipe Details */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{recipe.name}</h3>
        </div>

        {/* Right Side: Delete Button */}
        <div className="flex-shrink-0">
          <button 
            // The onClick handler calls the `onRemove` function that was passed down as a prop,
            // sending back the unique ID of this specific meal plan entry.
            onClick={e => { e.stopPropagation(); onRemove(planItem.id); }}
            className="text-gray-400 hover:text-red-600 p-1 rounded-full transition-colors"
            title="Remove from plan"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
      {/* --- THE NEW EXPANDABLE INGREDIENT LIST --- */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-2 text-gray-700">Ingredients Needed:</h4>
          <ul className="space-y-2">
            {recipe.recipe_ingredients.map((ing) => {
              const haveIt = cartProductIds.has(ing.product_id);
              return (
                <li key={ing.id} className="flex items-center text-sm">
                  {haveIt ? <CheckIcon /> : <MissingIcon />}
                  <span className="ml-2 text-gray-800">
                    {ing.quantity && `${ing.quantity} `}
                    {ing.unit && `${ing.unit} `}
                    {ing.products.name}
                  </span>
                  {!haveIt && (
                    <span className="ml-3 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      Missing
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 