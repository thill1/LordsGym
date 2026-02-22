// Authentication utilities using Supabase Auth
import { supabase, isSupabaseConfigured, getSupabaseUrl, getAnonKey } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  needsPasswordChange?: boolean;
}

/** Dev-only passwords: work in local dev when Supabase is not configured */
const DEV_PASSWORDS = ['dev', 'admin123', 'Admin2026!'];
const isDevMode = () => typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;

/** Admin credentials for production fallback when Supabase unreachable */
const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';
const ADMIN_PASSWORD = 'Admin2026!';
const isNetworkError = (msg: string) =>
  /failed to fetch|network|load failed|timeout|522|connection/i.test(msg);

/** Try login via Cloudflare Pages Function proxy (different network path to Supabase) */
async function signInViaProxy(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${base}/api/auth-login`;
  const anonKey = getAnonKey();
  const supabaseUrl = getSupabaseUrl();
  if (!anonKey) return { user: null, error: new Error('No anon key') };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, supabaseUrl, anonKey }),
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
 * Tries: (1) direct Supabase, (2) proxy via Cloudflare, (3) dev/production fallback when unreachable.
 */
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> => {
  const e = (email || '').trim().toLowerCase();
  const p = (password || '').trim();
  const supabaseOk = isSupabaseConfigured();
  const isDev = isDevMode();

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

    const grantFallback = (id: string) => {
      const fallbackUser: AuthUser = { id, email: e || ADMIN_EMAIL };
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
      if (!isDev) localStorage.setItem('admin_network_fallback', 'true');
      return { user: fallbackUser, error: null };
    };

    const isInvalidKey = (msg: string) =>
      /invalid.*api.*key|invalid.*anon|invalid_grant|jwt/i.test(msg.toLowerCase());

    // Fast bypass: when credentials match known admin, try direct with short timeout.
    // If Supabase unreachable, grant access immediately (~4s) so user gets to dashboard.
    const isKnownAdmin = e === ADMIN_EMAIL && p === ADMIN_PASSWORD;
    const devBypassOk = isDev && DEV_PASSWORDS.includes(p);
    if (isKnownAdmin || devBypassOk) {
      const BYPASS_TIMEOUT_MS = 4000;
      try {
        const result = await Promise.race([
          tryDirect(),
          new Promise<{ user: AuthUser | null; error: Error | null }>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), BYPASS_TIMEOUT_MS)
          ),
        ]);
        if (result.user) return result;
        // Invalid API key + known admin: grant fallback so they can reach dashboard and fix config
        if (result.error && isKnownAdmin && isInvalidKey(result.error.message)) {
          return grantFallback('admin-fallback');
        }
        if (result.error) return { user: null, error: result.error };
      } catch (bypassErr: unknown) {
        const msg = ((bypassErr as Error)?.message || '').toLowerCase();
        if (msg === 'timeout' || isNetworkError(msg)) {
          return grantFallback(isKnownAdmin ? 'admin-fallback' : 'local-admin');
        }
        throw bypassErr;
      }
    }

    try {
      const result = await tryDirect();
      if (result.user) return result;
      if (result.error && isKnownAdmin && isInvalidKey(result.error.message)) {
        return grantFallback('admin-fallback');
      }
      if (result.error) return { user: null, error: result.error };
    } catch (error) {
      const err = error as Error;
      const msg = (err?.message || '').toLowerCase();

      // Try proxy when direct fails (Cloudflare edge may reach Supabase from different network path)
      if (isNetworkError(msg) && typeof fetch !== 'undefined') {
        try {
          const proxyResult = await signInViaProxy(e || email, p);
          if (proxyResult.user) return proxyResult;
        } catch (_) { /* fall through */ }
      }

      // Dev: allow bypass when Supabase unreachable
      if (isDev && DEV_PASSWORDS.includes(p) && isNetworkError(msg)) {
        return grantFallback('local-admin');
      }

      // Production: allow known admin when Supabase unreachable (CRUD may fail)
      if (!isDev && e === ADMIN_EMAIL && p === ADMIN_PASSWORD && isNetworkError(msg)) {
        return grantFallback('admin-fallback');
      }

      return { user: null, error: err };
    }
  }

  // When Supabase NOT configured: dev bypass – any email + "dev" or "admin123" for local dev
  if (isDev && DEV_PASSWORDS.includes(p)) {
    const fallbackUser: AuthUser = {
      id: 'local-admin',
      email: (email && email.trim()) || 'admin@lordsgym.com'
    };
    localStorage.setItem('admin_auth', 'true');
    localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
    return { user: fallbackUser, error: null };
  }

  return { user: null, error: new Error('Invalid credentials. Supabase not configured – use "dev", "admin123", or "Admin2026!" in dev.') };
}

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  // Always clear dev/localStorage session so logout works when using dev bypass
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_network_fallback');

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
      // When Supabase times out, honor admin-fallback so user stays logged in
      const fallback = localStorage.getItem('admin_network_fallback');
      const userStr = localStorage.getItem('admin_user');
      if (fallback === 'true' && userStr) {
        try {
          return JSON.parse(userStr) as AuthUser;
        } catch {
          /* invalid JSON */
        }
      }
      console.warn('Error getting current user (non-critical):', error);
      return null;
    }
  }

  // When Supabase NOT configured: dev bypass via localStorage
  const auth = localStorage.getItem('admin_auth');
  const userStr = localStorage.getItem('admin_user');
  if (auth === 'true' && userStr) {
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
