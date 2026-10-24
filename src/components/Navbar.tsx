import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, User, LogOut,
  Leaf, ChevronDown, Package, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CurrencySelector } from './CurrencySelector';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, role, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Explore Products', href: '/explore' },
    { label: 'Meet Artisans', href: '/artisans' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Our Story', href: '/#about' }
  ];

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'artisan') return '/artisan';
    return '/account';
  };

  const getDashboardLabel = () => {
    if (role === 'admin') return 'Admin Command Center';
    if (role === 'artisan') return 'Artisan Studio';
    return 'My Account & Orders';
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-0'
            : 'bg-white/80 backdrop-blur-sm border-b border-stone-200/40 py-1'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 relative">
            {/* ============================================================== */}
            {/* LEFT: Logo / Brand */}
            {/* ============================================================== */}
            <div className="flex items-center shrink-0">
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#143826] flex items-center justify-center group-hover:bg-[#2D6A4F] transition-colors shadow-sm shrink-0">
                  <Leaf className="w-5 h-5 text-[#DDA15E]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-lg sm:text-xl text-[#143826] leading-none tracking-tight">
                    RuralCraft
                  </span>
                  <span className="text-[10px] font-bold text-[#BC6C25] tracking-widest uppercase leading-none mt-1">
                    Global
                  </span>
                </div>
              </Link>
            </div>

            {/* ============================================================== */}
            {/* CENTER: Navigation links (Centered on Desktop & Laptop) */}
            {/* ============================================================== */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    location.pathname === link.href
                      ? 'text-[#143826] bg-[#143826]/10 font-bold'
                      : 'text-stone-700 hover:text-[#143826] hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ============================================================== */}
            {/* RIGHT: Search, Currency, Cart, User / Login, Hamburger */}
            {/* ============================================================== */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* 1. Search button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 sm:p-2.5 rounded-xl text-stone-600 hover:text-[#143826] hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center ${
                  searchOpen ? 'bg-stone-100 text-[#143826]' : ''
                }`}
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* 2. Currency selector */}
              <div className="flex items-center">
                <CurrencySelector />
              </div>

              {/* 3. Shopping Cart */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-xl text-stone-600 hover:text-[#143826] hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center"
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#BC6C25] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-sm"
                  >
                    {totalItemsCount > 9 ? '9+' : totalItemsCount}
                  </motion.span>
                )}
              </button>

              {/* 4. Login / Profile Menu */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#2D6A4F] bg-white hover:bg-stone-50 transition-all text-xs font-semibold text-stone-800 cursor-pointer shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#143826] flex items-center justify-center text-[#DDA15E] text-xs font-bold shrink-0">
                      {user.full_name[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-24 truncate font-medium">
                      {user.full_name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
                          <p className="text-xs font-bold text-stone-900 truncate">{user.full_name}</p>
                          <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            role === 'artisan' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {role === 'admin' ? 'Administrator' : role === 'artisan' ? 'Verified Artisan' : 'Customer'}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#143826] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#BC6C25]" />
                            {getDashboardLabel()}
                          </Link>

                          <Link
                            to="/account/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#143826] transition-colors"
                          >
                            <Package className="w-4 h-4 text-[#2D6A4F]" />
                            My Orders & Invoices
                          </Link>
                        </div>

                        <div className="border-t border-stone-100 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-[#DDA15E]" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* 5. Mobile Hamburger toggle (visible on Tablet & Mobile) */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center ml-0.5"
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DROPDOWN SEARCH BAR (Desktop & Mobile) */}
        {/* ============================================================== */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/98 backdrop-blur-md border-t border-stone-200 overflow-hidden shadow-md"
            >
              <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <Search className="absolute left-4 w-4.5 h-4.5 text-stone-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search silk sarees, brass decor, blue pottery, wooden toys..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-24 py-3 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826] transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================== */}
      {/* MOBILE / TABLET SLIDE-OVER DRAWER */}
      {/* ============================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-18 bottom-0 z-30 bg-white/95 backdrop-blur-lg flex flex-col overflow-y-auto lg:hidden border-t border-stone-200 p-5 space-y-4 shadow-2xl"
          >
            {/* Search Input in Mobile Drawer */}
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search handmade products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#143826]/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#143826] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Go
              </button>
            </form>

            {/* Navigation links */}
            <nav className="flex flex-col space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                    location.pathname === link.href
                      ? 'text-[#143826] bg-[#143826]/10 font-bold'
                      : 'text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <hr className="border-stone-200" />

            {/* Mobile Account actions */}
            <div className="flex flex-col space-y-2 pt-1">
              {user ? (
                <>
                  <div className="px-4 py-2 rounded-xl bg-stone-50">
                    <p className="text-xs font-bold text-stone-900">{user.full_name}</p>
                    <p className="text-[11px] text-stone-500">{user.email}</p>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-100 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#BC6C25]" />
                    {getDashboardLabel()}
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-100 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-[#2D6A4F]" />
                    My Orders & Customs Invoices
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-[#143826] hover:bg-[#0D2818] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-[#DDA15E]" />
                  Sign In / Create Account
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
