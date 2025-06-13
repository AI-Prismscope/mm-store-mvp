// netlify/functions/cart-reset.js
import { createClient } from '@supabase/supabase-js';

// Admin client to read from the public `products` table
const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function handler(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }

  console.log('🛒 CART-RESET FUNCTION TRIGGERED');
  try {
    const jwt = event.headers.authorization?.split(' ')[1];
    if (!jwt) throw new Error('Authentication token is required.');

    // Create a client that acts on behalf of the user
    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    
    // Get the user to ensure the token is valid
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    // 1. Delete all existing items from this user's cart
    console.log(`🗑️ Deleting old cart items for user ${user.id}`);
    const { error: deleteError } = await userSupabase.from('cart_items').delete().eq('user_id', user.id);
    if (deleteError) throw deleteError;

    // 2. Fetch a random set of products from the global table
    console.log('🛍️ Fetching 7 random products...');
    // This SQL function gets a random sample. It requires the "pg_tgrm" extension in Supabase, which is usually enabled by default.
    const { data: randomProducts, error: productsError } = await adminSupabase
      .rpc('get_random_products', { limit_count: 7 });
    if (productsError) throw productsError;

    // 3. Prepare the new cart items for insertion
    const newCartItems = randomProducts.map(product => ({
      user_id: user.id,
      product_id: product.id,
      quantity: 1, // Default to quantity 1 for the surplus items
    }));

    // 4. Insert the new items into the user's cart
    console.log(`➕ Adding ${newCartItems.length} new items to the cart.`);
    const { error: insertError } = await userSupabase.from('cart_items').insert(newCartItems);
    if (insertError) throw insertError;

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'reset', added: newCartItems.length }) };
  } catch (err) {
    console.error('❌ Top-level cart-reset error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Unexpected error.' }) };
  }
}