// src/components/PlannedRecipeCard.jsx
import { useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { useCart } from '../context/CartContext';
import { useFridge } from '../context/FridgeContext';

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

// The component now accepts `cartItems` and `addItemToCart` as props
export default function PlannedRecipeCard({ planItem, onRemove, cartItems }) {
  const { addItemToCart, cart, addMultipleItemsToCart } = useCart();
  const { fridgeItems } = useFridge();
  // `planItem` is the full row from our `meal_plan_recipes` table.
  // The actual recipe details are nested inside it.
  const recipe = planItem.recipes;

  // --- QUANTITY-AWARE LOGIC ---
  // Map product_id to quantity in cart
  const cartQuantityMap = new Map(cart.map(item => [item.product_id, item.quantity]));

  const [isExpanded, setIsExpanded] = useState(false);
  const { openProductModal } = useUI();
  // --- NEW STATE FOR BULK ADD ---
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [addAllError, setAddAllError] = useState(null);
  const [addAllSuccess, setAddAllSuccess] = useState(false);

  // --- HELPER FUNCTION: Calculate missing ingredients ---
  const calculateMissingIngredients = (recipeIngredients, cartItems, fridgeItems) => {
    if (!Array.isArray(recipeIngredients) || !Array.isArray(cartItems) || !Array.isArray(fridgeItems)) {
      return [];
    }
    const cartQuantityMap = new Map(cartItems.map(item => [item.product_id, item.quantity]));
    const fridgeQuantityMap = new Map(fridgeItems.map(item => [item.product_id, item.quantity]));
    const missing = recipeIngredients
      .filter(ingredient => {
        if (!ingredient || !ingredient.product_id) return false;
        const quantityInCart = cartQuantityMap.get(ingredient.product_id) || 0;
        const quantityInFridge = fridgeQuantityMap.get(ingredient.product_id) || 0;
        // If quantity is a valid number and > 0, use normal logic
        if (typeof ingredient.quantity === 'number' && ingredient.quantity > 0) {
          const totalAvailable = quantityInCart + quantityInFridge;
          return totalAvailable < ingredient.quantity;
        }
        // If no valid quantity, mark as missing only if not present in cart or fridge
        return (quantityInCart + quantityInFridge) <= 0;
      })
      .map(ingredient => {
        const quantityInCart = cartQuantityMap.get(ingredient.product_id) || 0;
        const quantityInFridge = fridgeQuantityMap.get(ingredient.product_id) || 0;
        let quantityNeeded = 1;
        if (typeof ingredient.quantity === 'number' && ingredient.quantity > 0) {
          const totalAvailable = quantityInCart + quantityInFridge;
          quantityNeeded = ingredient.quantity - totalAvailable;
        }
        return {
          product_id: ingredient.product_id,
          product_name: ingredient.products?.name || 'Unknown Product',
          quantity_needed: quantityNeeded,
          unit: ingredient.unit,
          original_ingredient: ingredient
        };
      });
    return missing;
  };

  // --- EFFECT: Update missing ingredients when cart or recipe changes ---
  useEffect(() => {
    if (recipe?.recipe_ingredients) {
      const missing = calculateMissingIngredients(recipe.recipe_ingredients, cart, fridgeItems);
      setMissingIngredients(missing);
    }
  }, [recipe?.recipe_ingredients, cart, fridgeItems]);

  // --- HANDLER: Add all missing ingredients to cart (batch) ---
  const handleAddAllMissing = async () => {
    setIsAddingAll(true);
    setAddAllError(null);
    setAddAllSuccess(false);
    try {
      const items = missingIngredients.map(ing => ({
        product_id: ing.product_id,
        quantity: ing.quantity_needed,
      }));
      await addMultipleItemsToCart(items);
      setAddAllSuccess(true);
    } catch (err) {
      setAddAllError('Failed to add all missing ingredients. Please try again.');
    } finally {
      setIsAddingAll(false);
      setTimeout(() => setAddAllSuccess(false), 2000);
    }
  };

  // This prevents the app from crashing if the recipe data is somehow missing
  if (!recipe) {
    return (
      <div className="bg-red-100 p-3 rounded-lg shadow text-red-700">
        Error: Could not load recipe data for this plan item.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Main card header part - we add a cursor and onClick to toggle expansion */}
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center space-x-4 cursor-pointer">
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
          {/* --- ADD ALL MISSING BUTTON --- */}
          {missingIngredients.length > 0 && (
            <button
              onClick={handleAddAllMissing}
              disabled={isAddingAll}
              className="w-full bg-[#4CAF50] hover:bg-[#388e3c] disabled:bg-green-300 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 mb-4"
              aria-label={`Add all ${missingIngredients.length} missing ingredients to cart`}
            >
              {isAddingAll ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding Ingredients...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add All Missing ({missingIngredients.length})</span>
                </>
              )}
            </button>
          )}
          <ul className="space-y-2">
            {recipe.recipe_ingredients.map((ing) => {
              const quantityInCart = cartQuantityMap.get(ing.product_id) || 0;
              const quantityInFridge = (fridgeItems && Array.isArray(fridgeItems)) ? (fridgeItems.find(item => item.product_id === ing.product_id)?.quantity || 0) : 0;
              const hasValidQuantity = typeof ing.quantity === 'number' && ing.quantity > 0;
              let haveEnough;
              if (hasValidQuantity) {
                const totalAvailable = quantityInCart + quantityInFridge;
                haveEnough = totalAvailable >= ing.quantity;
              } else {
                haveEnough = (quantityInCart + quantityInFridge) > 0;
              }
              return (
                <li key={ing.id} className="flex items-center justify-between text-sm group">
                  <button
                    type="button"
                    onClick={() => openProductModal(ing.product_id)}
                    className="flex items-center flex-1 min-w-0 text-left focus:outline-none"
                  >
                    {haveEnough ? <CheckIcon /> : <MissingIcon />}
                    <span className="ml-2 text-gray-800 truncate group-hover:text-purple-600">
                      {hasValidQuantity && `${ing.quantity} `}
                      {ing.unit && `${ing.unit} `}
                      {ing.products.name}
                    </span>
                  </button>
                  <div className="flex items-center flex-shrink-0 ml-3">
                    {!haveEnough && (
                      <>
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          Missing
                        </span>
                        <button 
                          onClick={() => addItemToCart(ing.product_id, hasValidQuantity ? (ing.quantity - (quantityInCart + quantityInFridge)) : 1)}
                          className="ml-2 bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center hover:bg-green-200"
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 