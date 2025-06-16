import { GoogleAuth } from 'google-auth-library';
import * as cheerio from 'cheerio';

// Helper function to get credentials, exactly like in your enrich function
function getGoogleCredentials() {
  const raw = process.env.GCP_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse GCP_SERVICE_ACCOUNT_JSON:', e);
    return null;
  }
}

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  console.log('🤖 PARSE-RECIPE FUNCTION TRIGGERED');

  try {
    const response = await runParse(event.body);
    return { ...response, headers };
  } catch (err) {
    console.error('❌ Top-level parse error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Unexpected error.' }),
    };
  }
}

async function runParse(body) {
  // Step 1: Receive URL & Check Environment Variables
  const { url } = JSON.parse(body);
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || 'us-central1';
  const modelId = process.env.GCP_MODEL_ID || 'gemini-1.5-flash-001';

  if (!url) throw new Error('Missing URL in request body');
  if (!projectId) throw new Error('Missing GCP_PROJECT_ID');
  if (!getGoogleCredentials()) throw new Error('Missing or invalid GCP_SERVICE_ACCOUNT_JSON');

  // Step 2: Scrape the Web Page
  console.log(`🕸️ Scraping text from: ${url}`);
  const pageResponse = await fetch(url);
  if (!pageResponse.ok) throw new Error(`Failed to fetch URL. Status: ${pageResponse.status}`);
  const html = await pageResponse.text();
  
  // Step 3: Pre-process and Filter the Scraped Data
  const $ = cheerio.load(html);
  const pageText = $('body').text().replace(/\s\s+/g, ' '); // Get body text and remove excessive whitespace
  console.log(`✅ Scraped and filtered ${pageText.length} characters.`);

  // Step 4: Call the LLM with a Prompt
  const auth = new GoogleAuth({
    credentials: getGoogleCredentials(),
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

  const systemPrompt = `Analyze the following recipe text and convert it into a valid JSON object.
  
  JSON Structure:
  - The root object must have keys: "recipeName", "prepTimeMinutes", "cookTimeMinutes", "servings", "instructions", "ingredients".
  - "instructions" must be an array of strings.
  - "ingredients" must be an array of objects, each with "quantity", "unit", and "name".
  - If a value is not found, use null.

  Ingredient Normalization Rules:
  - "name" MUST be generic and singular (e.g., "flour", "egg", "red onion").
  - Remove brand names, plurals, and non-essential descriptors.
  - "quantity" MUST be a numeric decimal value (e.g., 0.5, 0.25, 1.5).

  The entire output must be a single, minified JSON object and nothing else.`;

  console.log('🧠 Calling Google Gemini to parse recipe...');
  const aiRes = await client.request({
    url: apiUrl,
    method: 'POST',
    data: {
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nRecipe Text:\n${pageText}` }] }],
      generationConfig: {
        responseMimeType: 'application/json', // Requesting JSON output directly!
        temperature: 0.1, // Low temperature for deterministic, structured output
      }
    }
  });

  const rawResponse = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log(`📨 Gemini response received.`);

  // Step 5: Validate and Sanitize the AI's Response
  let parsedJson;
  try {
    parsedJson = JSON.parse(rawResponse);
  } catch (e) {
    console.error('❌ Failed to parse JSON from AI response:', rawResponse);
    throw new Error('AI returned invalid JSON format.');
  }

  // Schema Validation
  const requiredKeys = ['recipeName', 'ingredients', 'instructions'];
  for (const key of requiredKeys) {
    if (!(key in parsedJson)) {
      throw new Error(`AI response is missing required key: "${key}"`);
    }
  }
  if (!Array.isArray(parsedJson.ingredients)) {
    throw new Error('AI response "ingredients" field is not an array.');
  }
  
  console.log(`✅ Validation successful for recipe: "${parsedJson.recipeName}"`);

  // Return the clean, validated JSON to the frontend
  return {
    statusCode: 200,
    body: JSON.stringify({ ...parsedJson, sourceUrl: url }), // Add the sourceUrl back in for the frontend
  };
}