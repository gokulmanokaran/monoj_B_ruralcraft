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
      // 1. First check active Supabase Auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        // Fetch profile from Supabase
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();

        const userEmail = (sessionUser.email || '').trim().toLowerCase();
        const isAdminEmail = userEmail === 'admin@gmail.com';
        const role: UserRole = isAdminEmail ? 'admin' : (prof?.role === 'artisan' ? 'artisan' : 'customer');

        let art: Artisan | null = null;
        if (role === 'artisan') {
          const { data: artData } = await supabase
            .from('artisans')
            .select('*')
            .eq('user_id', sessionUser.id)
            .maybeSingle();
          art = artData;
        }

        const authUser: User = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: prof?.full_name || (isAdminEmail ? 'Administrator' : 'Customer'),
          phone: prof?.phone,
          role
        };

        setUser(authUser);
        setProfile(prof || {
          id: sessionUser.id,
          full_name: authUser.full_name,
          role,
          country: 'India'
        });
        setArtisan(art);
        return;
      }

      // 2. Check local admin session fallback
      if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
        setUser(FIXED_ADMIN_USER);
        setProfile(FIXED_ADMIN_PROFILE);
        setArtisan(null);
        return;
      }

      setUser(null);
      setProfile(null);
      setArtisan(null);
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

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const userEmail = (session.user.email || '').trim().toLowerCase();
        const isAdminEmail = userEmail === 'admin@gmail.com';
        const role: UserRole = isAdminEmail ? 'admin' : (prof?.role === 'artisan' ? 'artisan' : 'customer');

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: prof?.full_name || (isAdminEmail ? 'Administrator' : 'Customer'),
          phone: prof?.phone,
          role
        });
        setProfile(prof || null);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
          // Keep local admin intact
          return;
        }
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

      // Attempt Supabase Auth signInWithPassword first!
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      });

      if (!authError && authData?.user) {
        // Supabase Auth succeeded!
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_ADMIN_KEY);
        }

        let { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        // If admin email, ensure profile role is 'admin' in Supabase
        if (cleanEmail === 'admin@gmail.com') {
          if (!prof || prof.role !== 'admin') {
            const { data: updatedProf } = await supabase
              .from('profiles')
              .upsert({
                id: authData.user.id,
                full_name: 'Administrator',
                role: 'admin'
              })
              .select()
              .single();
            if (updatedProf) prof = updatedProf;
          }
        }

        const isAdminEmail = cleanEmail === 'admin@gmail.com';
        // Only admin@gmail.com can ever have admin role
        const role: UserRole = isAdminEmail ? 'admin' : (prof?.role === 'artisan' ? 'artisan' : 'customer');

        let art: Artisan | null = null;
        if (role === 'artisan') {
          const { data: artData } = await supabase
            .from('artisans')
            .select('*')
            .eq('user_id', authData.user.id)
            .maybeSingle();
          art = artData;
        }

        const authUser: User = {
          id: authData.user.id,
          email: authData.user.email || cleanEmail,
          full_name: prof?.full_name || (isAdminEmail ? 'Administrator' : 'Customer'),
          phone: prof?.phone,
          role
        };

        setUser(authUser);
        setProfile(prof || {
          id: authData.user.id,
          full_name: authUser.full_name,
          role,
          country: 'India'
        });
        setArtisan(art);
        return { user: authUser, profile: prof as Profile, artisan: art };
      }

      // If Supabase sign-in failed:
      // For admin@gmail.com / admin@123, fallback to direct admin session if not in Supabase Auth yet
      if (cleanEmail === 'admin@gmail.com' && pass === 'admin@123') {
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
      }

      // If wrong password or non-admin user failed
      throw new Error(authError?.message || 'Invalid email or password.');
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
    await loadUser();
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
