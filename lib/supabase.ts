import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mrptukahxloqpdqiaxkb.supabase.co';
const STORAGE_KEY = 'lordsgym_supabase_anon_key';

function getAnonKey(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (fromEnv && typeof fromEnv === 'string') return fromEnv;
  return (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null) || '';
}

export function setSupabaseAnonKey(key: string): void {
  if (typeof localStorage !== 'undefined') {
    key = key.trim();
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
    _client = null as any;
  }
}

export function getSupabaseAnonKeyFromStorage(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
}

export const isSupabaseConfigured = (): boolean => !!(SUPABASE_URL && getAnonKey());

let _client: SupabaseClient | null = null;

function createSupabaseClient(anonKey: string): SupabaseClient {
  return createClient(SUPABASE_URL, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

const mockClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } } as any),
    signInWithOAuth: async () => ({ data: { provider: 'google', url: null }, error: { message: 'Supabase not configured' } } as any),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } } as any),
    updateUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } } as any),
    onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
    admin: { listUsers: async () => ({ data: { users: [] }, error: null }) },
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
      download: async () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: async () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
      list: async () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
    }),
  },
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
    update: () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
    upsert: () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
    delete: () => ({ data: null, error: { message: 'Supabase not configured' } } as any),
    eq: function () { return this; },
    neq: function () { return this; },
    in: function () { return this; },
    order: function () { return this; },
    single: () => Promise.resolve({ data: null, error: null }),
  }),
  functions: { invoke: async () => ({ data: null, error: { message: 'Supabase not configured' } } as any) },
} as any as SupabaseClient;

function getSupabase(): SupabaseClient {
  const key = getAnonKey();
  if (!key) return mockClient;
  if (_client) return _client;
  _client = createSupabaseClient(key);
  return _client;
}

// Invalidate cached client (e.g. after user sets anon key in UI)
export function resetSupabaseClient(): void {
  _client = null;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
