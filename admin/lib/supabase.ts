import { createClient } from "@supabase/supabase-js"

/** The easner-website Supabase project (never the banking one). Every read and write here is checked by RLS. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321"
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "missing-publishable-key"

export const SUPABASE_URL = supabaseUrl

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Sign-in is a 6-digit email code, never a link: nothing is ever read from the URL.
    flowType: "pkce",
    detectSessionInUrl: false,
    storageKey: "easner-admin-auth",
  },
  global: {
    headers: { "X-Client-Info": "easner-admin" },
  },
})

/** Public URL of a file in the `blog` bucket. */
export function blogFileUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return supabase.storage.from("blog").getPublicUrl(path).data.publicUrl
}
