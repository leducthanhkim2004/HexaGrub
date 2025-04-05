import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: {
            getItem: (key) => {
              const item = localStorage.getItem(key);
              console.log('Getting item from storage:', key, item);
              return item;
            },
            setItem: (key, value) => {
              console.log('Setting item in storage:', key, value);
              localStorage.setItem(key, value);
            },
            removeItem: (key) => {
              console.log('Removing item from storage:', key);
              localStorage.removeItem(key);
            }
          }
        }
      }
    )

    // Set up auth state listener
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email);
        // Store session in localStorage
        if (session) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('supabase.auth.token');
      } else if (event === 'INITIAL_SESSION') {
        console.log('Initial session:', session);
        if (session) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        }
      }
    });

    // Check initial session
    supabaseInstance.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }
    });
  }
  return supabaseInstance
}

export const supabase = getSupabase()