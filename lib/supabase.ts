import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client only if environment variables are set
// Otherwise, create a mock client that won't crash the app
let supabase: SupabaseClient;

if (isSupabaseConfigured()) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} else {
  if (import.meta.env.DEV) {
    console.warn('Supabase environment variables are not set. Using localStorage fallback.');
  }
  // Create a mock client that implements the SupabaseClient interface
  // but doesn't actually make any API calls
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } as any }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } as any }),
      updateUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } as any }),
      onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
      },
    } as any,
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
        download: async () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
        list: async () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
      }) as any,
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
      update: () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
      upsert: () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
      delete: () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
      eq: function() { return this; },
      neq: function() { return this; },
      in: function() { return this; },
      order: function() { return this; },
      single: function() { return Promise.resolve({ data: null, error: null }); },
    }) as any,
    functions: {
      invoke: async () => ({ data: null, error: { message: 'Supabase not configured' } as any }),
    } as any,
  } as any as SupabaseClient;
}

export { supabase };
