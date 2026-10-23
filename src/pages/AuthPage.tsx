import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, User, Eye, EyeOff, Loader2, Palette,
  Mail, Lock, Phone, MapPin, Briefcase, ArrowLeft,
  ShieldCheck, KeyRound, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'login' | 'register' | 'otp-verify' | 'check-email';
type RegisterRole = 'customer' | 'artisan';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [role, setRole] = useState<RegisterRole>(
    (searchParams.get('role') as RegisterRole) || 'customer'
  );
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [brandName, setBrandName] = useState('');
  const [craftType, setCraftType] = useState('');
  const [location, setLocation] = useState('');

  // OTP verification
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  // Pending artisan data to create after OTP verification
  const [pendingArtisanData, setPendingArtisanData] = useState<null | {
    brand_name: string; craft_type: string; location: string; phone: string; full_name: string;
  }>(null);

  const { login, register, loginWithGoogle, verifyOtp, resendOtp } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { error('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const res = await login(email, password);
      success(`Welcome back, ${res.user.full_name}!`);
      if (res.user.role === 'artisan') navigate('/artisan');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        info('Please verify your email first. Sending OTP...');
        await handleResendOtp();
        setMode('otp-verify');
      } else {
        error(err.message || 'Sign in failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { error('Please enter your full name.'); return; }
    if (!email.trim()) { error('Please enter your email address.'); return; }
    if (password.length < 6) { error('Password must be at least 6 characters.'); return; }
    if (role === 'artisan' && !brandName.trim()) { error('Please enter your brand/workshop name.'); return; }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        role,
        brand_name: brandName.trim() || undefined,
        craft_type: craftType.trim() || undefined,
        location: location.trim() || undefined,
      });

      // Store artisan data for post-verification creation
      if (role === 'artisan') {
        setPendingArtisanData({
          brand_name: brandName.trim() || fullName.trim() + ' Crafts',
          craft_type: craftType.trim() || 'Traditional Crafts',
          location: location.trim() || 'India',
          phone: phone.trim() || '',
          full_name: fullName.trim(),
        });
      }

      // Show OTP verification screen
      setMode('otp-verify');
      setResendCountdown(60);
      info('A 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('already registered') || err.message?.toLowerCase().includes('user already registered')) {
        error('This email is already registered. Please sign in instead.');
        setMode('login');
      } else {
        error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { error('Please enter the 6-digit code from your email.'); return; }
    setOtpLoading(true);
    try {
      const res = await verifyOtp(email, otp, pendingArtisanData);
      success(`Welcome to RuralCraft Global, ${res.user.full_name}!`);
      if (res.user.role === 'artisan') navigate('/artisan');
      else navigate('/');
    } catch (err: any) {
      error(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await resendOtp(email);
      setResendCountdown(60);
      info('New verification code sent to your email.');
    } catch (err: any) {
      error(err.message || 'Could not resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Redirect happens via Supabase OAuth callback
    } catch (err: any) {
      error(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826] transition-colors';

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
            <div className="w-10 h-10 rounded-xl bg-[#DDA15E] flex items-center justify-center shadow-lg">
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
          <AnimatePresence mode="wait">

            {/* ── OTP VERIFY SCREEN ── */}
            {mode === 'otp-verify' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#143826]/10 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-8 h-8 text-[#143826]" />
                  </div>
                  <h2 className="font-heading font-bold text-xl text-stone-900">Verify Your Email</h2>
                  <p className="text-sm text-stone-500 mt-1">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-stone-700">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-3.5 border-2 border-stone-200 rounded-xl text-2xl font-bold tracking-[0.4em] text-center focus:outline-none focus:border-[#143826] focus:ring-2 focus:ring-[#143826]/20 transition-colors"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otp.length !== 6}
                    className="w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Verify & Continue
                  </button>
                </form>

                <div className="mt-4 text-center">
                  {resendCountdown > 0 ? (
                    <p className="text-sm text-stone-400">
                      Resend code in <span className="font-bold text-stone-600">{resendCountdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="text-sm text-[#BC6C25] hover:text-[#733F17] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => { setMode('register'); setOtp(''); }}
                    className="w-full text-xs text-stone-400 hover:text-stone-600 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to registration
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── LOGIN & REGISTER SCREENS ── */}
            {(mode === 'login' || mode === 'register') && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="p-8"
              >
                {/* Mode Tabs */}
                <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
                  {(['login', 'register'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        mode === m ? 'bg-white shadow-sm text-[#143826]' : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {m === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border-2 border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer mb-4 disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400 font-medium">or with email</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {/* Register Role Selector */}
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

                <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                  {/* Full Name (register only) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        <User className="w-3.5 h-3.5 inline mr-1" />Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Lakshmi Ammal"
                        className={inputCls}
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline mr-1" />Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      <Lock className="w-3.5 h-3.5 inline mr-1" />Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                        className={inputCls + ' pr-10'}
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

                  {/* Register-only extra fields */}
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          <Phone className="w-3.5 h-3.5 inline mr-1" />Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+91 94400 12345"
                          className={inputCls}
                        />
                      </div>

                      {role === 'artisan' && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                              <Briefcase className="w-3.5 h-3.5 inline mr-1" />Brand / Workshop Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={brandName}
                              onChange={e => setBrandName(e.target.value)}
                              placeholder="Lakshmi Handicrafts"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                              <Palette className="w-3.5 h-3.5 inline mr-1" />Craft Specialization
                            </label>
                            <input
                              type="text"
                              value={craftType}
                              onChange={e => setCraftType(e.target.value)}
                              placeholder="Bamboo Weaving, Terracotta..."
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                              <MapPin className="w-3.5 h-3.5 inline mr-1" />Village / Location
                            </label>
                            <input
                              type="text"
                              value={location}
                              onChange={e => setLocation(e.target.value)}
                              placeholder="Majuli Island, Assam"
                              className={inputCls}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                {/* Bottom nav */}
                <div className="mt-5 pt-4 border-t border-stone-100 text-center">
                  <Link to="/" className="text-xs text-stone-400 hover:text-[#143826] inline-flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Marketplace
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
