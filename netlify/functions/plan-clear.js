import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }
  
  console.log('📝 PLAN-CLEAR FUNCTION TRIGGERED');
  try {
    const jwt = event.headers.authorization?.split(' ')[1];
    if (!jwt) throw new Error('Authentication token is required.');

    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    // We assume we are clearing today's plan.
    // In a more advanced version, we might pass a specific plan_date.
    const today = new Date().toISOString().slice(0, 10);
    
    // Delete all of the user's meal plan entries for today.
    const { error } = await userSupabase.from('meal_plan_recipes').delete().eq('user_id', user.id).eq('plan_date', today);
    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'cleared' }) };
  } catch (err) {
    console.error('❌ plan-clear error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' })
    };
  }
} 