import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { api } from '../services/api';
import type { Order, CustomsDocument } from '../types';
import { generateCustomsPDF } from '../services/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [customsDoc, setCustomsDoc] = useState<CustomsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const { role } = useAuth();

  useEffect(() => {
    if (!id) return;
    api.getOrder(id)
      .then(resp => { setOrder(resp.order); setCustomsDoc(resp.customs_document); })
      .catch(() => error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = () => {
    if (!customsDoc || !order) { error('Customs document not available'); return; }
    generateCustomsPDF(customsDoc, order);
    success('Commercial Invoice PDF downloading...');
  };


  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-12 bg-stone-200 rounded-2xl w-1/2" />
          <div className="h-48 bg-stone-200 rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="text-6xl">📦</div>
          <h2 className="font-heading font-bold text-xl text-stone-700">Order not found</h2>
          <Link to="/account/orders" className="text-sm text-[#143826] font-semibold hover:underline">← My Orders</Link>
        </div>
      </MainLayout>
    );
  }

  const statusColor: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Processing: 'bg-purple-100 text-purple-800',
    Shipped: 'bg-amber-100 text-amber-800',
    Delivered: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/account/orders" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#143826] mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> My Orders
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-heading font-black text-xl text-stone-900">{order.order_number}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[order.status] || 'bg-stone-100'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-stone-400">
              Placed {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>
          {customsDoc && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#143826] text-white rounded-xl text-sm font-bold hover:bg-[#0D2818] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Customs PDF
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-heading font-bold text-sm text-stone-800 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <img src={item.image} alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=100&auto=format&fit=crop'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900 line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-[#BC6C25]">{item.artisan_name} × {item.quantity}</p>
                    <p className="text-xs font-mono text-stone-400 mt-0.5">HS: {item.suggested_hs_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-800">{order.selected_currency} {(item.converted_price * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-stone-400">₹{(item.price_inr * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-100 mt-3 flex justify-between font-bold text-stone-800 text-sm">
              <span>Total</span>
              <span>{order.selected_currency} {order.converted_total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping & Customs Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-heading font-bold text-sm text-stone-800 mb-3">Shipping Address</h2>
              <p className="text-sm font-semibold text-stone-800">{order.shipping_address.full_name}</p>
              <p className="text-xs text-stone-500">{order.shipping_address.address}</p>
              <p className="text-xs text-stone-500">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
              <p className="text-xs text-stone-500">{order.shipping_address.country}</p>
              {order.tracking_number && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700 font-semibold">📦 Tracking: {order.tracking_number}</p>
                </div>
              )}
            </div>

            {/* Customs Status */}
            {customsDoc && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-heading font-bold text-sm text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#BC6C25]" />
                    Customs Document
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    customsDoc.verification_status === 'Admin_Verified' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {customsDoc.verification_status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-2">Invoice: <strong className="font-mono">{customsDoc.invoice_number}</strong></p>
                <p className="text-xs text-stone-500 mb-3">Items: {customsDoc.items.length} · Weight: {customsDoc.total_weight_kg} kg</p>

                {/* HS Code table */}
                <div className="space-y-2">
                  {customsDoc.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl">
                      <div className="flex-1 text-xs text-stone-700 truncate font-medium">{item.product_name}</div>
                      <span className="text-xs font-mono font-bold text-[#BC6C25] bg-[#DDA15E]/15 px-2 py-0.5 rounded-lg">
                        HS {item.hs_code}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 leading-relaxed">
                  {customsDoc.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
