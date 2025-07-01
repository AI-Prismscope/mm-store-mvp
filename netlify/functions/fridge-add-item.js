import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }

  console.log('🧊 FRIDGE-ADD-ITEM FUNCTION TRIGGERED');
  
  try {
    const { product_id, quantity = 1 } = JSON.parse(event.body);
    const authHeader = event.headers.authorization;
    const jwt = authHeader?.split(' ')[1];

    if (!jwt) throw new Error('Authentication token is required.');
    if (!product_id) throw new Error('Product ID is required.');

    const userSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    // We will call a custom database function to handle the "upsert" logic.
    console.log(`🔄 Upserting product ${product_id} in user ${user.id}'s fridge.`);
    const { data, error } = await userSupabase.rpc('upsert_fridge_item', {
      p_product_id: product_id,
      p_user_id: user.id,
      p_quantity_to_add: quantity
    });

    if (error) throw error;
    
    return { statusCode: 200, headers, body: JSON.stringify(data[0]) };
  } catch (err) {
    console.error('❌ Top-level fridge-add-item error:', err);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' }) 
    };
  }
} 