// Supabase client setup para sa frontend
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://upzmsxbejrmaxfrnvgyl.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_5q1hBaU9ke6zhpifX13Otw_VpYhmfm_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
