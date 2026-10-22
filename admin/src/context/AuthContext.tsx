import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, Profile, Artisan, UserRole } from '../types';

interface AdminAuthContextType {
  user: User | null;
  profile: Profile | null;
  artisan: Artisan | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = localStorage.getItem('rcg_admin_token') || localStorage.getItem('rcg_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.user && data.user.role === 'admin') {
        setUser(data.user);
        setProfile(data.profile);
        setArtisan(data.artisan);
      } else {
        // Not an admin role
        api.logout();
        setUser(null);
      }
    } catch {
      api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      if (res.user.role !== 'admin') {
        throw new Error('Access denied: Administrator privileges required.');
      }
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const res = await api.demoLogin('admin');
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setProfile(null);
    setArtisan(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        profile,
        artisan,
        role: user?.role || null,
        isAuthenticated: !!user && user.role === 'admin',
        loading,
        login,
        demoLogin,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
