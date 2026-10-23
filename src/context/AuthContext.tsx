import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import type { User, Profile, Artisan, UserRole } from '../types';

const LOCAL_ADMIN_KEY = 'rc_admin_session';

const FIXED_ADMIN_USER: User = {
  id: 'admin-fixed-id',
  email: 'admin@gmail.com',
  full_name: 'Administrator',
  role: 'admin',
  phone: '+91 98765 43210'
};

const FIXED_ADMIN_PROFILE: Profile = {
  id: 'admin-fixed-id',
  full_name: 'Administrator',
  role: 'admin',
  phone: '+91 98765 43210',
  country: 'India'
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  artisan: Artisan | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ user: User; profile: Profile; artisan: Artisan | null }>;
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
      // Check for direct local admin session first (no Supabase account needed)
      if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
        setUser(FIXED_ADMIN_USER);
        setProfile(FIXED_ADMIN_PROFILE);
        setArtisan(null);
        return;
      }

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
    } catch {
      setUser(null);
      setProfile(null);
      setArtisan(null);
    }
  };

  useEffect(() => {
    let ready = false;

    const init = async () => {
      await loadUser();
      setLoading(false);
      ready = true;
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!ready) return;

      // When local admin is active, keep local session intact
      if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        const me = await api.getMe();
        if (me) {
          setUser(me.user);
          setProfile(me.profile);
          setArtisan(me.artisan);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setArtisan(null);
        setLoading(false);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Direct Admin Login (admin@gmail.com / admin@123) without requiring Supabase auth
      if (cleanEmail === 'admin@gmail.com') {
        if (pass === 'admin@123') {
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
          }
          setUser(FIXED_ADMIN_USER);
          setProfile(FIXED_ADMIN_PROFILE);
          setArtisan(null);
          return {
            user: FIXED_ADMIN_USER,
            profile: FIXED_ADMIN_PROFILE,
            artisan: null
          };
        } else {
          throw new Error('Invalid password. Please use admin@123');
        }
      }

      // Customer login via Supabase Auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_ADMIN_KEY);
      }
      const res = await api.login(email, pass);
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_ADMIN_KEY);
      }
      await supabase.auth.signOut().catch(() => {});
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
    if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
      setUser(FIXED_ADMIN_USER);
      setProfile(FIXED_ADMIN_PROFILE);
      setArtisan(null);
      return;
    }

    const me = await api.getMe();
    if (me) {
      setUser(me.user);
      setProfile(me.profile);
      setArtisan(me.artisan);
    }
  };

  const role = user?.role ?? null;
  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, profile, artisan, role,
      isAuthenticated, isAdmin, loading,
      login, logout, updateUserArtisan, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
