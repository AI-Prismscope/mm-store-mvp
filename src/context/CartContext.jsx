// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
      const rawCart = data || [];
      // Sort alphabetically by product name
      rawCart.sort((a, b) => {
        const nameA = a.products?.name || '';
        const nameB = b.products?.name || '';
        return nameA.localeCompare(nameB);
      });
      setCart(rawCart);
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

  // --- FUNCTION 1: Add or Update an Item ---
  // For MVP, keep refetch after add (since we don't know the new item's id)
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
      await fetchCart();
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // --- FUNCTION 2: Remove an Item (Optimistic UI) ---
  const removeItemFromCart = async (cartItemId) => {
    if (!session) return;
    const originalCart = [...cart];
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
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
    } catch (error) {
      setCart(originalCart);
      alert("Could not remove item. Please try again.");
      console.error("Error removing item from cart:", error);
    }
  };

  // --- FUNCTION 3: Update an Item's Quantity (Optimistic UI) ---
  const updateItemQuantity = async (cartItemId, newQuantity) => {
    if (!session) return;
    const originalCart = [...cart];
    setCart(prevCart =>
      newQuantity <= 0
        ? prevCart.filter(item => item.id !== cartItemId)
        : prevCart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item)
    );
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
    } catch (error) {
      setCart(originalCart);
      alert("Could not update item quantity. Please try again.");
      console.error("Error updating quantity:", error);
    }
  };

  // --- FUNCTION 4: Add Multiple Items (Batch) ---
  const addMultipleItemsToCart = async (items) => {
    if (!session) return;
    try {
      const response = await fetch('/.netlify/functions/cart-add-multiple-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) throw new Error('Failed to add multiple items to cart.');
      await fetchCart();
    } catch (error) {
      console.error('Error adding multiple items to cart:', error);
    }
  };

  // 👇 --- NEW: Calculate Subtotal using useMemo for efficiency --- 👇
  // This calculation will only re-run when the `cart` array changes.
  const cartSubtotal = useMemo(() => {
    // The .reduce() method is perfect for summing up values in an array.
    return cart.reduce((total, item) => {
      // For each item, multiply its price by its quantity and add it to the total.
      // We add a check to handle cases where a product or its price might be missing.
      const itemPrice = item.products?.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0); // The 0 here is the starting value for our total.
  }, [cart]);

  // The value object provided to all consuming components.
  // We now expose all our new functions.
  const value = {
    cart,
    cartItemCount: cart.reduce((total, item) => total + item.quantity, 0), // A more accurate item count
    cartSubtotal, // 👈 Expose the new subtotal value
    loading,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    refetchCart: fetchCart,
    addMultipleItemsToCart, // 👈 Expose the new batch add method
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to easily use the context
export function useCart() {
  return useContext(CartContext);
}