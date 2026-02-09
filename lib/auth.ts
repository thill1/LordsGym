// Authentication utilities using Supabase Auth
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  needsPasswordChange?: boolean;
}

/** Hardcoded fallback admin (temporary – replace with Supabase when ready) */
const FALLBACK_ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';
const FALLBACK_ADMIN_PASSWORD = 'admin2026';

/** Dev-only password: works in local dev (Vite DEV) or when Supabase is not configured */
const DEV_PASSWORDS = ['dev', 'admin123'];
const isDevMode = () => typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> => {
  // Hardcoded fallback: always works until you switch to Supabase (trim to avoid paste/space issues)
  const e = (email || '').trim().toLowerCase();
  const p = (password || '').trim();
  const fallbackMatch =
    e === FALLBACK_ADMIN_EMAIL.toLowerCase() &&
    (p === FALLBACK_ADMIN_PASSWORD || p === 'dev');
  if (fallbackMatch) {
    const fallbackUser: AuthUser = { id: 'fallback-admin', email: FALLBACK_ADMIN_EMAIL };
    localStorage.setItem('admin_auth', 'true');
    localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
    return { user: fallbackUser, error: null };
  }

  // Dev bypass: when running locally (npm run dev), any email + password "dev" or "admin123" logs in
  if (isDevMode() && DEV_PASSWORDS.includes(password)) {
    const fallbackUser: AuthUser = {
      id: 'local-admin',
      email: (email && email.trim()) || 'admin@lordsgym.com'
    };
    localStorage.setItem('admin_auth', 'true');
    localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
    return { user: fallbackUser, error: null };
  }

  if (!isSupabaseConfigured()) {
    return { user: null, error: new Error('Invalid credentials. Use password "dev" or "admin123" in dev mode.') };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error('No user data returned') };
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      needsPasswordChange: !!data.user.user_metadata?.needs_password_change,
    };

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  // Always clear dev/localStorage session so logout works when using dev bypass
  localStorage.removeItem('admin_auth');
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
  // LocalStorage session (hardcoded fallback or dev bypass) – check first so refresh keeps you in
  const auth = localStorage.getItem('admin_auth');
  const userStr = localStorage.getItem('admin_user');
  if (auth === 'true' && userStr) {
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

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
