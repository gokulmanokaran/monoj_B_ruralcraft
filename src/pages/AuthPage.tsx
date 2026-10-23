import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, User, Eye, EyeOff, Loader2, Palette, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'login' | 'register';
type RegisterRole = 'customer' | 'artisan';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [role, setRole] = useState<RegisterRole>((searchParams.get('role') as RegisterRole) || 'customer');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [brandName, setBrandName] = useState('');
  const [craftType, setCraftType] = useState('');
  const [location, setLocation] = useState('');

  const { login, register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        success('Welcome back!');
        if (res.user.role === 'artisan') {
          navigate('/artisan');
        } else {
          navigate('/');
        }
      } else {
        const res = await register({
          email,
          password,
          full_name: fullName,
          phone,
          role,
          brand_name: brandName || undefined,
          craft_type: craftType || undefined,
          location: location || undefined
        });
        success(`Welcome to RuralCraft Global!`);
        if (res.user.role === 'artisan') {
          navigate('/artisan');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      error(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] via-[#143826] to-[#1B4332] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#DDA15E] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#0D2818]" />
            </div>
            <div className="text-left">
              <div className="font-heading font-black text-xl text-white leading-none">RuralCraft Global</div>
              <div className="text-[10px] text-[#DDA15E] tracking-widest uppercase">Artisan E-Commerce Platform</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Mode Tabs */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m as AuthMode)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer capitalize ${
                  mode === m ? 'bg-white shadow-sm text-[#143826]' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Register Role */}
          {mode === 'register' && (
            <div className="mb-5">
              <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'customer', icon: User, label: 'International Customer', sub: 'Buy handmade crafts' },
                  { val: 'artisan', icon: Palette, label: 'Rural Artisan', sub: 'Sell my crafts globally' }
                ].map(({ val, icon: Icon, label, sub }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRole(val as RegisterRole)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      role === val ? 'border-[#143826] bg-[#143826]/5' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${role === val ? 'text-[#143826]' : 'text-stone-400'}`} />
                    <div className={`text-xs font-bold ${role === val ? 'text-[#143826]' : 'text-stone-700'}`}>{label}</div>
                    <div className="text-[10px] text-stone-400">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name *</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Lakshmi Ammal"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826]" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Address *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826] pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+91 94400 12345"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30" />
                </div>
                {role === 'artisan' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">Brand / Workshop Name</label>
                      <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
                        placeholder="Lakshmi Handicrafts"
                        className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">Craft Specialization</label>
                      <input type="text" value={craftType} onChange={e => setCraftType(e.target.value)}
                        placeholder="Bamboo Weaving, Terracotta..."
                        className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">Village / Location</label>
                      <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="Majuli Island, Assam"
                        className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30" />
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};
