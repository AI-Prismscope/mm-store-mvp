import { createClient } from '@supabase/supabase-js';

// This function only needs to read from the public `products` table,
// so we can use the simple admin client with the public anon key.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// The main Netlify handler boilerplate
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS', // This is a GET endpoint
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // We only want to handle GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  console.log('🔍 PRODUCT-SEARCH FUNCTION TRIGGERED');

  try {
    // The search term 'q' will be in the query string parameters
    const searchTerm = event.queryStringParameters.q;

    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term is provided, return an empty array.
      return { statusCode: 200, headers, body: JSON.stringify([]) };
    }

    console.log(`🔎 Searching for products matching: "${searchTerm}"`);

    // --- The Core Supabase Query ---
    // We select all columns from the 'products' table.
    // We use 'ilike' for a case-insensitive "contains" search.
    // The '%' are wildcards, so '%chicken%' matches "chicken breast", "chicken thighs", etc.
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .limit(10); // We limit the results to keep the preview fast and small.

    if (error) {
      throw error;
    }
    
    console.log(`✅ Found ${data.length} matching products.`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data), // Return the array of matching products
    };

  } catch (err) {
    console.error('❌ Top-level product-search error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' })
    };
  }
} 