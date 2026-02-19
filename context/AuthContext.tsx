import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signInWithGoogle, signOut, consumeAdminAuthError, AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  authErrorCode: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        setAuthError(null);
        setAuthErrorCode(null);
      } else {
        const pendingAuthError = consumeAdminAuthError();
        setAuthError(pendingAuthError?.message || null);
        setAuthErrorCode(pendingAuthError?.code || null);
      }
    } catch (error) {
      // Silently fail - this is expected when Supabase is not configured
      console.warn('Error checking session (non-critical):', error);
      setUser(null);
      const pendingAuthError = consumeAdminAuthError();
      setAuthError(pendingAuthError?.message || null);
      setAuthErrorCode(pendingAuthError?.code || null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { user: authUser, error } = await signIn(email, password);
      if (error || !authUser) {
        setUser(null);
        setIsLoading(false);
        setAuthError(error?.message || 'Invalid email or password');
        const pendingAuthError = consumeAdminAuthError();
        setAuthErrorCode(pendingAuthError?.code || null);
        const msg = error?.message || '';
        if (msg.includes('not configured') || msg.includes('Supabase not configured')) {
          return { success: false, error: 'Admin login not configured. Add VITE_SUPABASE_ANON_KEY to GitHub Secrets.' };
        }
        if (msg.includes('Invalid API key')) {
          return { success: false, error: 'Invalid Supabase config. Add VITE_SUPABASE_ANON_KEY to GitHub Secrets and redeploy.' };
        }
        if (msg.includes('allowlisted') || msg.includes('restricted') || msg.includes('break-glass')) {
          return { success: false, error: msg };
        }
        return { success: false, error: msg || 'Invalid email or password' };
      }
      setUser(authUser);
      setAuthError(null);
      setAuthErrorCode(null);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsLoading(false);
      setAuthError('Invalid email or password');
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      setIsLoading(false);
      if (error) {
        const pendingAuthError = consumeAdminAuthError();
        const message = pendingAuthError?.message || error.message || 'Google sign-in failed';
        setAuthError(message);
        setAuthErrorCode(pendingAuthError?.code || null);
        return { success: false, error: message };
      }
      setAuthError(null);
      setAuthErrorCode(null);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      setAuthError('Google sign-in failed');
      return { success: false, error: 'Google sign-in failed' };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      setAuthError(null);
      setAuthErrorCode(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setAuthError(null);
      setAuthErrorCode(null);
      return;
    }
    const pendingAuthError = consumeAdminAuthError();
    setAuthError(pendingAuthError?.message || null);
    setAuthErrorCode(pendingAuthError?.code || null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        authError,
        authErrorCode,
        login,
        loginWithGoogle,
        logout,
        refreshUser,
        clearAuthError: () => {
          setAuthError(null);
          setAuthErrorCode(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
