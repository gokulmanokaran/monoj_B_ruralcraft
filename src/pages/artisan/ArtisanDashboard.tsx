import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, Package, ShoppingBag, User, TrendingUp,
  LogOut, Plus, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/artisan' },
  { icon: Package, label: 'My Products', href: '/artisan/products' },
  { icon: Plus, label: 'Add Product', href: '/artisan/add-product' },
  { icon: ShoppingBag, label: 'Orders', href: '/artisan/orders' },
  { icon: TrendingUp, label: 'Sales', href: '/artisan/sales' },
  { icon: User, label: 'Profile', href: '/artisan/profile' }
];

export const ArtisanDashboard: React.FC = () => {
  const { user, artisan, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artisan?.id) { setLoading(false); return; }
    api.getArtisanStats(artisan.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [artisan?.id]);

  const cards = stats ? [
    { label: 'Total Products', value: stats.total_products, color: 'bg-[#143826] text-white', icon: Package },
    { label: 'Total Orders', value: stats.total_orders, color: 'bg-[#DDA15E] text-white', icon: ShoppingBag },
    { label: 'Pending', value: stats.pending_orders, color: 'bg-amber-100 text-amber-800', icon: Loader2 },
    { label: 'Revenue (₹)', value: `₹${stats.total_revenue_inr?.toLocaleString('en-IN') || '0'}`, color: 'bg-emerald-100 text-emerald-800', icon: TrendingUp }
  ] : [];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <RoleSwitcher />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 bg-[#143826] text-white flex flex-col shrink-0 hidden lg:flex">
          <div className="p-5 border-b border-white/10">
            <div className="font-heading font-black text-base text-white">Artisan Portal</div>
            <div className="text-xs text-[#DDA15E] mt-0.5 truncate">{artisan?.brand_name || user?.full_name}</div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                to={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="font-heading font-black text-2xl text-stone-900">
                Welcome, {artisan?.brand_name || user?.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">Here's what's happening with your crafts today</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-stone-200 rounded-2xl" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {cards.map((card, i) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`rounded-2xl p-5 border border-stone-200 ${card.color.includes('bg-[') ? card.color + ' shadow-lg' : 'bg-white ' + card.color}`}
                    >
                      <card.icon className="w-5 h-5 mb-3 opacity-80" />
                      <div className="font-heading font-black text-2xl mb-0.5">{card.value}</div>
                      <div className="text-xs font-medium opacity-80">{card.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Sales Chart */}
                {stats?.sales_chart && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
                    <h3 className="font-heading font-bold text-sm text-stone-800 mb-4">Sales Overview (₹)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.sales_chart}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#143826" strokeWidth={2.5} dot={{ fill: '#DDA15E', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to="/artisan/add-product" className="flex items-center gap-3 p-4 bg-[#143826] text-white rounded-2xl hover:bg-[#0D2818] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Add New Product</div>
                      <div className="text-xs text-stone-300">List a new handmade craft</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </Link>
                  <Link to="/artisan/orders" className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-[#143826]/10 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-[#143826]" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-800">View Orders</div>
                      <div className="text-xs text-stone-400">Manage incoming orders</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-stone-300" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
