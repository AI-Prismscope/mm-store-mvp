// netlify/functions/suggest-recipes.js
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }
  
  try {
    const jwt = event.headers.authorization?.split(' ')[1];
    if (!jwt) throw new Error('Authentication token is required.');
    
    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error('User not found or token invalid.');

    // 1. Fetch from BOTH cart and fridge in parallel for speed
    const [cartRes, fridgeRes] = await Promise.all([
      userSupabase.from('cart_items').select('product_id'),
      userSupabase.from('fridge_items').select('product_id')
    ]);

    if (cartRes.error) throw cartRes.error;
    if (fridgeRes.error) throw fridgeRes.error;

    // 2. Combine the inventories into a single Set of unique product IDs
    const cartProductIds = (cartRes.data || []).map(item => item.product_id);
    const fridgeProductIds = (fridgeRes.data || []).map(item => item.product_id);
    const userHaveProductIds = new Set([...cartProductIds, ...fridgeProductIds]);

    console.log(`User has ${userHaveProductIds.size} unique products available (cart + fridge).`);

    // 3. Get ALL recipes and their ingredients
    const { data: allRecipes, error: recipeError } = await adminSupabase.from('recipes').select(`id, name, image_url, recipe_ingredients(product_id)`);
    if (recipeError) throw recipeError;

    // 4. Run the "Match & Gap" algorithm using the combined inventory
    const scoredRecipes = (allRecipes || []).map(recipe => {
      if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) return null;
      
      const recipeProductIds = new Set(recipe.recipe_ingredients.map(ing => ing.product_id));
      
      // The `match_count` is now calculated against the combined `userHaveProductIds` set
      const match_count = [...recipeProductIds].filter(id => userHaveProductIds.has(id)).length;
      if (match_count === 0) return null;

      const gap_count = recipeProductIds.size - match_count;
      const final_score = match_count - gap_count;
      const match_percentage = (match_count / recipeProductIds.size) * 100;
      console.log('recipe name', recipe.name, 'match_percentage', match_percentage);
      return { id: recipe.id, name: recipe.name, image_url: recipe.image_url, score: final_score, matchCount: match_count, gapCount: gap_count, matchPercentage: match_percentage };

    }).filter(Boolean);

    // 5. Sort and return the top suggestions
    scoredRecipes.sort((a, b) => b.score - a.score);
    const topSuggestions = scoredRecipes.slice(0, 10);
    
    return { statusCode: 200, headers, body: JSON.stringify(topSuggestions) };

  } catch (err) {
    console.error('❌ suggest-recipes error:', err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: err.message || 'An unknown server error occurred.' }) 
    };
  }
}