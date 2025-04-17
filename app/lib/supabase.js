import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for interacting with your database
const createSupabaseClient = () => {
  if (typeof window !== 'undefined' && window.supabase) {
    return window.supabase;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'hexagrub-auth-token',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') {
            return null;
          }
          return window.localStorage.getItem(key);
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        },
      },
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: false,
      initOptions: {
        persistSession: true,
        autoRefreshToken: true,
        debug: false
      }
    },
    cookies: {
      name: 'hexagrub-auth',
      lifetime: 60 * 60 * 8, // 8 hours
      domain: typeof window !== 'undefined' ? window.location.hostname : '',
      path: '/',
      sameSite: 'Lax'
    }
  });

  if (typeof window !== 'undefined') {
    window.supabase = client;
  }

  return client;
};

export const supabase = createSupabaseClient();
export default supabase; 