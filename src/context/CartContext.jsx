// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // We need the user's session
import { supabase } from '../lib/supabaseClient';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { session } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // This function fetches the user's current cart items from the database.
  // It's wrapped in useCallback for performance optimization.
  const fetchCart = useCallback(async () => {
    if (!session) {
      setCart([]); // If user logs out, clear the cart
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)'); // Fetch cart items and their product details
      if (error) throw error;
      setCart(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Fetch the cart whenever the user's session changes (e.g., on login/logout).
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // --- NEW FUNCTION 1: Add or Update an Item ---
  // This calls the `cart-add-item` function we built, which handles upsert logic.
  const addItemToCart = async (productId, quantity = 1) => {
    if (!session) return;
    try {
      const response = await fetch('/.netlify/functions/cart-add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: quantity }),
      });
      if (!response.ok) throw new Error('Failed to add item to cart.');
      
      // On success, refetch the cart to show the new item/quantity.
      await fetchCart();
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // --- NEW FUNCTION 2: Remove an Item ---
  // This calls the `cart-remove-item` function.
  const removeItemFromCart = async (cartItemId) => {
    if (!session) return;
    try {
      const response = await fetch('/.netlify/functions/cart-remove-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ cart_item_id: cartItemId }),
      });
      if (!response.ok) throw new Error('Failed to remove item from cart.');
      
      // On success, refetch the cart.
      await fetchCart();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // --- NEW FUNCTION 3: Update an Item's Quantity ---
  // This calls the `cart-update-quantity` function.
  const updateItemQuantity = async (cartItemId, newQuantity) => {
    if (!session) return;
    try {
      const response = await fetch('/.netlify/functions/cart-update-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ cart_item_id: cartItemId, new_quantity: newQuantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity.');
      
      // On success, refetch the cart.
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // The value object provided to all consuming components.
  // We now expose all our new functions.
  const value = {
    cart,
    cartItemCount: cart.reduce((total, item) => total + item.quantity, 0), // A more accurate item count
    loading,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    refetchCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to easily use the context
export function useCart() {
  return useContext(CartContext);
}