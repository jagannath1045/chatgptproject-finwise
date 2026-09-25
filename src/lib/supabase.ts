import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The dashboard is designed to work as a local-first tracker as well as a
// Supabase-backed app. A valid placeholder lets the client boot in demo mode
// when a Vercel preview has not been connected to Supabase yet.
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
const clientUrl = supabaseUrl || "https://local-finwise.invalid";
const clientAnonKey = supabaseAnonKey || "local-demo-key";

export const supabase = createClient(clientUrl, clientAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const EDGE_FUNCTION_URL = `${clientUrl}/functions/v1/smart-endpoint`;
