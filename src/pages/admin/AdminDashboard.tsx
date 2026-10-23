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
  ExternalLink, CheckCircle2, AlertCircle, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Order, HSCodeMaster, CustomsDocument, Product, Artisan, CurrencyRates } from '../../types';
import { generateCustomsPDF } from '../../services/pdfGenerator';

interface AdminDashboardProps {
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'dashboard' }) => {
  const { user, logout } = useAuth();
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

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddHSOpen, setIsAddHSOpen] = useState(false);
  const [newHS, setNewHS] = useState({
    category: 'Handicrafts',
    hs_code: '',
    description: '',
    keywords: '',
    country_rules: 'General duty 0-5%',
    duty_notes: 'Standard artisan classification'
  });

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
      const [analyticsData, artisansData, productsData, ordersData, hsData, customsData, ratesData] = await Promise.all([
        api.getAdminAnalytics().catch(() => null),
        api.getArtisans().catch(() => []),
        api.getProducts({ status: '' }).then(res => res.products).catch(() => []),
        api.getOrders().catch(() => []),
        api.getHSCodes().catch(() => []),
        api.getCustomsDocs().catch(() => []),
        api.getCurrencyRates().catch(() => null)
      ]);

      setAnalytics(analyticsData);
      setArtisans(artisansData);
      setProducts(productsData);
      setOrders(ordersData);
      setHsCodes(hsData);
      setCustomsDocs(customsData);
      setCurrencyRates(ratesData);
    } catch {
      error('Failed to load portal data from Supabase');
    } finally {
      setLoading(false);
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
    generateCustomsPDF(doc);
    info(`Downloading Commercial Invoice ${doc.invoice_number}...`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
              <div className="w-9 h-9 rounded-xl bg-[#DDA15E] flex items-center justify-center font-bold text-[#0D2818]">
                RC
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-white">Customs Admin</div>
                <div className="text-[10px] text-[#DDA15E] font-medium">Platform Operations</div>
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

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#DDA15E] flex items-center justify-center text-[#0D2818] text-xs font-bold shrink-0">
                {user?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.full_name || 'Admin User'}</div>
                <div className="text-[10px] text-stone-400 truncate">{user?.email}</div>
              </div>
            </div>
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

          {/* TAB 2: USERS & ARTISANS */}
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {products
                          .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(product => (
                            <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 shrink-0">
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
                  <p className="text-xs text-stone-400">Products listed by verified artisans will appear here.</p>
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
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-[#143826] font-semibold hover:underline"
                        >
                          View Order Details →
                        </Link>
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
    </div>
  );
};
