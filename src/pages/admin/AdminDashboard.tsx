import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
  LayoutDashboard, Package, ShoppingBag, Users, FileText, Code,
  TrendingUp, Globe, Settings, LogOut, Plus, ChevronRight,
  ArrowUp, DollarSign, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { generateCustomsPDF } from '../../services/pdfGenerator';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const COLORS = ['#143826', '#2D6A4F', '#DDA15E', '#BC6C25', '#52B788'];

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users & Artisans', href: '/admin/users' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Code, label: 'HS Codes', href: '/admin/hs-codes' },
  { icon: FileText, label: 'Customs Docs', href: '/admin/customs' },
  { icon: Globe, label: 'Currency Rates', href: '/admin/currency' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' }
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('Dashboard');

  useEffect(() => {
    api.getAdminAnalytics()
      .then(setAnalytics)
      .catch(() => error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const MetricCard = ({ icon: Icon, title, value, sub, color, trend }: {
    icon: React.ElementType; title: string; value: string; sub?: string; color: string; trend?: number;
  }) => (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
            <ArrowUp className="w-3 h-3" />
            {trend}%
          </div>
        )}
      </div>
      <div className="font-heading font-black text-2xl text-stone-900 mb-0.5">{value}</div>
      <div className="text-sm text-stone-500 font-medium">{title}</div>
      {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <RoleSwitcher />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0D2818] text-white flex flex-col min-h-screen hidden lg:flex shrink-0">
          <div className="p-5 border-b border-white/10">
            <div className="font-heading font-black text-lg text-white">RuralCraft</div>
            <div className="text-[10px] text-[#DDA15E] tracking-widest uppercase">Admin Portal</div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                to={href}
                onClick={() => setActivePage(label)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activePage === label || (label === 'Dashboard' && window.location.pathname === '/admin')
                    ? 'bg-[#DDA15E]/20 text-[#DDA15E] border border-[#DDA15E]/30'
                    : 'text-stone-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-[#DDA15E] flex items-center justify-center text-[#0D2818] text-xs font-bold">
                {user?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.full_name || 'Admin'}</div>
                <div className="text-[10px] text-stone-400 truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer mt-1"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="font-heading font-black text-2xl text-stone-900">Admin Dashboard</h1>
              <p className="text-sm text-stone-500 mt-0.5">Platform analytics and management</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-stone-200 rounded-2xl" />)}
              </div>
            ) : analytics && (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Users, title: 'Total Users', value: analytics.metrics.total_users.toString(), color: 'bg-[#143826]', trend: 12 },
                    { icon: Package, title: 'Products Listed', value: analytics.metrics.total_products.toString(), color: 'bg-[#2D6A4F]', trend: 8 },
                    { icon: ShoppingBag, title: 'Total Orders', value: analytics.metrics.total_orders.toString(), color: 'bg-[#BC6C25]', trend: 24 },
                    { icon: DollarSign, title: 'Revenue (USD)', value: `$${analytics.metrics.total_revenue_usd.toLocaleString()}`, color: 'bg-[#52B788]', trend: 18 }
                  ].map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <MetricCard {...m} />
                    </motion.div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-2 gap-5 mb-5">
                  {/* Revenue Trend */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5">
                    <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Revenue Trend (USD)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analytics.charts.revenue_trend}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue_usd" stroke="#143826" strokeWidth={2.5} dot={{ fill: '#DDA15E', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Pie */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5">
                    <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Revenue by Category</h3>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="55%" height={180}>
                        <PieChart>
                          <Pie data={analytics.charts.category_share} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                            {analytics.charts.category_share.map((entry: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5">
                        {analytics.charts.category_share.map((cat: any, i: number) => (
                          <div key={cat.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-[11px] text-stone-600 truncate">{cat.name}</span>
                            <span className="text-[11px] font-bold text-stone-800 ml-auto">{cat.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Countries + Orders Chart */}
                <div className="grid lg:grid-cols-2 gap-5 mb-5">
                  <div className="bg-white rounded-2xl border border-stone-200 p-5">
                    <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Orders by Country</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.charts.orders_by_country.slice(0, 5)}>
                        <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Orders vs Revenue */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5">
                    <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Monthly Orders</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.charts.revenue_trend}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#DDA15E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between p-5 border-b border-stone-100">
                    <h3 className="font-heading font-bold text-sm text-stone-800">Recent Orders</h3>
                    <Link to="/admin/orders" className="text-xs text-[#143826] font-semibold hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-stone-50/80">
                        <tr>
                          {['Order ID', 'Customer', 'Country', 'Items', 'Total (USD)', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {analytics.recent_orders.map((order: Order, i: number) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-stone-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-[#143826] font-bold">{order.order_number}</td>
                            <td className="px-4 py-3 text-xs text-stone-700">{order.customer_name}</td>
                            <td className="px-4 py-3 text-xs text-stone-500">{order.shipping_address?.country}</td>
                            <td className="px-4 py-3 text-xs text-stone-500">{order.items?.length || 0} items</td>
                            <td className="px-4 py-3 text-xs font-semibold text-stone-800">${order.converted_total?.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                order.status === 'Shipped' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
