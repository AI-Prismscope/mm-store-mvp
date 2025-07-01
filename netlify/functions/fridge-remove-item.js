import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }
  console.log('🧊🗑️ FRIDGE-REMOVE-ITEM FUNCTION TRIGGERED');
  try {
    const { fridge_item_id } = JSON.parse(event.body);
    const jwt = event.headers.authorization?.split(' ')[1];
    if (!jwt || !fridge_item_id) throw new Error('Auth token and fridge_item_id are required.');
    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    const { error } = await userSupabase.from('fridge_items').delete().eq('id', fridge_item_id);
    if (error) throw error;
    
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'deleted', id: fridge_item_id }) };
  } catch (err) {
    console.error('❌ fridge-remove-item error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' })
    };
  }
} 