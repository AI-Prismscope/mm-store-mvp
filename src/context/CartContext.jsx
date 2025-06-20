// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // We need the user's session
import { supabase } from '../lib/supabaseClient';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { session } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // This function fetches the user's current cart items from the database
  const fetchCart = useCallback(async () => {
    if (!session) return;
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

  // Fetch the cart whenever the user's session changes (i.e., on login/logout)
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // This function calls our serverless function to add an item
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
      
      // After successfully adding, refetch the cart to get the latest state
      await fetchCart();
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const value = {
    cart,
    cartItemCount: cart.length,
    loading,
    addItemToCart,
    refetchCart: fetchCart, // Expose the fetch function for other components to use
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to easily use the context
export function useCart() {
  return useContext(CartContext);
}