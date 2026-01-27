// Authentication utilities using Supabase Auth
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
}

/** Dev-only password: works in local dev (Vite DEV) or when Supabase is not configured */
const DEV_PASSWORDS = ['dev', 'admin123'];
const isDevMode = () => typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> => {
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
      email: data.user.email || ''
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
  // Dev session: when running locally, respect localStorage dev login so refresh keeps you in
  if (isDevMode()) {
    const auth = localStorage.getItem('admin_auth');
    const userStr = localStorage.getItem('admin_user');
    if (auth === 'true' && userStr) {
      try {
        return JSON.parse(userStr) as AuthUser;
      } catch {
        return null;
      }
    }
    if (!isSupabaseConfigured()) return null;
  }

  if (!isSupabaseConfigured()) {
    const auth = localStorage.getItem('admin_auth');
    const userStr = localStorage.getItem('admin_user');
    if (auth === 'true' && userStr) {
      return JSON.parse(userStr) as AuthUser;
    }
    return null;
  }

  try {
    // Only try to get user if Supabase is actually configured
    // The placeholder client will fail, so we need to check first
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || ''
    };
  } catch (error) {
    // Silently fail - this is expected when Supabase is not configured
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
 * Update password
 */
export const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};
