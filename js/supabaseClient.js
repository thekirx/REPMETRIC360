// Supabase client setup para sa frontend
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables para sa Supabase config
// Sa Vercel, i-set ang VITE_SUPABASE_URL at VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

// Check kung may env vars
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Kulang ang Supabase environment variables!");
  console.error("I-set ang VITE_SUPABASE_URL at VITE_SUPABASE_ANON_KEY sa Vercel.");
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
