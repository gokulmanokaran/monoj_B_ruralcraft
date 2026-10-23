import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Eye, EyeOff, Loader2, Mail, Lock,
  ArrowLeft, Shield, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';

type LoginMode = 'customer' | 'admin';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect to correct area
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Reset fields when switching tabs
  const switchMode = (m: LoginMode) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setShowPass(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);

      if (mode === 'admin') {
        // Admin tab: must have admin role
        if (res.user.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access denied. Administrator privileges required.');
        }
        success(`Welcome, ${res.user.full_name}!`);
        navigate('/admin', { replace: true });
      } else {
        // Customer tab: block admin from using customer login
        if (res.user.role === 'admin') {
          await supabase.auth.signOut();
          throw new Error('Please use the Admin Login tab for administrator access.');
        }
        success(`Welcome back, ${res.user.full_name}!`);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      error(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = mode === 'admin';

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${
        isAdmin
          ? 'bg-gradient-to-br from-[#0D2818] via-[#143826] to-[#0D2818]'
          : 'bg-gradient-to-br from-[#1B4332] via-[#143826] to-[#0D2818]'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-[#DDA15E] flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-[#0D2818]" />
            </div>
            <div className="text-left">
              <div className="font-heading font-black text-xl text-white leading-none">RuralCraft Global</div>
              <div className="text-[10px] text-[#DDA15E] tracking-widest uppercase">Artisan E-Commerce Platform</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Tab Switcher */}
          <div className="flex border-b border-stone-100">
            <button
              onClick={() => switchMode('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all cursor-pointer ${
                mode === 'customer'
                  ? 'text-[#143826] border-b-2 border-[#143826] bg-[#143826]/5'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
            >
              <User className="w-4 h-4" />
              Customer Login
            </button>
            <button
              onClick={() => switchMode('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all cursor-pointer ${
                mode === 'admin'
                  ? 'text-[#DDA15E] border-b-2 border-[#DDA15E] bg-[#0D2818]/5'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </button>
          </div>

          {/* Form Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="p-8"
            >
              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isAdmin ? 'bg-[#DDA15E]' : 'bg-[#143826]'
                  }`}
                >
                  {isAdmin
                    ? <Shield className="w-5 h-5 text-[#0D2818]" />
                    : <User className="w-5 h-5 text-white" />
                  }
                </div>
                <div>
                  <h1 className="font-heading font-bold text-lg text-stone-900 leading-tight">
                    {isAdmin ? 'Administrator Sign In' : 'Customer Sign In'}
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isAdmin
                      ? 'Access the admin command center'
                      : 'Sign in to browse and shop'}
                  </p>
                </div>
                {isAdmin && (
                  <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Supabase Auth
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor={`${mode}-email`}
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id={`${mode}-email`}
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={isAdmin ? 'admin@gmail.com' : 'you@example.com'}
                      className={`w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                        isAdmin
                          ? 'focus:ring-[#DDA15E]/40 focus:border-[#DDA15E]'
                          : 'focus:ring-[#143826]/30 focus:border-[#143826]'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor={`${mode}-password`}
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id={`${mode}-password`}
                      type={showPass ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                        isAdmin
                          ? 'focus:ring-[#DDA15E]/40 focus:border-[#DDA15E]'
                          : 'focus:ring-[#143826]/30 focus:border-[#143826]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg mt-1 ${
                    isAdmin
                      ? 'bg-[#DDA15E] hover:bg-[#BC6C25] text-[#0D2818]'
                      : 'bg-[#143826] hover:bg-[#0D2818]'
                  }`}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : isAdmin
                      ? <Shield className="w-4 h-4" />
                      : <User className="w-4 h-4" />
                  }
                  {isAdmin ? 'Sign In to Admin Portal' : 'Sign In'}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 hover:text-[#143826] transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Marketplace
                </Link>
                <span>{isAdmin ? 'Protected Route' : 'Secured by Supabase'}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
