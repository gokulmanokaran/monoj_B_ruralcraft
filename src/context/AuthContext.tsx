import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import type { User, Profile, Artisan, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  artisan: Artisan | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ user: User; profile: Profile; artisan: Artisan | null }>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: string;
    brand_name?: string;
    craft_type?: string;
    location?: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  verifyOtp: (email: string, token: string, pendingArtisan?: {
    brand_name: string; craft_type: string; location: string; phone: string; full_name: string;
  } | null) => Promise<{ user: User; profile: Profile; artisan: Artisan | null }>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserArtisan: (artisan: Artisan) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUser = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        setProfile(data.profile);
        setArtisan(data.artisan);
      } else {
        setUser(null);
        setProfile(null);
        setArtisan(null);
      }
    } catch (err) {
      console.warn('Session check warning:', err);
      setUser(null);
      setProfile(null);
      setArtisan(null);
    }
  };

  useEffect(() => {
    let initialized = false;

    const init = async () => {
      await loadUser();
      setLoading(false);
      initialized = true;
    };

    init();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!initialized) return; // avoid double-loading on startup

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const me = await api.getMe();
          if (me) {
            setUser(me.user);
            setProfile(me.profile);
            setArtisan(me.artisan);
          }
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setArtisan(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: string;
    brand_name?: string;
    craft_type?: string;
    location?: string;
  }) => {
    // Just call signUp — profile is created by DB trigger on_auth_user_created
    // Session won't be active until email is verified
    await api.register(data);
    // Don't set user here — wait for OTP verification
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) throw new Error(error.message);
    // Redirect happens automatically — no need to handle state here
  };

  const verifyOtp = async (
    email: string,
    token: string,
    pendingArtisan?: {
      brand_name: string; craft_type: string; location: string; phone: string; full_name: string;
    } | null
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Verification failed. Please try again.');

      // After verification, ensure profile exists (trigger may have created it already)
      // If artisan, create artisan record now
      if (pendingArtisan) {
        await api.ensureArtisanRecord(data.user.id, pendingArtisan);
      }

      const me = await api.getMe();
      if (!me) throw new Error('Could not load user profile after verification.');

      setUser(me.user);
      setProfile(me.profile);
      setArtisan(me.artisan);
      return me;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setArtisan(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserArtisan = (newArtisan: Artisan) => {
    setArtisan(newArtisan);
  };

  const refreshUser = async () => {
    const me = await api.getMe();
    if (me) {
      setUser(me.user);
      setProfile(me.profile);
      setArtisan(me.artisan);
    }
  };

  const role = user ? user.role : null;
  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        artisan,
        role,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        loginWithGoogle,
        verifyOtp,
        resendOtp,
        logout,
        updateUserArtisan,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
