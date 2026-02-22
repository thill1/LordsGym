import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const TIMEOUT_MS = 8000; // Prevent infinite loading if Supabase hangs (bad key, network, etc.)
    try {
      const currentUser = await Promise.race([
        getCurrentUser(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), TIMEOUT_MS)
        ),
      ]);
      setUser(currentUser);
    } catch (error) {
      // Silently fail - expected when Supabase not configured, invalid key, or timeout
      console.warn('Error checking session (non-critical):', error);
      setUser(null);
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
        const msg = error?.message || '';
        if (msg.includes('not configured') || msg.includes('Supabase not configured')) {
          return { success: false, error: 'Supabase not configured. Paste your anon key below, or add VITE_SUPABASE_ANON_KEY to GitHub Secrets and redeploy.' };
        }
        if (msg.includes('Invalid API key')) {
          return { success: false, error: 'Invalid Supabase anon key. Paste the correct key below (from Supabase → Settings → API).' };
        }
        return { success: false, error: msg || 'Invalid email or password' };
      }
      setUser(authUser);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsLoading(false);
      const errMsg = (error as Error)?.message || '';
      return { success: false, error: errMsg || 'Invalid email or password' };
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
