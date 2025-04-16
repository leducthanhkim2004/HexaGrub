import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single instance of Supabase client
let supabase;

if (!supabase) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'food-delivery-auth', // Unique storage key for this app
      persistSession: true, // Enable session persistence
      detectSessionInUrl: true, // Enable OAuth detection from URL
      autoRefreshToken: true, // Enable automatic token refresh
    },
  });
}

// Ensure we're exporting the same instance
export { supabase };

// Prevent multiple instances
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.supabase = window.supabase || supabase
}

export default supabase 