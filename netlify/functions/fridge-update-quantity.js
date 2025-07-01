import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }
  console.log('🧊🔄 FRIDGE-UPDATE-QUANTITY FUNCTION TRIGGERED');
  try {
    const { fridge_item_id, new_quantity } = JSON.parse(event.body);
    const jwt = event.headers.authorization?.split(' ')[1];
    if (!jwt || !fridge_item_id || typeof new_quantity !== 'number') throw new Error('Auth token, fridge_item_id, and a numeric new_quantity are required.');
    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    if (new_quantity <= 0) {
      const { error } = await userSupabase.from('fridge_items').delete().eq('id', fridge_item_id);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'deleted', id: fridge_item_id }) };
    } else {
      const { data, error } = await userSupabase.from('fridge_items').update({ quantity: new_quantity }).eq('id', fridge_item_id).select().single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
  } catch (err) {
    console.error('❌ fridge-update-quantity error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' })
    };
  }
} 