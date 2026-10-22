import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { PriceDisplay } from './PriceDisplay';

export const CartDrawer: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalItemsCount, totalInr, isCartOpen, setIsCartOpen, convertedTotal } = useCart();
  const { currency, formatPrice } = useCurrency();
  const { symbol } = formatPrice(0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-[#143826]">
              <div className="flex items-center gap-2.5 text-white">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="font-heading font-bold text-lg">Your Cart</h2>
                {totalItemsCount > 0 && (
                  <span className="min-w-[22px] h-5.5 px-1.5 py-0.5 bg-[#DDA15E] text-[#1F2421] text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center">
                    <Package className="w-10 h-10 text-stone-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-stone-700">Your cart is empty</h3>
                    <p className="text-sm text-stone-400 mt-1">Discover unique handmade creations</p>
                  </div>
                  <Link
                    to="/explore"
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 bg-[#143826] text-white rounded-xl font-semibold text-sm hover:bg-[#0D2818] transition-colors"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {items.map(item => (
                    <motion.div
                      key={item.product.id}
                      layout
                      exit={{ opacity: 0, x: 30 }}
                      className="p-4 flex gap-3"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=200&auto=format&fit=crop'; }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-[#BC6C25] font-medium mt-0.5">{item.product.artisan_name}</p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Qty controls */}
                          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-md bg-white shadow-sm text-stone-600 hover:text-[#143826] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-800 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-md bg-white shadow-sm text-stone-600 hover:text-[#143826] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <PriceDisplay priceInr={item.product.price_inr * item.quantity} size="sm" showInrBase={false} />
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors self-start mt-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 p-5 space-y-3 bg-stone-50/80">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal ({totalItemsCount} items)</span>
                    <PriceDisplay priceInr={totalInr} size="sm" showInrBase={false} />
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>International Shipping</span>
                    <span className="text-emerald-600 font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Estimated Total</span>
                    <div className="text-right">
                      <PriceDisplay priceInr={totalInr} size="md" showInrBase={false} />
                      <div className="text-[10px] text-stone-400 font-normal">≈ ₹{totalInr.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all text-sm"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
