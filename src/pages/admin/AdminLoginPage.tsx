import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Loader2, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loading, isAuthenticated, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as admin, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.profile?.role !== 'admin' && res.user?.role !== 'admin') {
          throw new Error('Access denied: Administrator privileges required for this portal.');
        }
        success('Welcome to RuralCraft Global Admin Portal!');
        navigate('/admin');
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name for administrator registration.');
        }
        await register({
          email,
          password,
          full_name: fullName.trim(),
          role: 'admin'
        });
        success('Administrator account registered in Supabase! Signing in...');
        // Attempt sign in
        try {
          const res = await login(email, password);
          if (res.profile?.role === 'admin' || res.user?.role === 'admin') {
            navigate('/admin');
          } else {
            setMode('login');
            info('Account created. Please sign in with your administrator credentials.');
          }
        } catch {
          setMode('login');
          info('Account created. If email confirmation is enabled, please verify your email before signing in.');
        }
      }
    } catch (err: any) {
      error(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
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
              <h2 className="font-heading font-bold text-lg text-stone-900">
                {mode === 'login' ? 'Administrator Sign In' : 'Register Administrator'}
              </h2>
              <p className="text-xs text-stone-500">
                {mode === 'login'
                  ? 'Enter your Supabase credentials to access operations'
                  : 'Create a new authorized administrator profile'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Supabase Auth
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Administrator Name"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30"
                  />
                </div>
              </div>
            )}

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
                  placeholder="admin@example.com"
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
              disabled={loading || submitting}
              className="w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg mt-2"
            >
              {loading || submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === 'login' ? 'Sign In to Admin Panel' : 'Register Administrator'}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 pt-4 border-t border-stone-100 text-center">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-[#BC6C25] hover:text-[#733F17] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Need to create an administrator account?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#143826] hover:text-[#0D2818] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Already have an administrator account? Sign In
              </button>
            )}
          </div>

          {/* Navigation to Main Marketplace */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-[#143826] transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Marketplace
            </Link>
            <span className="text-[11px] text-stone-400">
              Protected Route
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
