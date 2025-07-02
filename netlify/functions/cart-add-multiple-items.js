import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }

  try {
    const { items } = JSON.parse(event.body);
    const authHeader = event.headers.authorization;
    const jwt = authHeader?.split(' ')[1];

    if (!jwt) throw new Error('Authentication token is required.');
    if (!Array.isArray(items) || items.length === 0) throw new Error('No items provided.');

    // Create a Supabase client that acts on behalf of the user
    const userSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    // Batch upsert using the upsert_cart_item RPC for each item
    const results = await Promise.all(items.map(item =>
      userSupabase.rpc('upsert_cart_item', {
        p_product_id: item.product_id,
        p_user_id: user.id,
        p_quantity_to_add: item.quantity
      })
    ));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, added: results.length }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' }),
    };
  }
} 