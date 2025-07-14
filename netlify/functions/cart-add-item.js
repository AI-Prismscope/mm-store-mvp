import { createClient } from '@supabase/supabase-js';

// The main Netlify handler boilerplate
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }

  console.log('➕ CART-ADD-ITEM FUNCTION TRIGGERED');
  try {
    const { product_id, quantity = 1 } = JSON.parse(event.body);
    const roundedQuantity = Math.ceil(Number(quantity));
    const authHeader = event.headers.authorization;
    const jwt = authHeader?.split(' ')[1];

    if (!jwt) {
      throw new Error('Authentication token is required.');
    }
    if (!product_id) {
      throw new Error('Product ID is required.');
    }

    // Create a Supabase client that acts on behalf of the user
    const userSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) {
      throw new Error('User not found or token invalid.');
    }

    // Instead of multiple database calls, we make one single call
    // to a custom database function (a "Remote Procedure Call" or RPC).
    console.log(`🔄 Upserting product ${product_id} in user ${user.id}'s cart.`);
    
    const { data, error } = await userSupabase.rpc('upsert_cart_item', {
      p_product_id: product_id,
      p_user_id: user.id,
      p_quantity_to_add: roundedQuantity
    });

    if (error) {
      // If the RPC call itself fails, throw the error.
      throw error;
    }
    
    // The RPC returns the updated or newly inserted row, which we send back to the frontend.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data[0]) // RPC returns an array, so we take the first element.
    };

  } catch (err) {
    console.error('❌ Top-level cart-add-item error:', err);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' }) 
    };
  }
}