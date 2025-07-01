import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

const FridgeContext = createContext();

export function FridgeProvider({ children }) {
  const { session } = useAuth();
  const [fridgeItems, setFridgeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFridgeItems = useCallback(async () => {
    if (!session) { setFridgeItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('fridge_items').select(`*, products(*, product_tags(tags(*)))`).order('id');
      if (error) throw error;
      setFridgeItems(data || []);
    } catch (error) { console.error("Error fetching fridge items:", error); } 
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => { fetchFridgeItems(); }, [fetchFridgeItems]);

  const updateFridgeQuantity = async (fridgeItemId, newQuantity) => {
    await fetch('/.netlify/functions/fridge-update-quantity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ fridge_item_id: fridgeItemId, new_quantity: newQuantity }),
    });
    await fetchFridgeItems();
  };

  const removeFridgeItem = async (fridgeItemId) => {
    await fetch('/.netlify/functions/fridge-remove-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ fridge_item_id: fridgeItemId }),
    });
    await fetchFridgeItems();
  };

  const value = { fridgeItems, loading, updateFridgeQuantity, removeFridgeItem, refetchFridge: fetchFridgeItems };

  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>;
}

// Custom hook for easy access
export function useFridge() {
  return useContext(FridgeContext);
} 