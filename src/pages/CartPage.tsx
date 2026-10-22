import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Package, ShoppingCart, ChevronRight, ArrowRight } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { PriceDisplay } from '../components/PriceDisplay';
import { CurrencySelector } from '../components/CurrencySelector';
import { useCurrency } from '../context/CurrencyContext';

export const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalInr, totalItemsCount } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const shippingEstimate = totalInr > 3000 ? 0 : 500; // free shipping over ₹3000
  const grandTotalInr = totalInr + shippingEstimate;
  const { convertedString } = formatPrice(grandTotalInr);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-[#1F2421] flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#143826]" />
            Shopping Cart
            {totalItemsCount > 0 && (
              <span className="text-base font-medium text-stone-500">({totalItemsCount} items)</span>
            )}
          </h1>
        </motion.div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-stone-100 flex items-center justify-center text-5xl">🛒</div>
            <div>
              <h2 className="font-heading font-bold text-xl text-stone-700">Your cart is empty</h2>
              <p className="text-sm text-stone-400 mt-1">Discover unique handmade crafts from rural India</p>
            </div>
            <Link to="/explore" className="px-8 py-3.5 bg-[#143826] text-white rounded-xl font-bold hover:bg-[#0D2818] transition-colors text-sm">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.product.id}
                    layout
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4"
                  >
                    <Link to={`/products/${item.product.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=200&auto=format&fit=crop'; }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1">{item.product.name}</h3>
                          <p className="text-xs text-[#BC6C25] font-medium">{item.product.artisan_name}</p>
                          <p className="text-xs text-stone-400">{item.product.category_name}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-md bg-white shadow-sm text-stone-600 hover:text-[#143826] font-bold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            −
                          </button>
                          <span className="px-3 text-sm font-bold text-stone-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md bg-white shadow-sm text-stone-600 hover:text-[#143826] font-bold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <PriceDisplay priceInr={item.product.price_inr * item.quantity} size="md" showInrBase={true} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-base text-stone-900">Order Summary</h2>
                  <CurrencySelector />
                </div>

                <div className="space-y-2.5 pb-4 border-b border-stone-100 mb-4">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal ({totalItemsCount} items)</span>
                    <PriceDisplay priceInr={totalInr} size="sm" showInrBase={false} />
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Shipping (International)</span>
                    {shippingEstimate === 0 ? (
                      <span className="text-emerald-600 font-semibold text-xs">FREE above ₹3,000</span>
                    ) : (
                      <PriceDisplay priceInr={shippingEstimate} size="sm" showInrBase={false} />
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Customs Duties</span>
                    <span className="text-stone-400 text-xs">Payable by buyer at destination</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-stone-900 mb-5">
                  <span>Estimated Total</span>
                  <div className="text-right">
                    <PriceDisplay priceInr={grandTotalInr} size="md" showInrBase={false} />
                    <div className="text-[10px] text-stone-400 font-normal">≈ ₹{grandTotalInr.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all text-sm cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-[10px] text-stone-500 leading-relaxed">
                  🌍 International shipping tracked via premium air cargo. Customs declaration & commercial invoice automatically generated after order placement.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
