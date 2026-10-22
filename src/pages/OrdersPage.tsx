import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, FileText, Download, ChevronRight, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { api } from '../services/api';
import type { Order } from '../types';
import { generateCustomsPDF } from '../services/pdfGenerator';
import { useToast } from '../context/ToastContext';

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  Confirmed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Processing: { color: 'bg-purple-100 text-purple-700', icon: <Package className="w-3.5 h-3.5" /> },
  Shipped: { color: 'bg-amber-100 text-amber-700', icon: <Truck className="w-3.5 h-3.5" /> },
  Delivered: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> }
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    api.getOrders()
      .then(setOrders)
      .catch(() => error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = async (order: Order) => {
    try {
      const resp = await api.getOrder(order.id);
      if (resp.customs_document) {
        generateCustomsPDF(resp.customs_document, order);
        success('PDF downloading...');
      } else {
        error('No customs document for this order yet.');
      }
    } catch {
      error('Failed to generate PDF');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-[#1F2421] flex items-center gap-3">
            <Package className="w-7 h-7 text-[#143826]" />
            My Orders
          </h1>
          <p className="text-stone-500 text-sm mt-1">View your international order history and download customs documents</p>
        </motion.div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 h-28" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="text-6xl">📦</div>
            <h2 className="font-heading font-bold text-xl text-stone-700">No orders yet</h2>
            <p className="text-sm text-stone-400">Your international orders will appear here</p>
            <Link to="/explore" className="px-6 py-3 bg-[#143826] text-white rounded-xl font-bold hover:bg-[#0D2818] transition-colors text-sm">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const cfg = statusConfig[order.status] || statusConfig.Confirmed;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-[#143826]">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.icon} {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} · Shipping to {order.shipping_address?.country}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="font-bold text-stone-900">
                        {order.selected_currency} {order.converted_total?.toFixed(2)}
                        <span className="text-xs text-stone-400 font-normal ml-1">(₹{order.total_inr?.toLocaleString('en-IN')})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-[#143826] hover:underline"
                        >
                          View Details <ChevronRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#143826]/10 text-[#143826] hover:bg-[#143826]/20 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Customs PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item preview */}
                  <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
                    {order.items?.slice(0, 4).map((item, ii) => (
                      <div key={ii} className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-stone-100">
                        <img src={item.image} alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=100&auto=format&fit=crop'; }}
                        />
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
