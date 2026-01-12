// Authentication utilities using Supabase Auth
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: 'admin' | 'editor' | 'member';
}

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage auth for development
    if (password === 'admin123') {
      const fallbackUser: AuthUser = {
        id: 'local-admin',
        email: 'admin@lordsgym.com',
        role: 'admin'
      };
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
      return { user: fallbackUser, error: null };
    }
    return { user: null, error: new Error('Invalid credentials') };
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

    // Get user role from user metadata or a separate table
    const userRole = data.user.user_metadata?.role || 'member';
    
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: userRole as 'admin' | 'editor' | 'member'
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
  if (!isSupabaseConfigured()) {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_user');
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

    const userRole = user.user_metadata?.role || 'member';
    
    return {
      id: user.id,
      email: user.email || '',
      role: userRole as 'admin' | 'editor' | 'member'
    };
  } catch (error) {
    // Silently fail - this is expected when Supabase is not configured
    console.warn('Error getting current user (non-critical):', error);
    return null;
  }
};

/**
 * Check if user has admin or editor role
 */
export const hasAdminAccess = (user: AuthUser | null): boolean => {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'editor';
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
