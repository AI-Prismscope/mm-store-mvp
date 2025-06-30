// The complete code for: netlify/functions/cart-remove-item.js (DEBUGGING VERSION)

import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  // --- THE SPY ---
  // This is the most important line. We are logging the entire event object
  // as soon as the function starts, before any code can fail.
  console.log('🕵️‍♂️ --- RECEIVED EVENT OBJECT --- 🕵️‍♂️');
  console.log(JSON.stringify(event, null, 2));
  // ----------------------------------------------------

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }

  console.log('🗑️ CART-REMOVE-ITEM FUNCTION TRIGGERED');
  
  try {
    const { cart_item_id } = JSON.parse(event.body);
    const authHeader = event.headers.authorization;
    const jwt = authHeader?.split(' ')[1];

    if (!jwt) throw new Error('Authentication token is required.');
    if (!cart_item_id) throw new Error('A cart_item_id is required.');

    const userSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    const { error } = await userSupabase
      .from('cart_items')
      .delete()
      .eq('id', cart_item_id);

    if (error) throw error;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'deleted', id: cart_item_id }),
    };

  } catch (err) {
    console.error('❌ Top-level cart-remove-item error:', err);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' }) 
    };
  }
}