import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, User, LogOut, Settings,
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
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Artisans', href: '/artisans' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'About', href: '/#about' }
  ];

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'artisan') return '/artisan';
    return '/account';
  };

  const getDashboardLabel = () => {
    if (role === 'admin') return 'Admin Dashboard';
    if (role === 'artisan') return 'Artisan Portal';
    return 'My Account';
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-[#143826] flex items-center justify-center group-hover:bg-[#2D6A4F] transition-colors">
                <Leaf className="w-4 h-4 text-[#DDA15E]" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-base text-[#143826] leading-none tracking-tight">
                  RuralCraft
                </div>
                <div className="text-[9px] font-semibold text-[#DDA15E] tracking-widest uppercase leading-none mt-0.5">
                  Global
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.href
                      ? 'text-[#143826] bg-[#143826]/8 font-semibold'
                      : 'text-stone-600 hover:text-[#143826] hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <CurrencySelector />

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-[#143826] transition-colors cursor-pointer"
                aria-label="Open search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-[#143826] transition-colors cursor-pointer"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {totalItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#BC6C25] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {totalItemsCount > 9 ? '9+' : totalItemsCount}
                  </motion.span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#2D6A4F] bg-white/80 hover:bg-stone-50 transition-all text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#143826] flex items-center justify-center text-white text-[10px] font-bold">
                      {user.full_name[0].toUpperCase()}
                    </div>
                    <span className="max-w-24 truncate">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-stone-100 mb-1">
                          <p className="text-xs font-bold text-stone-900 truncate">{user.full_name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            role === 'artisan' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {role}
                          </span>
                        </div>
                        <Link to={getDashboardLink()} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-[#143826]">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          {getDashboardLabel()}
                        </Link>
                        <Link to="/account/orders" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
                          <Package className="w-3.5 h-3.5" />
                          My Orders
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-t border-stone-200 overflow-hidden"
            >
              <div className="max-w-2xl mx-auto px-4 py-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search handmade products, artisans, crafts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826]"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#143826] text-white rounded-lg text-xs font-semibold hover:bg-[#0D2818] transition-colors cursor-pointer">
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-30 bg-white flex flex-col pt-16"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-stone-100 hover:text-[#143826] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-stone-200" />
              {user ? (
                <>
                  <Link to={getDashboardLink()} className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-stone-100">
                    {getDashboardLabel()}
                  </Link>
                  <Link to="/account/orders" className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-stone-100">
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-3 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-4 py-3 rounded-xl text-base font-bold text-[#143826] bg-[#143826]/8">
                  Sign In / Register
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
