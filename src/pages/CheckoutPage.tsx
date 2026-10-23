import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { PriceDisplay } from '../components/PriceDisplay';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

const STEPS = ['Customer Info', 'Shipping Address', 'Review Order', 'Confirmation'];

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
}

// Declared outside CheckoutPage so React retains DOM focus and does not remount on keystroke
const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder = '',
  id
}) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-stone-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826] transition-all"
    />
  </div>
);

export const CheckoutPage: React.FC = () => {
  const { items, totalInr, clearCart } = useCart();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  // Sync user info if user was loaded asynchronously
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const update = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    if (!items.length) {
      error('Cart is empty');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await api.placeOrder({
        customer_name: formData.full_name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code
        },
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        selected_currency: currency
      });
      setOrderId(resp.order.order_number);
      clearCart();
      setStep(3);
      success(`Order ${resp.order.order_number} placed successfully!`);
    } catch (err: any) {
      error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-[#143826] text-white' :
                  'bg-stone-200 text-stone-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-semibold text-center max-w-16 leading-tight ${
                  i === step ? 'text-[#143826]' : 'text-stone-400'
                }`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-emerald-400' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 0: Customer Info */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-black text-xl text-stone-900 mb-5">Customer Information</h2>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <InputField
                  id="checkout-full-name"
                  label="Full Name"
                  value={formData.full_name}
                  onChange={v => update('full_name', v)}
                  placeholder="Johnathan Doe"
                />
                <InputField
                  id="checkout-email"
                  label="Email Address"
                  value={formData.email}
                  onChange={v => update('email', v)}
                  type="email"
                  placeholder="you@example.com"
                />
                <InputField
                  id="checkout-phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={v => update('phone', v)}
                  type="tel"
                  placeholder="+1 415 555 0192"
                />
              </div>
              <button
                type="button"
                id="continue-to-shipping-btn"
                onClick={() => {
                  if (!formData.full_name || !formData.email || !formData.phone) {
                    error('Please fill all required fields');
                    return;
                  }
                  setStep(1);
                }}
                className="mt-5 w-full py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                Continue to Shipping <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-black text-xl text-stone-900 mb-5">International Shipping Address</h2>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <InputField
                  id="checkout-address"
                  label="Street Address"
                  value={formData.address}
                  onChange={v => update('address', v)}
                  placeholder="450 Mission Street, Apt 12B"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    id="checkout-city"
                    label="City"
                    value={formData.city}
                    onChange={v => update('city', v)}
                    placeholder="San Francisco"
                  />
                  <InputField
                    id="checkout-state"
                    label="State / Province"
                    value={formData.state}
                    onChange={v => update('state', v)}
                    placeholder="CA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    id="checkout-country"
                    label="Country"
                    value={formData.country}
                    onChange={v => update('country', v)}
                    placeholder="United States"
                  />
                  <InputField
                    id="checkout-postal-code"
                    label="Postal Code"
                    value={formData.postal_code}
                    onChange={v => update('postal_code', v)}
                    placeholder="94105"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-5 py-3.5 border border-stone-300 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="review-order-btn"
                  onClick={() => {
                    if (!formData.address || !formData.city || !formData.country) {
                      error('Please fill shipping address');
                      return;
                    }
                    setStep(2);
                  }}
                  className="flex-1 py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  Review Order <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-black text-xl text-stone-900 mb-5">Review & Confirm Order</h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-white rounded-xl border border-stone-200">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=100&auto=format&fit=crop'; }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-stone-400">{item.product.artisan_name} · Qty: {item.quantity}</p>
                    </div>
                    <PriceDisplay priceInr={item.product.price_inr * item.quantity} size="sm" showInrBase={false} />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 mb-4 text-sm space-y-1">
                <div className="font-bold text-stone-700 mb-1">Shipping to:</div>
                <p className="text-stone-600">{formData.full_name}</p>
                <p className="text-stone-500">{formData.address}, {formData.city}, {formData.state} {formData.postal_code}</p>
                <p className="text-stone-500">{formData.country} · {formData.email}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-5">
                ℹ️ After placing order: Customs Commercial Invoice & HS Codes will be automatically generated. Download PDF from your order details page.
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 mb-5 flex justify-between items-center">
                <span className="font-bold text-stone-800">Total</span>
                <PriceDisplay priceInr={totalInr} size="lg" showInrBase={true} />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-stone-300 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Placing Order...' : 'Place International Order'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-heading font-black text-2xl text-stone-900 mb-2">Order Confirmed!</h2>
              <p className="text-stone-500 text-sm mb-1">Thank you for supporting rural artisan communities.</p>
              {orderId && (
                <p className="text-xs font-mono font-bold text-[#143826] bg-[#143826]/10 px-3 py-1.5 rounded-full inline-block mb-6">
                  Order #{orderId}
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/explore')}
                  className="px-6 py-3 border border-stone-200 rounded-xl text-sm font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/account/orders')}
                  className="px-6 py-3 bg-[#143826] text-white rounded-xl text-sm font-bold hover:bg-[#0D2818] cursor-pointer"
                >
                  View My Orders
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};
