// netlify/functions/suggest-recipes.js
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function handler(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  
  try {
    const jwt = event.headers.authorization?.split(' ')[1];
    if (!jwt) throw new Error('Authentication token is required.');
    
    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    // 1. Get the user's current cart items (with a safety check)
    const { data: cartItems, error: cartError } = await userSupabase.from('cart_items').select('product_id');
    if(cartError) throw cartError;
    // 👇 DEFENSIVE CODING: Default to an empty array if cartItems is null or undefined
    const userProductIds = new Set((cartItems || []).map(item => item.product_id));
    console.log(`User has ${userProductIds.size} unique products in their cart.`);

    // 2. Get ALL recipes and their ingredients (with a safety check)
    const { data: allRecipes, error: recipeError } = await adminSupabase.from('recipes').select(`
      id, name, image_url,
      recipe_ingredients ( product_id )
    `);
    if(recipeError) throw recipeError;
    console.log(`Found ${allRecipes?.length || 0} total recipes to score.`);

    // 3. Run the "Match & Gap" algorithm (with a safety check)
    // 👇 DEFENSIVE CODING: Default to an empty array if allRecipes is null or undefined
    const scoredRecipes = (allRecipes || []).map(recipe => {
      // 👇 Safety check for recipes that might not have ingredients linked
      if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
        return null;
      }
      
      const recipeProductIds = new Set(recipe.recipe_ingredients.map(ing => ing.product_id));
      
      const match_count = [...recipeProductIds].filter(id => userProductIds.has(id)).length;
      if (match_count === 0) return null;

      const gap_count = recipeProductIds.size - match_count;
      const final_score = match_count - gap_count;

      return {
        id: recipe.id, name: recipe.name, image_url: recipe.image_url,
        score: final_score, matchCount: match_count, gapCount: gap_count
      };
    }).filter(Boolean);

    // 4. Sort and return the top 5 suggestions
    scoredRecipes.sort((a, b) => b.score - a.score);
    const topSuggestions = scoredRecipes.slice(0, 5);
    console.log(`Returning ${topSuggestions.length} suggestions.`);
    
    return { statusCode: 200, headers, body: JSON.stringify(topSuggestions) };

  } catch (err) {
    // 👇 ADDING A MORE DETAILED LOG
    console.error('❌ UNHANDLED ERROR in suggest-recipes:', err);
    return { 
      statusCode: 500, 
      headers, // You need to define headers here too
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' }) 
    };
  }
}