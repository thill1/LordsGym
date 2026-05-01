import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ktzvzossoyyfvexkgagm.supabase.co';
const STORAGE_KEY = 'lordsgym_supabase_anon_key';
const STORAGE_URL_KEY = 'lordsgym_supabase_url';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractProjectRefFromSupabaseUrl(url: string): string | null {
  const match = url.match(/^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/i);
  return match?.[1] || null;
}

function keyMatchesSupabaseUrl(token: string, supabaseUrl: string): boolean {
  const expectedRef = extractProjectRefFromSupabaseUrl(supabaseUrl);
  if (!expectedRef) return true;
  const payload = parseJwtPayload(token);
  const tokenRef = payload?.ref;
  return typeof tokenRef === 'string' ? tokenRef === expectedRef : true;
}

export function getSupabaseUrl(): string {
  try {
    const fromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
    if (fromStorage && fromStorage.trim()) return fromStorage.trim();
  } catch (_) {}
  return import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

/** @deprecated Use getSupabaseUrl() for dynamic URL (respects localStorage override) */
export const SUPABASE_URL = DEFAULT_SUPABASE_URL;

export function setSupabaseUrl(url: string): void {
  if (typeof localStorage !== 'undefined') {
    url = url.trim();
    if (url) localStorage.setItem(STORAGE_URL_KEY, url);
    else localStorage.removeItem(STORAGE_URL_KEY);
    _client = null as any;
  }
}

export function getAnonKey(): string {
  const currentUrl = getSupabaseUrl();
  // localStorage override wins only when it matches current project URL.
  // This avoids stale key lock-in after project cutovers.
  try {
    const fromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (fromStorage && typeof fromStorage === 'string' && fromStorage.trim()) {
      const normalized = fromStorage.trim();
      if (keyMatchesSupabaseUrl(normalized, currentUrl)) return normalized;
    }
  } catch (_) {}
  const fromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    const normalized = fromEnv.trim();
    if (keyMatchesSupabaseUrl(normalized, currentUrl)) return normalized;
  }
  return '';
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

export const isSupabaseConfigured = (): boolean => !!(getSupabaseUrl() && getAnonKey());

let _client: SupabaseClient | null = null;

function createSupabaseClient(anonKey: string): SupabaseClient {
  return createClient(getSupabaseUrl(), anonKey, {
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

/**
 * Self-heal Supabase public config from runtime server env.
 * Useful when a stale build-time key is deployed but Pages runtime env is correct.
 */
export async function hydrateSupabaseConfigFromServer(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return false;
  try {
    const res = await fetch('/api/public-supabase-config', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { supabaseUrl?: string; anonKey?: string };
    const supabaseUrl = (data.supabaseUrl || '').trim();
    const anonKey = (data.anonKey || '').trim();
    if (!supabaseUrl || !anonKey) return false;
    if (!keyMatchesSupabaseUrl(anonKey, supabaseUrl)) return false;
    setSupabaseUrl(supabaseUrl);
    setSupabaseAnonKey(anonKey);
    return true;
  } catch {
    return false;
  }
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
