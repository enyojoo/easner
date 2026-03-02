import { createClient } from "@supabase/supabase-js"

// Use placeholders during build when env vars are missing (e.g. CI without secrets).
// At runtime, real env vars from Vercel/local .env will be used.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "X-Client-Info": "easner-website",
    },
  },
})
