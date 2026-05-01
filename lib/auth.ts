// Authentication utilities using Supabase Auth
import { supabase, isSupabaseConfigured, getSupabaseUrl, hydrateSupabaseConfigFromServer } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  needsPasswordChange?: boolean;
}

/** Dev-only passwords: work in local dev when Supabase is not configured */
const DEV_PASSWORDS = ['dev'];
const isDevMode = () => typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;

const isNetworkError = (msg: string) =>
  /failed to fetch|network|load failed|timeout|522|connection/i.test(msg);

/** Try login via Cloudflare Pages Function proxy (different network path to Supabase) */
async function signInViaProxy(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${base}/api/auth-login`;
  if (!getSupabaseUrl()) return { user: null, error: new Error('Supabase not configured') };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await res.json();

  if (!res.ok) return { user: null, error: new Error(data.error || `Proxy returned ${res.status}`) };
  if (data.access_token && data.user) {
    await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token || '' });
    return {
      user: { id: data.user.id, email: data.user.email || '', needsPasswordChange: !!data.user.user_metadata?.needs_password_change },
      error: null,
    };
  }
  return { user: null, error: new Error(data.error || 'No session returned') };
}

/**
 * Sign in with email and password.
 * Tries: (1) direct Supabase, (2) proxy via Cloudflare.
 */
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> => {
  const e = (email || '').trim().toLowerCase();
  const p = (password || '').trim();
  let supabaseOk = isSupabaseConfigured();
  const isDev = isDevMode();

  if (!supabaseOk && typeof fetch !== 'undefined') {
    await hydrateSupabaseConfigFromServer();
    supabaseOk = isSupabaseConfigured();
  }

  // When Supabase is configured: try direct first, then proxy on network error
  if (supabaseOk) {
    const tryDirect = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: e || email,
        password: p,
      });
      if (error) return { user: null, error };
      if (!data.user) return { user: null, error: new Error('No user data returned') };
      return {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          needsPasswordChange: !!data.user.user_metadata?.needs_password_change,
        },
        error: null,
      };
    };

    try {
      const result = await tryDirect();
      if (result.user) return result;
      if (result.error) {
        const message = (result.error.message || '').toLowerCase();
        const isInvalidApiKey = message.includes('invalid api key');

        if (isInvalidApiKey && typeof fetch !== 'undefined') {
          await hydrateSupabaseConfigFromServer();
          const retryAfterHydrate = await tryDirect();
          if (retryAfterHydrate.user) return retryAfterHydrate;
        }

        if ((isNetworkError(message) || isInvalidApiKey) && typeof fetch !== 'undefined') {
          try {
            const proxyResult = await signInViaProxy(e || email, p);
            if (proxyResult.user) return proxyResult;
          } catch (_) { /* fall through */ }
        }

        return { user: null, error: result.error };
      }
    } catch (error: unknown) {
      const err = error as Error;
      const msg = (err?.message || '').toLowerCase();

      // Try proxy when direct fails (Cloudflare edge may reach Supabase from different network path)
      if (isNetworkError(msg) && typeof fetch !== 'undefined') {
        try {
          const proxyResult = await signInViaProxy(e || email, p);
          if (proxyResult.user) return proxyResult;
        } catch (_) { /* fall through */ }
      }

      return { user: null, error: err };
    }
  }

  // When Supabase NOT configured: dev bypass – any email + "dev" for local development only
  if (isDev && DEV_PASSWORDS.includes(p)) {
    const fallbackUser: AuthUser = {
      id: 'local-admin',
      email: (email && email.trim()) || 'admin@lordsgym.com'
    };
    localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
    return { user: fallbackUser, error: null };
  }

  return { user: null, error: new Error('Supabase is not configured for authentication.') };
}

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  // Always clear dev/localStorage session so logout works when using dev bypass
  localStorage.removeItem('admin_user');

  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  // When Supabase configured: use Supabase session (required for RLS)
  if (!isSupabaseConfigured() && typeof fetch !== 'undefined') {
    await hydrateSupabaseConfigFromServer();
  }

  if (isSupabaseConfigured()) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return {
        id: user.id,
        email: user.email || '',
        needsPasswordChange: !!user.user_metadata?.needs_password_change,
      };
    } catch (error) {
      console.warn('Error getting current user (non-critical):', error);
      return null;
    }
  }

  // When Supabase NOT configured: dev bypass via localStorage
  const userStr = localStorage.getItem('admin_user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Check if user is authenticated (has admin access)
 */
export const hasAdminAccess = (user: AuthUser | null): boolean => {
  return !!user;
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`
    });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Update password (and clear needs_password_change flag)
 */
export const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { needs_password_change: false },
    });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};
