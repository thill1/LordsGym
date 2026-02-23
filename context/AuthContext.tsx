import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Session check runs in background; form shows immediately (no loading spinner)
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const TIMEOUT_MS = 3000;
    try {
      const currentUser = await Promise.race([
        getCurrentUser(),
        new Promise<AuthUser | null>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), TIMEOUT_MS)
        ),
      ]);
      setUser(currentUser);
    } catch (error) {
      // Silently fail - expected when Supabase not configured, invalid key, or timeout
      console.warn('Error checking session (non-critical):', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoggingIn(true);
      const LOGIN_TIMEOUT_MS = 15000;
    try {
      const { user: authUser, error } = await Promise.race([
        signIn(email, password),
        new Promise<{ user: AuthUser | null; error: Error | null }>((_, reject) =>
          setTimeout(() => reject(new Error('Login timed out. Paste your Supabase anon key below and retry.')), LOGIN_TIMEOUT_MS)
        ),
      ]);
      if (error || !authUser) {
        setUser(null);
        const msg = error?.message || '';
        if (msg.includes('not configured') || msg.includes('Supabase not configured')) {
          return { success: false, error: 'Supabase not configured. Paste your anon key below, or add VITE_SUPABASE_ANON_KEY to GitHub Secrets and redeploy.' };
        }
        if (msg.includes('Invalid API key')) {
          return { success: false, error: 'Invalid Supabase anon key. Paste the correct key below (from Supabase → Settings → API).' };
        }
        if (msg.includes('invalid_grant') || msg.includes('Invalid login credentials')) {
          return { success: false, error: 'Wrong email or password. Use lordsgymoutreach@gmail.com (not lordsjimaoutreach) and Admin2026!' };
        }
        if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('load failed')) {
          return { success: false, error: 'Network error: could not reach Supabase. Check your connection, try paste anon key below, or verify VITE_SUPABASE_URL.' };
        }
        return { success: false, error: msg || 'Invalid email or password' };
      }
      setUser(authUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      const errMsg = (error as Error)?.message || '';
      if (errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('load failed')) {
        return { success: false, error: 'Network error: could not reach Supabase. Check your connection, try paste anon key below, or verify VITE_SUPABASE_URL.' };
      }
      return { success: false, error: errMsg || 'Invalid email or password' };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggingIn,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser
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
