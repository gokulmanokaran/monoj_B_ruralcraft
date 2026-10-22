import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, Package, ShoppingBag, Users, FileText, Code,
  Globe, Settings, LogOut, Plus, ChevronRight,
  ArrowUp, DollarSign, Download, Search, RefreshCw,
  ExternalLink, Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { Order, HSCodeMaster, CustomsDocument, Product, Artisan, CurrencyRates } from '../types';
import { generateCustomsPDF } from '../services/pdfGenerator';

interface AdminDashboardProps {
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'dashboard' }) => {
  const { user, logout } = useAdminAuth();
  const { success, error, info } = useToast();

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

  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5173';

  // Load initial analytics
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [analyticsData, artisansData, productsData, ordersData, hsData, customsData, ratesData] = await Promise.all([
        api.getAdminAnalytics().catch(() => null),
        api.getArtisans().catch(() => []),
        api.getProducts().then(res => res.products).catch(() => []),
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
      error('Failed to load portal data');
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
    } catch {
      error('Failed to add HS code');
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

  const handleDownloadCustoms = (doc: CustomsDocument) => {
    generateCustomsPDF(doc);
    info(`Downloading Commercial Invoice ${doc.invoice_number}...`);
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
            Admin Panel (Independent Vercel Deployment)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={mainAppUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#DDA15E] font-medium transition-colors"
          >
            <span>Customer Marketplace</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={logout}
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
              ) : analytics && (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { icon: Users, title: 'Total Artisans & Buyers', value: analytics.metrics.total_users.toString(), color: 'bg-[#143826]', trend: 12 },
                      { icon: Package, title: 'Handcrafted Products', value: analytics.metrics.total_products.toString(), color: 'bg-[#2D6A4F]', trend: 8 },
                      { icon: ShoppingBag, title: 'International Orders', value: analytics.metrics.total_orders.toString(), color: 'bg-[#BC6C25]', trend: 24 },
                      { icon: DollarSign, title: 'Platform GMV (USD)', value: `$${analytics.metrics.total_revenue_usd.toLocaleString()}`, color: 'bg-[#52B788]', trend: 18 }
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
                          {m.trend !== undefined && (
                            <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                              <ArrowUp className="w-3 h-3" />
                              {m.trend}%
                            </div>
                          )}
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
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics.charts.revenue_trend}>
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
                          <Line type="monotone" dataKey="revenue_usd" stroke="#143826" strokeWidth={2.5} dot={{ fill: '#DDA15E', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                      <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Orders by Destination Country</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.charts.orders_by_country.slice(0, 5)}>
                          <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="orders" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
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
                          {analytics.recent_orders?.map((ord: Order) => (
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: USERS & ARTISANS */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Rural Artisans & Sellers</h1>
                  <p className="text-xs text-stone-500">Verified master craftspeople and village cooperatives across India</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artisans.map(art => (
                  <div key={art.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <img src={art.image_url} alt={art.brand_name} className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                      <div>
                        <h3 className="font-heading font-bold text-sm text-stone-900">{art.brand_name}</h3>
                        <p className="text-xs text-[#BC6C25] font-semibold">{art.craft_type}</p>
                        <p className="text-[11px] text-stone-400">{art.village}, {art.state}</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 mb-4">{art.story}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                      <span className="text-stone-500 font-mono text-[11px]">IEC: {art.iec_code || '0518099341'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        ★ {art.rating} ({art.total_sales} sold)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Products & HS Classification</h1>
                  <p className="text-xs text-stone-500">Catalog inventory with suggested HS Code classifications</p>
                </div>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search crafts or HS..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#143826]"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Artisan</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price (INR)</th>
                      <th className="px-4 py-3">Suggested HS Code</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.suggested_hs_code?.includes(searchQuery))
                      .map(prod => (
                        <tr key={prod.id} className="hover:bg-stone-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {prod.images?.[0] && (
                                <img src={prod.images[0]} alt={prod.name} className="w-8 h-8 rounded-lg object-cover" />
                              )}
                              <span className="font-semibold text-stone-900">{prod.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-600">{prod.artisan_name}</td>
                          <td className="px-4 py-3 text-stone-500">{prod.category_name}</td>
                          <td className="px-4 py-3 font-semibold text-stone-900">₹{prod.price_inr?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-md bg-[#DDA15E]/20 text-[#733F17] font-mono font-bold">
                              {prod.suggested_hs_code}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {prod.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & STATUS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <div className="mb-6">
                <h1 className="font-heading font-black text-2xl text-stone-900">International Orders Management</h1>
                <p className="text-xs text-stone-500">Track cross-border shipments and update delivery milestones</p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Current Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-stone-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-[#143826]">{ord.order_number}</td>
                        <td className="px-4 py-3 font-medium text-stone-800">{ord.customer_name}</td>
                        <td className="px-4 py-3 text-stone-500">{ord.shipping_address?.city}, {ord.shipping_address?.country}</td>
                        <td className="px-4 py-3 font-semibold text-stone-900">{ord.selected_currency} {ord.converted_total?.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={ord.status}
                            onChange={e => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-stone-200 bg-white cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {customsDocs.find(d => d.order_id === ord.id) ? (
                            <button
                              onClick={() => {
                                const doc = customsDocs.find(d => d.order_id === ord.id);
                                if (doc) handleDownloadCustoms(doc);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#143826] text-white font-medium hover:bg-[#0D2818] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              Customs Invoice
                            </button>
                          ) : (
                            <span className="text-stone-400 italic">No document</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: HS CODES MASTER */}
          {activeTab === 'hs-codes' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Harmonized System (HS) Codes Master</h1>
                  <p className="text-xs text-stone-500">Official suggested classification rules for Indian handicrafts and textiles</p>
                </div>
                <button
                  onClick={() => setIsAddHSOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add HS Code Entry
                </button>
              </div>

              {/* Add HS Code Modal */}
              <AnimatePresence>
                {isAddHSOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.95 }}
                      className="bg-white rounded-3xl p-6 max-w-lg w-full border border-stone-200 shadow-2xl"
                    >
                      <h2 className="font-heading font-bold text-lg text-stone-900 mb-1">Add HS Code Classification</h2>
                      <p className="text-xs text-stone-500 mb-4">Create a new entry for automated HS suggestion matching</p>

                      <form onSubmit={handleAddHSCode} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Category</label>
                            <input
                              type="text"
                              required
                              value={newHS.category}
                              onChange={e => setNewHS({ ...newHS, category: e.target.value })}
                              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">HS Code (e.g. 5007.20)</label>
                            <input
                              type="text"
                              required
                              value={newHS.hs_code}
                              onChange={e => setNewHS({ ...newHS, hs_code: e.target.value })}
                              placeholder="5007.20"
                              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">Description</label>
                          <input
                            type="text"
                            required
                            value={newHS.description}
                            onChange={e => setNewHS({ ...newHS, description: e.target.value })}
                            placeholder="Handwoven raw silk fabrics"
                            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">Keywords (comma separated)</label>
                          <input
                            type="text"
                            required
                            value={newHS.keywords}
                            onChange={e => setNewHS({ ...newHS, keywords: e.target.value })}
                            placeholder="silk, saree, scarf, handloom, zari"
                            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsAddHSOpen(false)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#143826] text-white text-xs font-bold hover:bg-[#0D2818] cursor-pointer"
                          >
                            Save Classification
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">HS Code</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Classification Keywords</th>
                      <th className="px-4 py-3">Trade Duty Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {hsCodes.map(hs => (
                      <tr key={hs.id} className="hover:bg-stone-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-[#BC6C25]">{hs.hs_code}</td>
                        <td className="px-4 py-3 font-semibold text-stone-800">{hs.category}</td>
                        <td className="px-4 py-3 text-stone-600">{hs.description}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {hs.keywords?.slice(0, 4).map((kw, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-stone-500">{hs.country_rules}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMS & COMMERCIAL INVOICES */}
          {activeTab === 'customs' && (
            <div>
              <div className="mb-6">
                <h1 className="font-heading font-black text-2xl text-stone-900">Customs Declarations & Export Invoices</h1>
                <p className="text-xs text-stone-500">Official commercial documentation generated automatically for international parcels</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {customsDocs.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 uppercase">Commercial Invoice</span>
                        <h3 className="font-heading font-black text-base text-[#143826]">{doc.invoice_number}</h3>
                        <p className="text-xs text-stone-500">Order Ref: {doc.order_number}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.verification_status === 'Admin_Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.verification_status}
                      </span>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-stone-600">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Exporter IEC:</span>
                        <span className="font-mono font-semibold">{doc.exporter?.iec_code || '0518099341'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Destination:</span>
                        <span className="font-semibold">{doc.destination_country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Total Customs Value:</span>
                        <span className="font-bold text-stone-900">{doc.currency} {doc.total_value_converted?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-[11px] font-bold text-stone-700 uppercase mb-1">Declared Line Items</div>
                      <div className="space-y-1">
                        {doc.items?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                            <span className="truncate max-w-[200px] text-stone-700">{item.product_name}</span>
                            <span className="font-mono text-[#BC6C25] font-bold bg-[#DDA15E]/15 px-1.5 rounded">
                              HS {item.hs_code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadCustoms(doc)}
                      className="w-full py-2.5 rounded-xl bg-[#143826] hover:bg-[#0D2818] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Official Invoice PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CURRENCY RATES */}
          {activeTab === 'currency' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-black text-2xl text-stone-900">Live Multi-Currency Rates</h1>
                  <p className="text-xs text-stone-500">Real-time international conversion rates based on Indian Rupee (INR)</p>
                </div>
                <button
                  onClick={handleRefreshCurrency}
                  className="px-4 py-2 rounded-xl bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Fetch Live Rates Now
                </button>
              </div>

              {currencyRates && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 text-xs">
                    <div>
                      <span className="text-stone-400">Base Currency:</span>{' '}
                      <strong className="text-[#143826] font-bold">1 {currencyRates.base} (Indian Rupee)</strong>
                    </div>
                    <div className="text-stone-400">
                      Last Updated: <strong className="text-stone-700">{new Date(currencyRates.last_updated).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(currencyRates.rates).map(([curr, rate]) => (
                      <div key={curr} className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                        <div className="font-heading font-black text-lg text-stone-800">{curr}</div>
                        <div className="font-mono text-sm text-[#BC6C25] font-bold mt-1">
                          {rate.toFixed(5)}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1">1 INR = {rate.toFixed(4)} {curr}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className="mb-6">
                <h1 className="font-heading font-black text-2xl text-stone-900">Platform & Vercel Settings</h1>
                <p className="text-xs text-stone-500">Architecture and environment details for this Admin deployment</p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-2xl space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900">Independently Deployable Vercel Frontend</h4>
                    <p className="text-emerald-700 mt-1 leading-relaxed">
                      This Admin Panel is configured as <strong>Vercel Deployment 2</strong> (Root Directory: <code>admin</code>).
                      It communicates with the shared Supabase database and backend via the configured API endpoint.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-600">Application Name:</span>
                    <span className="font-mono text-stone-900 font-bold">RuralCraft Global Admin</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-600">Target Vercel Deployment:</span>
                    <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px]">Deployment 2 (Admin)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-600">Connected Main Shop URL:</span>
                    <a href={mainAppUrl} target="_blank" rel="noreferrer" className="text-[#BC6C25] font-semibold hover:underline inline-flex items-center gap-1">
                      {mainAppUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-600">Platform Exporter IEC Code:</span>
                    <span className="font-mono text-stone-900 font-bold">0518099341</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-600">Platform GSTIN:</span>
                    <span className="font-mono text-stone-900 font-bold">18AAACL9012M1Z2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
