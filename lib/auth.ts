// Authentication utilities using Supabase Auth
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  needsPasswordChange?: boolean;
  authMethod?: 'password' | 'google' | 'unknown';
  isAllowlisted?: boolean;
  isBreakGlass?: boolean;
}

/** Dev-only password: works in local dev (Vite DEV) or when Supabase is not configured */
const DEV_PASSWORDS = ['dev', 'admin123'];
const isDevMode = () => typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;
const ADMIN_ALLOWLIST_ENV = import.meta.env.VITE_ADMIN_ALLOWLIST_EMAILS || '';
const BREAK_GLASS_ADMIN_EMAIL_ENV = import.meta.env.VITE_BREAK_GLASS_ADMIN_EMAIL || 'lordsgymoutreach@gmail.com';
const ADMIN_OAUTH_REDIRECT_URL_ENV = import.meta.env.VITE_ADMIN_OAUTH_REDIRECT_URL || '';
const AUTH_ERROR_STORAGE_KEY = 'admin_auth_error';

const normalizeEmail = (value: string): string => (value || '').trim().toLowerCase();
const parseEmailAllowlist = (value: string): Set<string> =>
  new Set(value.split(',').map(normalizeEmail).filter(Boolean));

const ADMIN_ALLOWLIST = parseEmailAllowlist(ADMIN_ALLOWLIST_ENV);
const BREAK_GLASS_ADMIN_EMAIL = normalizeEmail(BREAK_GLASS_ADMIN_EMAIL_ENV);

const resolveAuthMethod = (user: {
  app_metadata?: Record<string, unknown> | null;
  identities?: Array<{ provider?: string }> | null;
}): 'password' | 'google' | 'unknown' => {
  const provider =
    String(user.app_metadata?.provider || user.identities?.[0]?.provider || '')
      .trim()
      .toLowerCase();
  if (provider === 'google') return 'google';
  if (provider) return 'password';
  return 'unknown';
};

const getGoogleRedirectUrl = (): string => {
  if (ADMIN_OAUTH_REDIRECT_URL_ENV.trim()) return ADMIN_OAUTH_REDIRECT_URL_ENV.trim();
  if (typeof window === 'undefined') return '/admin';
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  // Use a path-based callback for OAuth. Hash fragments are not reliable redirect URIs.
  return `${window.location.origin}${normalizedBase}admin`;
};

const isGoogleProviderNotEnabledError = (message: string): boolean => {
  const msg = String(message || '').trim().toLowerCase();
  return msg.includes('unsupported provider') || msg.includes('provider is not enabled');
};

const toAuthUser = (user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
  identities?: Array<{ provider?: string }> | null;
}): AuthUser => {
  const normalizedEmail = normalizeEmail(user.email || '');
  const isBreakGlass = isBreakGlassAdminEmail(normalizedEmail);
  return {
    id: user.id,
    email: user.email || '',
    needsPasswordChange: !!(user.user_metadata as { needs_password_change?: boolean } | null)?.needs_password_change,
    authMethod: resolveAuthMethod(user),
    isAllowlisted: isAdminEmailAllowlisted(normalizedEmail) || isBreakGlass,
    isBreakGlass,
  };
};

const createAdminAuthError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'AdminAuthError';
  return error;
};

const setAuthError = (code: string, message: string): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AUTH_ERROR_STORAGE_KEY, JSON.stringify({ code, message }));
};

const clearAuthError = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(AUTH_ERROR_STORAGE_KEY);
};

export const consumeAdminAuthError = (): { code: string; message: string } | null => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_ERROR_STORAGE_KEY);
  if (!raw) return null;
  localStorage.removeItem(AUTH_ERROR_STORAGE_KEY);
  try {
    const parsed = JSON.parse(raw) as { code?: string; message?: string };
    if (!parsed.code || !parsed.message) return null;
    return { code: parsed.code, message: parsed.message };
  } catch {
    return null;
  }
};

const isBreakGlassAdminEmail = (email: string): boolean => normalizeEmail(email) === BREAK_GLASS_ADMIN_EMAIL;

export const isAdminEmailAllowlisted = (email: string): boolean => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  // Safe fallback while allowing one emergency admin path if allowlist isn't configured yet.
  if (ADMIN_ALLOWLIST.size === 0) return normalizedEmail === BREAK_GLASS_ADMIN_EMAIL;
  return ADMIN_ALLOWLIST.has(normalizedEmail) || normalizedEmail === BREAK_GLASS_ADMIN_EMAIL;
};

export const getAdminAuthConfig = () => ({
  allowlistedEmails: Array.from(ADMIN_ALLOWLIST),
  breakGlassEmail: BREAK_GLASS_ADMIN_EMAIL,
  googleRedirectUrl: getGoogleRedirectUrl(),
});

export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    setAuthError('supabase_not_configured', 'Supabase not configured');
    return { error: new Error('Supabase not configured') };
  }

  try {
    const redirectTo = getGoogleRedirectUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      if (isGoogleProviderNotEnabledError(error.message)) {
        setAuthError(
          'google_provider_not_enabled',
          `Google sign-in is not enabled for this Supabase project. Enable it in Supabase Dashboard -> Authentication -> Providers -> Google, and add this redirect URL: ${redirectTo}`
        );
      } else {
        setAuthError('google_oauth_start_failed', error.message || 'Could not start Google sign-in');
      }
    } else {
      clearAuthError();
    }
    return { error: error || null };
  } catch (error) {
    const message = (error as Error).message || 'Could not start Google sign-in';
    if (isGoogleProviderNotEnabledError(message)) {
      setAuthError(
        'google_provider_not_enabled',
        `Google sign-in is not enabled for this Supabase project. Enable it in Supabase Dashboard -> Authentication -> Providers -> Google, and add this redirect URL: ${getGoogleRedirectUrl()}`
      );
    } else {
      setAuthError('google_oauth_start_failed', message);
    }
    return { error: error as Error };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> => {
  const e = (email || '').trim().toLowerCase();
  const p = (password || '').trim();

  // When Supabase is configured: always use real Supabase auth (required for RLS on calendar, etc.)
  if (isSupabaseConfigured()) {
    if (!isBreakGlassAdminEmail(e)) {
      setAuthError(
        'password_break_glass_only',
        'Password sign-in is restricted to the emergency admin account. Use Google sign-in for normal admin access.'
      );
      return {
        user: null,
        error: createAdminAuthError('Password sign-in is restricted to the emergency admin account. Use Google sign-in for normal admin access.'),
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: e || email,
        password: p
      });

      if (error) {
        return { user: null, error };
      }

      if (!data.user) {
        return { user: null, error: new Error('No user data returned') };
      }

      const user = toAuthUser(data.user);
      if (!isAdminEmailAllowlisted(user.email)) {
        setAuthError('allowlist_denied', 'This account is not allowlisted for admin access.');
        await supabase.auth.signOut();
        return {
          user: null,
          error: createAdminAuthError('This account is not allowlisted for admin access.'),
        };
      }

      if (!isBreakGlassAdminEmail(user.email)) {
        setAuthError('password_break_glass_only', 'Password sign-in is restricted to the emergency admin account.');
        await supabase.auth.signOut();
        return {
          user: null,
          error: createAdminAuthError('Password sign-in is restricted to the emergency admin account.'),
        };
      }

      clearAuthError();
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  // When Supabase NOT configured: dev bypass – any email + "dev" or "admin123" for local dev
  if (isDevMode() && DEV_PASSWORDS.includes(p)) {
    const fallbackUser: AuthUser = {
      id: 'local-admin',
      email: (email && email.trim()) || 'admin@lordsgym.com'
    };
    localStorage.setItem('admin_auth', 'true');
    localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
    clearAuthError();
    return { user: fallbackUser, error: null };
  }

  setAuthError('invalid_credentials', 'Invalid email or password.');
  return { user: null, error: new Error('Invalid credentials. Supabase not configured – use "dev" or "admin123" in dev.') };
}

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  // Always clear dev/localStorage session so logout works when using dev bypass
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('admin_user');
  clearAuthError();

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

      const authUser = toAuthUser(user);
      if (authUser.authMethod === 'google') {
        if (!isAdminEmailAllowlisted(authUser.email)) {
          setAuthError(
            'allowlist_denied',
            'Google authenticated successfully, but this account is not on the admin allowlist.'
          );
          await supabase.auth.signOut();
          return null;
        }
      } else if (!isBreakGlassAdminEmail(authUser.email)) {
        setAuthError(
          'password_break_glass_only',
          'Only the designated break-glass account can use password/email admin sessions.'
        );
        await supabase.auth.signOut();
        return null;
      }

      clearAuthError();
      return authUser;
    } catch (error) {
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
  if (!user) return false;
  if (!isSupabaseConfigured()) return true;
  return isAdminEmailAllowlisted(user.email);
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
