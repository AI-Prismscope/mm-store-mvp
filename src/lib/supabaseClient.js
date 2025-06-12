// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// 1. Get the variables directly from import.meta.env. This is Vite's way.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. A clear safety check. If these are missing, the app will fail on startup
//    with a very clear error message in the console.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("CRITICAL: Supabase URL or Anon Key is missing. Check your .env file.");
}

// 3. Create and export the single client instance for the entire frontend app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);