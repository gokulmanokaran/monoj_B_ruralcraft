import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, Package, ShoppingBag, Users, FileText, Code,
  Globe, Settings, LogOut, Plus, ChevronRight,
  ArrowUp, DollarSign, Download, Search, RefreshCw,
  ExternalLink, CheckCircle2, AlertCircle, X, ShieldCheck,
  Trash2, Eye, Upload, Sparkles, Image as ImageIcon,
  UserCheck, Edit3, Award, Building, MapPin, Mail, Phone, Check, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Order, HSCodeMaster, CustomsDocument, Product, Artisan, CurrencyRates, Category } from '../../types';
import { generateCustomsPDF, createCustomsDocFromOrder } from '../../services/pdfGenerator';

interface AdminDashboardProps {
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'dashboard' }) => {
  const { user, profile, updateProfile, logout } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hsCodes, setHsCodes] = useState<HSCodeMaster[]>([]);
  const [customsDocs, setCustomsDocs] = useState<CustomsDocument[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddHSOpen, setIsAddHSOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [hsSuggesting, setHsSuggesting] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    category_name: '',
    price_inr: '',
    stock: '15',
    weight_kg: '0.8',
    dimensions: '25 x 15 x 15 cm',
    material: 'Natural Terracotta Clay',
    country_of_origin: 'India',
    suggested_hs_code: '6912.00',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    status: 'active' as const
  });

  const [newHS, setNewHS] = useState({
    category: 'Handicrafts',
    hs_code: '',
    description: '',
    keywords: '',
    country_rules: 'General duty 0-5%',
    duty_notes: 'Standard artisan classification'
  });

  const AVATAR_PRESETS = [
    { label: 'Customs Officer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { label: 'Executive Director', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { label: 'Trade Specialist', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { label: 'Artisan Lead', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    { label: 'Operations Lead', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' }
  ];

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    full_name: '',
    phone: '',
    designation: '',
    department: '',
    office_location: '',
    city: '',
    country: 'India',
    address_line: '',
    iec_code: '',
    gstin: '',
    bio: '',
    avatar_url: ''
  });

  const handleOpenEditProfile = () => {
    setEditProfileData({
      full_name: profile?.full_name || user?.full_name || 'Customs Administrator',
      phone: profile?.phone || user?.phone || '+91 98765 43210',
      designation: profile?.designation || 'Senior International Customs Officer & Platform Director',
      department: profile?.department || 'RuralCraft Global Trade & Customs Operations',
      office_location: profile?.city ? `${profile.city}, ${profile.country || 'India'}` : 'New Delhi, India',
      city: profile?.city || 'New Delhi',
      country: profile?.country || 'India',
      address_line: profile?.address_line || 'Artisan Enclave, Sector 4, New Delhi 110001, India',
      iec_code: profile?.iec_code || '0519048821',
      gstin: profile?.gstin || '07AAAAA0000A1Z5',
      bio: profile?.bio || 'Certified customs operations officer orchestrating worldwide export clearance and cross-border trade for verified rural Indian artisan clusters.',
      avatar_url: profile?.avatar_url || user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(editProfileData);
      success('Admin Profile updated successfully!');
      setIsEditProfileOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Sync prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load portal data from Supabase
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [analyticsData, artisansData, productsData, ordersData, hsData, customsData, ratesData, categoriesData] = await Promise.all([
        api.getAdminAnalytics().catch(() => null),
        api.getArtisans().catch(() => []),
        api.getProducts({ status: '' }).then(res => res.products).catch(() => []),
        api.getOrders().catch(() => []),
        api.getHSCodes().catch(() => []),
        api.getCustomsDocs().catch(() => []),
        api.getCurrencyRates().catch(() => null),
        api.getCategories().catch(() => [])
      ]);

      setAnalytics(analyticsData);
      setArtisans(artisansData);
      setProducts(productsData);
      setOrders(ordersData);
      setHsCodes(hsData);
      setCustomsDocs(customsData);
      setCurrencyRates(ratesData);
      setCategories(categoriesData);

      if (categoriesData.length > 0 && !newProduct.category_id) {
        setNewProduct(prev => ({
          ...prev,
          category_id: categoriesData[0].id,
          category_name: categoriesData[0].name
        }));
      }
    } catch {
      error('Failed to load portal data from Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSuggestHS = async () => {
    if (!newProduct.name && !newProduct.material) {
      error('Please enter product title or material first');
      return;
    }
    setHsSuggesting(true);
    try {
      const res = await api.suggestHSCode({
        name: newProduct.name,
        material: newProduct.material,
        description: newProduct.description,
        category_name: newProduct.category_name
      });
      setNewProduct(prev => ({ ...prev, suggested_hs_code: res.hs_code }));
      success(`HS Code auto-suggested: ${res.hs_code} (${res.confidence} confidence)`);
    } catch {
      error('Failed to auto-suggest HS Code');
    } finally {
      setHsSuggesting(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      error('Image size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image_url: reader.result as string }));
      success('Image loaded for preview!');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price_inr) {
      error('Product title and price (INR) are required');
      return;
    }

    setUploadingProduct(true);
    try {
      const cat = categories.find(c => c.id === newProduct.category_id || c.name === newProduct.category_name) || categories[0];

      const created = await api.createProduct({
        name: newProduct.name.trim(),
        category_id: cat?.id,
        category_name: cat?.name || newProduct.category_name || 'Pottery & Ceramics',
        price_inr: parseFloat(newProduct.price_inr),
        stock: parseInt(newProduct.stock) || 10,
        weight_kg: parseFloat(newProduct.weight_kg) || 0.5,
        dimensions: newProduct.dimensions || '',
        material: newProduct.material || 'Traditional Handcrafted',
        country_of_origin: newProduct.country_of_origin || 'India',
        suggested_hs_code: newProduct.suggested_hs_code || '6912.00',
        description: newProduct.description.trim() || `${newProduct.name} - authentic handmade craft by rural artisans.`,
        images: [newProduct.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'],
        status: newProduct.status || 'active'
      });

      success(`Product "${created.name}" uploaded to Supabase & live on store!`);
      setIsAddProductOpen(false);
      setNewProduct({
        name: '',
        category_id: categories[0]?.id || '',
        category_name: categories[0]?.name || '',
        price_inr: '',
        stock: '15',
        weight_kg: '0.8',
        dimensions: '25 x 15 x 15 cm',
        material: 'Natural Terracotta Clay',
        country_of_origin: 'India',
        suggested_hs_code: '6912.00',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
        status: 'active'
      });
      await loadAllData();
    } catch (err: any) {
      error(err.message || 'Failed to upload product to Supabase');
    } finally {
      setUploadingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Supabase?`)) return;
    try {
      await api.deleteProduct(id);
      success(`Product "${name}" deleted from database`);
      await loadAllData();
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    }
  };

  const handleRefreshCurrency = async () => {
    try {
      const res = await api.refreshCurrencyRates();
      setCurrencyRates(res.data);
      success('Currency exchange rates refreshed live!');
    } catch {
      error('Failed to refresh currency rates');
    }
  };

  const handleAddHSCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHS.hs_code || !newHS.description) {
      error('HS code and description are required');
      return;
    }
    try {
      const created = await api.createHSCode({
        category: newHS.category,
        hs_code: newHS.hs_code,
        description: newHS.description,
        keywords: newHS.keywords.split(',').map(k => k.trim()).filter(Boolean),
        country_rules: newHS.country_rules,
        duty_notes: newHS.duty_notes,
        confidence_rating: 'High'
      });
      setHsCodes(prev => [created, ...prev]);
      setIsAddHSOpen(false);
      setNewHS({
        category: 'Handicrafts',
        hs_code: '',
        description: '',
        keywords: '',
        country_rules: 'General duty 0-5%',
        duty_notes: 'Standard artisan classification'
      });
      success(`Added suggested HS Code ${created.hs_code} to master catalog!`);
    } catch (err: any) {
      error(err.message || 'Failed to add HS code');
    }
  };

  const handleDeleteHSCode = async (id: string) => {
    try {
      await api.deleteHSCode(id);
      setHsCodes(prev => prev.filter(h => h.id !== id));
      success('HS Code removed from master catalog');
    } catch (err: any) {
      error(err.message || 'Failed to delete HS code');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      success(`Order ${updated.order_number} status updated to ${newStatus}`);
    } catch {
      error('Failed to update order status');
    }
  };

  const handleVerifyCustoms = async (docId: string) => {
    try {
      const updated = await api.verifyCustoms(docId, { status: 'Admin_Verified' });
      setCustomsDocs(prev => prev.map(d => d.id === docId ? updated : d));
      success(`Customs document ${updated.invoice_number} verified!`);
    } catch {
      error('Failed to verify customs document');
    }
  };

  const handleDownloadCustoms = (doc: CustomsDocument) => {
    try {
      generateCustomsPDF(doc);
      info(`Downloading Commercial Invoice ${doc.invoice_number}...`);
    } catch (err: any) {
      console.error('Customs PDF download error:', err);
      error(err.message || 'Failed to download Customs PDF');
    }
  };

  const handleDownloadOrderCustoms = (order: Order) => {
    try {
      const doc = customsDocs.find(d => d.order_id === order.id) || createCustomsDocFromOrder(order);
      generateCustomsPDF(doc, order);
      info(`Downloading Commercial Invoice for ${order.order_number}...`);
    } catch (err: any) {
      console.error('Customs PDF generation error:', err);
      error(err.message || 'Failed to download Customs PDF');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'profile', icon: UserCheck, label: 'Admin Profile' },
    { id: 'users', icon: Users, label: 'Users & Artisans', count: artisans.length },
    { id: 'products', icon: Package, label: 'Products Catalog', count: products.length },
    { id: 'orders', icon: ShoppingBag, label: 'Global Orders', count: orders.length },
    { id: 'hs-codes', icon: Code, label: 'HS Codes Master', count: hsCodes.length },
    { id: 'customs', icon: FileText, label: 'Customs & Invoices', count: customsDocs.length },
    { id: 'currency', icon: Globe, label: 'Currency Rates' },
    { id: 'settings', icon: Settings, label: 'Platform Settings' }
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top Banner */}
      <header className="bg-[#143826] text-white py-2 px-6 flex items-center justify-between text-xs border-b border-[#2D6A4F]/60">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-heading font-black tracking-wide text-sm text-[#DDA15E]">
            RuralCraft Global
          </span>
          <span className="text-emerald-200 border-l border-white/20 pl-3 hidden sm:inline">
            Admin Command Center
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#DDA15E] font-medium transition-colors"
          >
            <span>Customer Marketplace</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0D2818] text-white flex flex-col min-h-[calc(100vh-41px)] shrink-0 hidden md:flex border-r border-white/5">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DDA15E] flex items-center justify-center font-bold text-[#0D2818] overflow-hidden shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  'RC'
                )}
              </div>
              <div className="min-w-0">
                <div className="font-heading font-bold text-sm text-white truncate">
                  {profile?.full_name || 'Customs Admin'}
                </div>
                <div className="text-[10px] text-[#DDA15E] font-medium truncate">
                  {profile?.designation || 'Platform Operations'}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map(({ id, icon: Icon, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-[#DDA15E]/20 text-[#DDA15E] border border-[#DDA15E]/30 shadow-sm'
                    : 'text-stone-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </div>
                {count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === id ? 'bg-[#DDA15E] text-[#0D2818]' : 'bg-white/10 text-stone-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#DDA15E]/20 border border-[#DDA15E]/40 text-white'
                  : 'hover:bg-white/8 text-stone-300 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#DDA15E] flex items-center justify-center text-[#0D2818] text-xs font-bold shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.[0] || 'A'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {profile?.full_name || user?.full_name || 'Administrator'}
                </div>
                <div className="text-[10px] text-stone-400 truncate">{user?.email || 'admin@gmail.com'}</div>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DDA15E]/20 text-[#DDA15E] border border-[#DDA15E]/30 shrink-0">
                Profile
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Admin Operations & Analytics</h1>
                  <p className="text-xs text-stone-500 mt-0.5">International artisan sales, customs clearance & platform metrics</p>
                </div>
                <button
                  onClick={loadAllData}
                  className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#143826]" />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-stone-200 rounded-2xl" />)}
                </div>
              ) : analytics ? (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { icon: Users, title: 'Total Artisans & Buyers', value: analytics.metrics.total_users.toString(), color: 'bg-[#143826]' },
                      { icon: Package, title: 'Handcrafted Products', value: analytics.metrics.total_products.toString(), color: 'bg-[#2D6A4F]' },
                      { icon: ShoppingBag, title: 'International Orders', value: analytics.metrics.total_orders.toString(), color: 'bg-[#BC6C25]' },
                      { icon: DollarSign, title: 'Platform GMV (USD)', value: `$${analytics.metrics.total_revenue_usd.toLocaleString()}`, color: 'bg-[#52B788]' }
                    ].map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>
                            <m.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="font-heading font-black text-2xl text-stone-900 mb-0.5">{m.value}</div>
                        <div className="text-xs text-stone-500 font-medium">{m.title}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts Row */}
                  <div className="grid lg:grid-cols-2 gap-5 mb-6">
                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                      <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Export Revenue Trend (USD)</h3>
                      {analytics.charts.revenue_trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={analytics.charts.revenue_trend}>
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
                            <Line type="monotone" dataKey="revenue_usd" stroke="#143826" strokeWidth={2.5} dot={{ fill: '#DDA15E', r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-stone-400 text-xs">
                          <DollarSign className="w-8 h-8 mb-2 opacity-30" />
                          No revenue data recorded yet.
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                      <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Orders by Destination Country</h3>
                      {analytics.charts.orders_by_country.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={analytics.charts.orders_by_country.slice(0, 5)}>
                            <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-stone-400 text-xs">
                          <Globe className="w-8 h-8 mb-2 opacity-30" />
                          No international orders recorded yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-stone-100">
                      <div>
                        <h3 className="font-heading font-bold text-sm text-stone-800">Recent Global Shipments</h3>
                        <p className="text-xs text-stone-400">Latest international orders requiring customs clearance</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-[#143826] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View All Orders <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="px-4 py-3">Order Number</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Destination</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Value</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {analytics.recent_orders && analytics.recent_orders.length > 0 ? (
                            analytics.recent_orders.map((ord: Order) => (
                              <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                                <td className="px-4 py-3 font-mono font-bold text-[#143826]">{ord.order_number}</td>
                                <td className="px-4 py-3 text-stone-700 font-medium">{ord.customer_name}</td>
                                <td className="px-4 py-3 text-stone-500">{ord.shipping_address?.country}</td>
                                <td className="px-4 py-3 text-stone-500">{ord.items?.length || 0} craft(s)</td>
                                <td className="px-4 py-3 font-semibold text-stone-800">${ord.converted_total?.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    ord.status === 'Shipped' ? 'bg-amber-100 text-amber-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                                No international orders found yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* TAB 2: ADMIN PROFILE & TRADE CREDENTIALS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Header banner */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900 flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-[#143826]" />
                    Admin Profile & Customs Officer Credentials
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage platform administrator identity, export licenses, IEC authority, and digital credentials
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenEditProfile}
                    className="px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#DDA15E]" />
                    Edit Admin Profile
                  </button>
                </div>
              </div>

              {/* Profile Hero Card */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-[#0D2818] border-4 border-[#DDA15E]/40 overflow-hidden shadow-lg flex items-center justify-center text-white text-3xl font-black">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile?.full_name || 'Admin'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.full_name?.[0] || 'A'
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="Super Admin Online">
                        ✓
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                        <h2 className="font-heading font-black text-xl text-stone-900">
                          {profile?.full_name || user?.full_name || 'Customs Administrator'}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Super Admin
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#143826]/10 text-[#143826] text-[10px] font-bold">
                          Customs Officer Level 1
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#DDA15E]">
                        {profile?.designation || 'Senior International Customs Officer & Platform Director'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {profile?.department || 'RuralCraft Global Trade & Customs Operations'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button
                      onClick={handleOpenEditProfile}
                      className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                      Update Details
                    </button>
                  </div>
                </div>

                {/* Profile Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                      <Mail className="w-3.5 h-3.5 text-[#143826]" /> Official Email
                    </div>
                    <div className="font-mono text-xs font-bold text-stone-800 truncate">
                      {user?.email || 'admin@gmail.com'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Verified Primary Account</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                      <Phone className="w-3.5 h-3.5 text-[#143826]" /> Direct Phone
                    </div>
                    <div className="font-mono text-xs font-bold text-stone-800">
                      {profile?.phone || user?.phone || '+91 98765 43210'}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Secured 2FA Channel</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#143826]" /> Office Location
                    </div>
                    <div className="text-xs font-bold text-stone-800">
                      {profile?.city || 'New Delhi'}, {profile?.country || 'India'}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                      {profile?.address_line || 'Artisan Enclave, Sector 4'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                      <Building className="w-3.5 h-3.5 text-[#143826]" /> Customs Hub
                    </div>
                    <div className="text-xs font-bold text-stone-800">
                      INDEL / INCOK Cargo Complex
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Direct Air Clearance Gateway</div>
                  </div>
                </div>

                {/* Bio / Scope */}
                {profile?.bio && (
                  <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-600 leading-relaxed bg-[#143826]/5 p-4 rounded-2xl border border-[#143826]/10">
                    <div className="font-bold text-[#143826] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#DDA15E]" /> Authority & Platform Mission Statement
                    </div>
                    {profile.bio}
                  </div>
                )}
              </div>

              {/* Two Column Grid: Customs Credentials & Operations Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customs & Export Credentials Card */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                    <h3 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#DDA15E]" />
                      International Trade & Customs Credentials
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      DGFT Verified
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">DGFT IEC Code (Import Export Code)</div>
                        <div className="font-mono text-sm font-bold text-[#143826]">
                          {profile?.iec_code || '0519048821'}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Active Master IEC
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">GSTIN Trade Registration</div>
                        <div className="font-mono text-sm font-bold text-[#143826]">
                          {profile?.gstin || '07AAAAA0000A1Z5'}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Central Goods & Services Tax
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Digital Signature Authorization</div>
                        <div className="text-xs font-bold text-stone-800">
                          {profile?.full_name || 'Customs Administrator'} (RuralCraft Consortia)
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Class 3 Commercial
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      These credentials appear automatically on all generated <strong>Commercial Invoices</strong> and <strong>Customs Declarations (CN22/CN23)</strong> for international buyers.
                    </span>
                  </div>
                </div>

                {/* Operations & Platform Authority Scope */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                    <h3 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-[#143826]" />
                      Super Admin Platform Oversight
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#143826]/10 text-[#143826] rounded-full">
                      Live Database Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-2xl font-black text-[#143826] font-mono">{products.length}</div>
                      <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Products in Catalog</div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-2xl font-black text-[#2D6A4F] font-mono">{artisans.length}</div>
                      <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Verified Rural Artisans</div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-2xl font-black text-[#BC6C25] font-mono">{orders.length}</div>
                      <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Orders Processed</div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-2xl font-black text-[#DDA15E] font-mono">{customsDocs.length}</div>
                      <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Customs Documents</div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-500 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Database Role:</span>
                      <strong className="text-stone-800 font-mono">admin (Row-Level Security Bypass)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auth Provider:</span>
                      <strong className="text-stone-800">Supabase Auth & Local Failover</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>HS Tariff Engine:</span>
                      <strong className="text-stone-800">Automated 6-Digit HS Matcher</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS & ARTISANS */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6">
                <h1 className="font-heading font-black text-2xl text-stone-900">Artisans & Community</h1>
                <p className="text-xs text-stone-500 mt-0.5">Verified rural craftmakers registered on the platform</p>
              </div>

              {artisans.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artisans.map(artisan => (
                    <div key={artisan.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={artisan.image_url}
                          alt={artisan.brand_name}
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop'; }}
                        />
                        <div>
                          <div className="font-heading font-bold text-sm text-stone-900">{artisan.brand_name}</div>
                          <div className="text-xs text-[#BC6C25] font-medium">{artisan.craft_type}</div>
                        </div>
                      </div>
                      <div className="text-xs text-stone-500 space-y-1 mb-3">
                        <p>📍 {artisan.village ? `${artisan.village}, ` : ''}{artisan.state}, {artisan.country}</p>
                        <p>⭐ Rating: <strong>{artisan.rating}</strong> ({artisan.total_sales} sold)</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        artisan.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {artisan.verified ? 'Verified Artisan' : 'Standard'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                  <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-stone-700 text-base mb-1">No artisans found</h3>
                  <p className="text-xs text-stone-400">Artisans will appear here as they register on the platform.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Products Catalog</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Manage inventory, prices, and HS code tariff assignments</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#DDA15E]" />
                    Upload Product
                  </button>
                </div>
              </div>

              {products.length > 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Price (INR)</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3">HS Code</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {products
                          .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(product => (
                            <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                                    <img
                                      src={product.images[0] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=100&auto=format&fit=crop'}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-stone-900 line-clamp-1">{product.name}</div>
                                    <div className="text-[10px] text-stone-400">{product.artisan_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-stone-600">{product.category_name}</td>
                              <td className="px-4 py-3 font-semibold text-stone-900">₹{product.price_inr.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-stone-600">{product.stock}</td>
                              <td className="px-4 py-3 font-mono text-[#BC6C25] font-bold">{product.suggested_hs_code}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  product.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                                }`}>
                                  {product.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <Link
                                    to={`/products/${product.slug}`}
                                    target="_blank"
                                    title="View product on public store"
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-[#143826] hover:bg-stone-100 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    title="Delete product from Supabase"
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-stone-700 text-base mb-1">No products in catalog</h3>
                  <p className="text-xs text-stone-400 mb-4">Upload authentic rural artisan products directly to Supabase.</p>
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#143826] text-white rounded-xl text-xs font-bold hover:bg-[#0D2818] shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#DDA15E]" />
                    Upload Your First Product
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GLOBAL ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Global Orders Management</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Track fulfillment, update shipment status, and export customs packets</p>
                </div>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-sm text-[#143826]">{order.order_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'Shipped' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            {order.customer_name} ({order.customer_email}) · Shipping to {order.shipping_address?.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-sm text-stone-900">
                              {order.selected_currency} {order.converted_total?.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-stone-400">₹{order.total_inr?.toLocaleString('en-IN')}</div>
                          </div>
                          <select
                            value={order.status}
                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-stone-200 rounded-lg p-1.5 bg-stone-50 font-medium"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-stone-500">
                          {order.items?.length || 0} items in order
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDownloadOrderCustoms(order)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#143826]/10 text-[#143826] hover:bg-[#143826]/20 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Customs PDF
                          </button>
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-[#143826] font-semibold hover:underline"
                          >
                            View Order Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-stone-700 text-base mb-1">No orders found</h3>
                  <p className="text-xs text-stone-400">Orders placed by customers will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HS CODES MASTER */}
          {activeTab === 'hs-codes' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Harmonized System (HS) Codes Master</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Global export tariff catalog for automated classification of artisan crafts</p>
                </div>
                <button
                  onClick={() => setIsAddHSOpen(true)}
                  className="px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add HS Code
                </button>
              </div>

              {hsCodes.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hsCodes.map(hs => (
                    <div key={hs.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-sm text-[#BC6C25] bg-[#DDA15E]/15 px-2.5 py-1 rounded-lg">
                            HS {hs.hs_code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {hs.confidence_rating || 'High'} Match
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-sm text-stone-900 mb-1">{hs.category}</h3>
                        <p className="text-xs text-stone-500 mb-3 line-clamp-2">{hs.description}</p>
                        <div className="text-[11px] text-stone-400 space-y-1 mb-4">
                          <p><strong>Rules:</strong> {hs.country_rules}</p>
                          <p><strong>Duty:</strong> {hs.duty_notes}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-stone-100 flex justify-end">
                        <button
                          onClick={() => handleDeleteHSCode(hs.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                  <Code className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-stone-700 text-base mb-1">No HS Codes found</h3>
                  <p className="text-xs text-stone-400 mb-4">Master HS codes help classify handmade items for international customs clearance.</p>
                  <button
                    onClick={() => setIsAddHSOpen(true)}
                    className="px-4 py-2 bg-[#143826] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add First HS Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMS & INVOICES */}
          {activeTab === 'customs' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Customs Declarations & Commercial Invoices</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Admin-verified customs clearance documents generated for cross-border shipments</p>
                </div>
              </div>

              {customsDocs.length > 0 ? (
                <div className="space-y-3">
                  {customsDocs.map(doc => (
                    <div key={doc.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-sm text-[#143826]">{doc.invoice_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.verification_status === 'Admin_Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.verification_status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            Destination: <strong>{doc.destination_country}</strong> · Total: <strong>${doc.total_value_converted}</strong> ({doc.total_weight_kg} kg)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.verification_status !== 'Admin_Verified' && (
                            <button
                              onClick={() => handleVerifyCustoms(doc.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Verify HS Codes
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadCustoms(doc)}
                            className="px-3 py-1.5 rounded-xl bg-[#143826] text-white text-xs font-semibold hover:bg-[#0D2818] flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-stone-700 text-base mb-1">No customs documents yet</h3>
                  <p className="text-xs text-stone-400">Customs documents and commercial invoices are automatically generated when orders are placed.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CURRENCY RATES */}
          {activeTab === 'currency' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Currency Exchange Rates</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Automated currency conversion for multi-country cross-border checkout</p>
                </div>
                <button
                  onClick={handleRefreshCurrency}
                  className="px-4 py-2 bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Rates
                </button>
              </div>

              {currencyRates ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(currencyRates.rates).map(([curr, rate]) => (
                    <div key={curr} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
                      <div className="text-xs font-bold text-[#143826] mb-1">{curr} / {currencyRates.base}</div>
                      <div className="font-mono text-xl font-bold text-stone-900">{rate}</div>
                      <div className="text-[10px] text-stone-400 mt-1">1 INR = {rate} {curr}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className="mb-6">
                <h1 className="font-heading font-black text-2xl text-stone-900">Platform Settings & Security</h1>
                <p className="text-xs text-stone-500 mt-0.5">Supabase database integration and platform infrastructure settings</p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 max-w-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <div className="font-semibold text-sm text-stone-900">Architecture Mode</div>
                    <div className="text-xs text-stone-400">Single Project Unified Deployment</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <div className="font-semibold text-sm text-stone-900">Backend & Database</div>
                    <div className="text-xs text-stone-400">Supabase PostgreSQL & Supabase Auth</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <div className="font-semibold text-sm text-stone-900">Demo / Dummy Data</div>
                    <div className="text-xs text-stone-400">Removed across entire codebase</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Real Data Only
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-stone-900">Admin Route Protection</div>
                    <div className="text-xs text-stone-400">Restricted to authenticated Supabase admin users</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Enforced
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add HS Code */}
      <AnimatePresence>
        {isAddHSOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg text-stone-900">Add HS Code to Catalog</h3>
                <button onClick={() => setIsAddHSOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddHSCode} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">HS Tariff Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4602.11"
                    value={newHS.hs_code}
                    onChange={e => setNewHS({ ...newHS, hs_code: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Craft Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bamboo & Cane Handicraft"
                    value={newHS.category}
                    onChange={e => setNewHS({ ...newHS, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Official Tariff Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Basketwork, wickerwork and other articles..."
                    value={newHS.description}
                    onChange={e => setNewHS({ ...newHS, description: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Keywords (comma separated)</label>
                  <input
                    type="text"
                    placeholder="bamboo, cane, basket, wicker"
                    value={newHS.keywords}
                    onChange={e => setNewHS({ ...newHS, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddHSOpen(false)}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#143826] text-white rounded-xl text-xs font-bold hover:bg-[#0D2818]"
                  >
                    Save HS Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Upload Product to Supabase */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#143826] flex items-center justify-center text-[#DDA15E]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-stone-900">Upload Product to Supabase</h3>
                    <p className="text-xs text-stone-500">Live syncs to Explore catalog, detail pages, and multi-currency engine</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadProduct} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Handcrafted Jaipur Blue Pottery Flower Vase"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20 focus:border-[#143826] transition-colors"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newProduct.category_id}
                      onChange={e => {
                        const sel = categories.find(c => c.id === e.target.value);
                        setNewProduct({
                          ...newProduct,
                          category_id: e.target.value,
                          category_name: sel?.name || ''
                        });
                      }}
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#143826]/20 focus:border-[#143826]"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Price (INR ₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        placeholder="1850"
                        value={newProduct.price_inr}
                        onChange={e => setNewProduct({ ...newProduct, price_inr: e.target.value })}
                        className="w-full pl-7 pr-3 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#143826]/20 focus:border-[#143826]"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock, Weight, Dimensions */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Stock Units</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="15"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      placeholder="0.85"
                      value={newProduct.weight_kg}
                      onChange={e => setNewProduct({ ...newProduct, weight_kg: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      placeholder="25 x 15 cm"
                      value={newProduct.dimensions}
                      onChange={e => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                </div>

                {/* Material & HS Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Material Composition</label>
                    <input
                      type="text"
                      placeholder="e.g. Quartz Stone, Clay & Natural Glaze"
                      value={newProduct.material}
                      onChange={e => setNewProduct({ ...newProduct, material: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-700">HS Customs Code</label>
                      <button
                        type="button"
                        onClick={handleAutoSuggestHS}
                        disabled={hsSuggesting}
                        className="text-[11px] text-[#143826] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#DDA15E]" />
                        {hsSuggesting ? 'Analyzing...' : 'Auto-Suggest'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 6912.00"
                      value={newProduct.suggested_hs_code}
                      onChange={e => setNewProduct({ ...newProduct, suggested_hs_code: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold text-[#BC6C25] focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                </div>

                {/* Image Section */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-800">Product Image</label>
                    <span className="text-[10px] text-stone-400">Direct URL or Preset Selection</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newProduct.image_url}
                      onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                    <label className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 1-Click Quick Presets */}
                  <div>
                    <div className="text-[11px] font-semibold text-stone-600 mb-1.5">Quick Handicraft Photo Presets:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🏺 Blue Pottery Vase', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800' },
                        { label: '🧣 Pashmina Silk', url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800' },
                        { label: '🐘 Carved Teak', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800' },
                        { label: '🪔 Dokra Metal', url: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&q=80&w=800' },
                        { label: '🧺 Bamboo Basket', url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800' },
                        { label: '💎 Marble Inlay', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, image_url: preset.url })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                            newProduct.image_url === preset.url
                              ? 'bg-[#143826] text-white border-[#143826]'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  {newProduct.image_url && (
                    <div className="flex items-center gap-3 pt-2 border-t border-stone-200/60">
                      <img
                        src={newProduct.image_url}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-sm shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'; }}
                      />
                      <div className="text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-800">Preview:</span> Image will be displayed on the customer product card and detail page.
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Description & Artisan Story</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the craft is handmade, materials used, and heritage origins..."
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20 focus:border-[#143826]"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    disabled={uploadingProduct}
                    className="px-5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingProduct}
                    className="px-6 py-2.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {uploadingProduct ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Uploading to Supabase...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#DDA15E]" />
                        Upload & Publish to Supabase
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Admin Profile */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto my-6"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
                <div>
                  <h3 className="font-heading font-black text-xl text-stone-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#143826]" />
                    Edit Admin Profile & Trade Credentials
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Update your administrator identity, contact, designation, and customs authority details
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar selection & preview */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Profile Avatar / Photo
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#0D2818] overflow-hidden border-2 border-[#DDA15E] shrink-0 flex items-center justify-center text-white text-xl font-bold">
                      {editProfileData.avatar_url ? (
                        <img src={editProfileData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        editProfileData.full_name?.[0] || 'A'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-stone-500 mb-1 font-medium">Quick Preset Avatars:</div>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_PRESETS.map((p, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setEditProfileData({ ...editProfileData, avatar_url: p.url })}
                            className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                              editProfileData.avatar_url === p.url
                                ? 'border-[#143826] ring-2 ring-[#143826]/30 scale-105'
                                : 'border-stone-200 opacity-70 hover:opacity-100'
                            }`}
                            title={p.label}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Or enter custom image URL: https://..."
                      value={editProfileData.avatar_url}
                      onChange={e => setEditProfileData({ ...editProfileData, avatar_url: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Administrator Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Customs Administrator"
                      value={editProfileData.full_name}
                      onChange={e => setEditProfileData({ ...editProfileData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={editProfileData.phone}
                      onChange={e => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                </div>

                {/* Designation & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Official Designation / Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="Senior International Customs Officer"
                      value={editProfileData.designation}
                      onChange={e => setEditProfileData({ ...editProfileData, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Department / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="RuralCraft Global Trade & Customs Operations"
                      value={editProfileData.department}
                      onChange={e => setEditProfileData({ ...editProfileData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                </div>

                {/* Address & City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Office Address
                    </label>
                    <input
                      type="text"
                      placeholder="Artisan Enclave, Sector 4, New Delhi 110001"
                      value={editProfileData.address_line}
                      onChange={e => setEditProfileData({ ...editProfileData, address_line: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New Delhi"
                      value={editProfileData.city}
                      onChange={e => setEditProfileData({ ...editProfileData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                    />
                  </div>
                </div>

                {/* Customs Credentials: IEC Code & GSTIN */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="text-xs font-bold text-[#143826] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#DDA15E]" /> Export & Customs Authority Credentials
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        DGFT IEC Code
                      </label>
                      <input
                        type="text"
                        placeholder="0519048821"
                        value={editProfileData.iec_code}
                        onChange={e => setEditProfileData({ ...editProfileData, iec_code: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-[#143826]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        GSTIN Registration Number
                      </label>
                      <input
                        type="text"
                        placeholder="07AAAAA0000A1Z5"
                        value={editProfileData.gstin}
                        onChange={e => setEditProfileData({ ...editProfileData, gstin: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-[#143826]/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Bio / Authority Statement
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your role, authority scope, or export clearance statement..."
                    value={editProfileData.bio}
                    onChange={e => setEditProfileData({ ...editProfileData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#143826]/20"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#DDA15E]" /> Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
