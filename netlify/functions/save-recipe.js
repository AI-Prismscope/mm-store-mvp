import { createClient } from '@supabase/supabase-js';

// This is our NEW "admin" client. It uses the powerful service_role key.
// It can bypass RLS and should ONLY be used on the backend.
const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using the new, secret key
);

// The main Netlify handler boilerplate
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: 'Method Not Allowed' }; }

  console.log('💾 SAVE-RECIPE FUNCTION TRIGGERED');
  try {
    const response = await runAuthenticatedSave(event);
    return { ...response, headers };
  } catch (err) {
    console.error('❌ Top-level save error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Unexpected error.' }) };
  }
}

// The core logic of the function
async function runAuthenticatedSave(event) {
  const recipeData = JSON.parse(event.body);
  const authHeader = event.headers.authorization;
  const jwt = authHeader?.split(' ')[1];

  if (!jwt) {
    throw new Error('Authentication token is required to save a recipe.');
  }

  // Create a Supabase client that acts ON BEHALF OF THE USER making the request
  const userSupabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY, // The public key is fine here
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );

  // Get the user from the token to validate it and get their ID
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) {
    throw new Error('User not found or token invalid.');
  }
  console.log(`💾 Received save request from user: ${user.id}`);

  // --- Step 1: Deduplicate or Create the Global Recipe using the ADMIN client ---
  let { data: existingRecipe } = await adminSupabase
    .from('recipes')
    .select('id')
    .eq('source_url', recipeData.sourceUrl)
    .maybeSingle();
  
  let recipeId;

  if (existingRecipe) {
    recipeId = existingRecipe.id;
    console.log(`✅ Recipe from ${recipeData.sourceUrl} already exists. Using ID: ${recipeId}`);
  } else {
    // --- If recipe is new, insert it and its ingredients using the ADMIN client ---
    console.log(`📝 Inserting new global recipe: "${recipeData.recipeName}"`);
    const { data: newRecipe, error: recipeError } = await adminSupabase
      .from('recipes')
      .insert({
        name: recipeData.recipeName,
        instructions: recipeData.instructions,
        prep_time_minutes: recipeData.prepTimeMinutes,
        cook_time_minutes: recipeData.cookTimeMinutes,
        servings: recipeData.servings,
        source_url: recipeData.sourceUrl
      })
      .select()
      .single();
    if (recipeError) throw recipeError;
    recipeId = newRecipe.id;
    console.log(`✅ New recipe saved with global ID: ${recipeId}`);

    // Now, perform the "V1 Brittle Link" for its ingredients, also with the ADMIN client
    const ingredientsToInsert = [];
    if (Array.isArray(recipeData.ingredients)) {
      const { data: products } = await adminSupabase.from('products').select('id, name');
      const productMap = new Map(products.map(p => [p.name.toLowerCase(), p.id]));

      for (const ingredient of recipeData.ingredients) {
        if (!ingredient.name) continue;
        const productId = productMap.get(ingredient.name.toLowerCase().trim());
        if (productId) {
          ingredientsToInsert.push({ recipe_id: recipeId, product_id: productId, quantity: ingredient.quantity, unit: ingredient.unit });
        } else {
          await adminSupabase.from('unmatched_ingredients').insert({ normalized_attempt: ingredient.name, source_recipe_id: recipeId });
        }
      }
    }
    if (ingredientsToInsert.length > 0) {
      console.log(`🔗 Linking ${ingredientsToInsert.length} ingredients to new recipe.`);
      const { error: ingredientsError } = await adminSupabase.from('recipe_ingredients').insert(ingredientsToInsert);
      if (ingredientsError) console.error("Warning: Error saving ingredients:", ingredientsError);
    }
  }

  // --- Step 2: Add the recipe to the user's personal favorites list using the USER client ---
  // This is where RLS matters. This request is made *as the user*.
  console.log(`❤️ Adding recipe ${recipeId} to favorites for user ${user.id}`);
  const { error: favoriteError } = await userSupabase
    .from('user_favorite_recipes')
    .insert({ user_id: user.id, recipe_id: recipeId });
  
  if (favoriteError && favoriteError.code !== '23505') { // '23505' is the code for unique_violation
    // If the error is anything other than "already exists," it's a real problem.
    throw favoriteError;
  }
  if (favoriteError?.code === '23505') {
    console.log('👍 User has already favorited this recipe. All good.');
  }

  console.log('🎉 Save process complete.');

  // --- Step 3: Return a success response ---
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'saved', recipeId: recipeId }),
  };
}