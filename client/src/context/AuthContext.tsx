import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { supabase } from '../services/supabase';

async function getSupabaseAdmin(): Promise<AdminUser | null> {
  if (!supabase) return null;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error('Could not verify the Supabase session.');
  const session = sessionData.session;
  if (!session) return null;

  let isAuthorized = false;
  const email = session.user.email?.toLowerCase();
  const adminEmails = ['akilanr05@gmail.com', 'aravindhjsc14@gmail.com'];

  try {
    const { data: authorized, error: authorizationError } = await supabase.rpc('is_admin');
    if (!authorizationError && authorized === true) {
      isAuthorized = true;
    }
  } catch {
    // Ignore RPC failure; fallback to admin email list below
  }

  // Fallback: If is_admin RPC has not been created or failed, verify against authorized admin emails
  if (!isAuthorized && email && adminEmails.includes(email)) {
    isAuthorized = true;
  }

  if (!isAuthorized || !session.user.email) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    username: typeof session.user.user_metadata.username === 'string'
      ? session.user.user_metadata.username
      : session.user.email.split('@')[0],
    role: 'admin',
    isActive: true,
  };
}

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateSubscription = supabase
      ? supabase.auth.onAuthStateChange(event => {
          if (event === 'SIGNED_OUT') setAdmin(null);
        }).data.subscription
      : null;

    getSupabaseAdmin()
      .then(user => setAdmin(user))
      .catch(() => setAdmin(null))
      .finally(() => setIsLoading(false));

    return () => authStateSubscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase authentication is not configured. Check the project URL and publishable key.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      if (error.name === 'AuthRetryableFetchError' || (error.status && error.status >= 500)) {
        throw new Error('Supabase authentication is temporarily unavailable. Check your connection and try again.');
      }
      throw new Error('Email or password is incorrect.');
    }
    if (!data.user) throw new Error('Supabase did not return an authenticated user.');

    try {
      const user = await getSupabaseAdmin();
      if (!user) {
        await supabase.auth.signOut();
        throw new Error('This Supabase account is not authorized to access the Admin Portal.');
      }
      setAdmin(user);
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }
  };

  const logout = async () => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Could not securely end the Supabase session.');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
