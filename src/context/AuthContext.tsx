import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import type { User, Profile, Artisan, UserRole } from '../types';

const LOCAL_ADMIN_KEY = 'rc_admin_session';
const LOCAL_ADMIN_PROFILE_KEY = 'rc_admin_profile_data';

const FIXED_ADMIN_USER: User = {
  id: 'admin-fixed-id',
  email: 'admin@gmail.com',
  full_name: 'Customs Administrator',
  role: 'admin',
  phone: '+91 98765 43210',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
};

const FIXED_ADMIN_PROFILE: Profile = {
  id: 'admin-fixed-id',
  full_name: 'Customs Administrator',
  role: 'admin',
  phone: '+91 98765 43210',
  country: 'India',
  city: 'New Delhi',
  address_line: 'Artisan Enclave, Sector 4, New Delhi 110001, India',
  designation: 'Senior International Customs Officer & Platform Director',
  department: 'RuralCraft Global Trade & Customs Operations',
  iec_code: '0519048821',
  gstin: '07AAAAA0000A1Z5',
  bio: 'Certified customs operations officer orchestrating worldwide export clearance and cross-border trade for verified rural Indian artisan clusters.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
};

export const getStoredAdminProfile = (): Profile => {
  if (typeof window === 'undefined') return FIXED_ADMIN_PROFILE;
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_PROFILE_KEY);
    if (raw) {
      return { ...FIXED_ADMIN_PROFILE, ...JSON.parse(raw) };
    }
  } catch {}
  return FIXED_ADMIN_PROFILE;
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
  updateProfile: (updated: Partial<Profile>) => Promise<Profile>;
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

        const storedAdmin = isAdminEmail ? getStoredAdminProfile() : null;
        const authUser: User = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: prof?.full_name || storedAdmin?.full_name || (isAdminEmail ? 'Customs Administrator' : 'Customer'),
          phone: prof?.phone || storedAdmin?.phone,
          role,
          avatar_url: prof?.avatar_url || storedAdmin?.avatar_url
        };

        const resolvedProfile: Profile = isAdminEmail
          ? {
              ...storedAdmin,
              ...(prof || {}),
              id: sessionUser.id,
              full_name: prof?.full_name || storedAdmin?.full_name || authUser.full_name,
              role: 'admin'
            }
          : (prof || {
              id: sessionUser.id,
              full_name: authUser.full_name,
              role,
              country: 'India'
            });

        setUser(authUser);
        setProfile(resolvedProfile);
        setArtisan(art);
        return;
      }

      // 2. Check local admin session fallback
      if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
        const storedAdmin = getStoredAdminProfile();
        setUser({
          ...FIXED_ADMIN_USER,
          full_name: storedAdmin.full_name || FIXED_ADMIN_USER.full_name,
          phone: storedAdmin.phone || FIXED_ADMIN_USER.phone,
          avatar_url: storedAdmin.avatar_url || FIXED_ADMIN_USER.avatar_url
        });
        setProfile(storedAdmin);
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
        const storedAdmin = isAdminEmail ? getStoredAdminProfile() : null;

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: prof?.full_name || storedAdmin?.full_name || (isAdminEmail ? 'Customs Administrator' : 'Customer'),
          phone: prof?.phone || storedAdmin?.phone,
          role,
          avatar_url: prof?.avatar_url || storedAdmin?.avatar_url
        });
        setProfile(isAdminEmail ? { ...storedAdmin, ...(prof || {}), role: 'admin' } : (prof || null));
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
        const storedAdmin = getStoredAdminProfile();
        const adminUser: User = {
          ...FIXED_ADMIN_USER,
          full_name: storedAdmin.full_name || FIXED_ADMIN_USER.full_name,
          phone: storedAdmin.phone || FIXED_ADMIN_USER.phone,
          avatar_url: storedAdmin.avatar_url || FIXED_ADMIN_USER.avatar_url
        };
        setUser(adminUser);
        setProfile(storedAdmin);
        setArtisan(null);
        return {
          user: adminUser,
          profile: storedAdmin,
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

  const updateProfile = async (updated: Partial<Profile>): Promise<Profile> => {
    const isCurrentAdmin = (user?.role === 'admin') || (profile?.role === 'admin') || (user?.email === 'admin@gmail.com');
    const baseProfile = profile || (isCurrentAdmin ? getStoredAdminProfile() : {
      id: user?.id || 'user-id',
      full_name: user?.full_name || 'User',
      role: (user?.role || 'customer') as UserRole
    });

    const merged: Profile = {
      ...baseProfile,
      ...updated,
      id: baseProfile.id,
      role: baseProfile.role
    };

    // 1. Persist to Supabase if session active
    if (user?.id && user.id !== 'admin-fixed-id') {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: merged.full_name,
            phone: merged.phone,
            bio: merged.bio,
            avatar_url: merged.avatar_url,
            country: merged.country,
            city: merged.city,
            address_line: merged.address_line,
            role: merged.role
          });
      } catch (e) {
        console.warn('Supabase profile upsert warning:', e);
      }
    }

    // 2. Persist locally for admin profile data
    if (isCurrentAdmin && typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_ADMIN_PROFILE_KEY, JSON.stringify(merged));
      } catch {}
    }

    // 3. Update React states
    setProfile(merged);
    if (user) {
      setUser({
        ...user,
        full_name: merged.full_name || user.full_name,
        phone: merged.phone || user.phone,
        avatar_url: merged.avatar_url || user.avatar_url
      });
    }

    return merged;
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
      login, logout, updateProfile, updateUserArtisan, refreshUser
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
