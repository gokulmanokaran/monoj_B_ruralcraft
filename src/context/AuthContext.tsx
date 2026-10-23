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
  }) => Promise<{ user: User; profile: Profile; artisan: Artisan | null }>;
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

  // Initialize and synchronize Supabase Auth session
  const initAuth = async () => {
    try {
      const data = await api.getMe();
      if (data && data.user) {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    // Listen to real-time Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const me = await api.getMe();
        if (me) {
          setUser(me.user);
          setProfile(me.profile);
          setArtisan(me.artisan);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setArtisan(null);
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
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
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
