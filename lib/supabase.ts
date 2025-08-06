import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/authenticated users
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key (server-side only)
export const createAdminClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on server-side')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export default supabase
