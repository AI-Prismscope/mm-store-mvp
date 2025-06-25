// The complete code for: scripts/enrich-products-spoonacular.js (V5 - Image-Only)

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

dotenv.config();

// --- Configuration ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const spoonacularKey = process.env.SPOONACULAR_API_KEY;

if (!supabaseUrl || !supabaseKey || !spoonacularKey) {
  console.error("❌ Error: Missing credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function enrichImages() {
  console.log("🚀 Starting image-only enrichment process...");

  // 1. Fetch all products from our database that don't have an image_url yet.
  const { data: productsToEnrich, error: fetchError } = await supabase
    .from('products')
    .select('id, name')
    .is('image_url', null);

  if (fetchError) {
    console.error("❌ Error fetching products from Supabase:", fetchError.message);
    return;
  }

  if (!productsToEnrich || productsToEnrich.length === 0) {
    console.log("✅ All products already have images. Nothing to do!");
    return;
  }

  console.log(`🖼️ Found ${productsToEnrich.length} products to enrich with images.`);

  // 2. Loop through each product and call the Spoonacular API for an image.
  for (const product of productsToEnrich) {
    try {
      console.log(`--- Searching for image for: "${product.name}" ---`);
      
      const apiUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(product.name)}&number=1&apiKey=${spoonacularKey}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`⚠️ API returned status ${response.status} for "${product.name}". Skipping.`);
        continue;
      }

      const data = await response.json();
      const result = data.results?.[0];
      
      if (result && result.image) {
        const imageUrl = `https://spoonacular.com/cdn/ingredients_500x500/${result.image}`;
        console.log(`  Found image: ${imageUrl}`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`  ❌ Failed to update Supabase for "${product.name}":`, updateError.message);
        } else {
          console.log(`  ✅ Successfully updated image for "${product.name}".`);
        }
      } else {
        console.log(`  🤔 No image found for "${product.name}".`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit delay

    } catch (err) {
      console.error(`An unexpected error occurred for product "${product.name}":`, err);
    }
  }

  console.log("🎉 Image enrichment process complete.");
}

// Run the function
enrichImages();