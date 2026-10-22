import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, Profile, Artisan, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  artisan: Artisan | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string; role?: string; brand_name?: string; craft_type?: string; location?: string }) => Promise<void>;
  demoLogin: (role: 'customer' | 'artisan' | 'admin') => Promise<void>;
  logout: () => void;
  updateUserArtisan: (artisan: Artisan) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = localStorage.getItem('rcg_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
        setProfile(data.profile);
        setArtisan(data.artisan);
      } else {
        localStorage.removeItem('rcg_token');
      }
    } catch {
      localStorage.removeItem('rcg_token');
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
      localStorage.setItem('rcg_token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; phone?: string; role?: string; brand_name?: string; craft_type?: string; location?: string }) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('rcg_token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (roleToUse: 'customer' | 'artisan' | 'admin') => {
    setLoading(true);
    try {
      const res = await api.demoLogin(roleToUse);
      localStorage.setItem('rcg_token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      setArtisan(res.artisan);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rcg_token');
    setUser(null);
    setProfile(null);
    setArtisan(null);
  };

  const updateUserArtisan = (newArtisan: Artisan) => {
    setArtisan(newArtisan);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        artisan,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateUserArtisan
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
