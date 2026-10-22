import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Loader2, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin, loading } = useAdminAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('admin@ruralcraft.global');
  const [password, setPassword] = useState('admin123');

  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5173';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      success('Welcome to RuralCraft Global Admin Portal!');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Invalid administrator credentials');
    }
  };

  const handleDemo = async () => {
    try {
      await demoLogin();
      success('Logged in as Administrator (Dr. Vikramaditya Sen)');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] via-[#143826] to-[#1B4332] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#DDA15E] flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-[#0D2818]" />
            </div>
            <div className="text-left">
              <div className="font-heading font-black text-2xl text-white tracking-tight leading-none">
                RuralCraft
              </div>
              <div className="text-[11px] text-[#DDA15E] tracking-widest uppercase font-semibold mt-1">
                Admin Command Center
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-300">
            Secure Customs Automation & Global Platform Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-stone-100">
            <div>
              <h2 className="font-heading font-bold text-lg text-stone-900">Administrator Sign In</h2>
              <p className="text-xs text-stone-500">Enter your credentials to manage operations</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Vercel Deployment 2
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ruralcraft.global"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign In to Admin Panel
            </button>
          </form>

          {/* 1-Click Demo Login */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Fast Demo Verification
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={handleDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-[#DDA15E]/15 hover:bg-[#DDA15E]/25 text-[#733F17] border border-[#DDA15E]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#BC6C25]" />
              1-Click Demo Admin Login
            </button>
          </div>

          {/* Navigation to Main App */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <a
              href={mainAppUrl}
              className="inline-flex items-center gap-1.5 hover:text-[#143826] transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Customer & Artisan Marketplace
            </a>
            <a
              href={mainAppUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#BC6C25] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Live Shop <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
