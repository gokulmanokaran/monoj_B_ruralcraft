import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, AlertCircle, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Category, HSSuggestionResult } from '../../types';
import { HSCodeBadge } from '../../components/HSCodeBadge';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { artisan } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [hsSuggestion, setHsSuggestion] = useState<HSSuggestionResult | null>(null);
  const [hsLoading, setHsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price_inr: '',
    stock: '10',
    weight_kg: '0.5',
    dimensions: '',
    material: '',
    country_of_origin: 'India',
    images: '',
    suggested_hs_code: ''
  });

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const categoryName = categories.find(c => c.id === form.category_id)?.name || '';

  // Auto-suggest HS code on form changes
  useEffect(() => {
    if (!form.name && !form.material) return;
    const timer = setTimeout(async () => {
      if (form.name.length < 3) return;
      setHsLoading(true);
      try {
        const suggestion = await api.suggestHSCode({
          name: form.name,
          material: form.material,
          description: form.description,
          category_name: categoryName
        });
        setHsSuggestion(suggestion);
        setForm(prev => ({ ...prev, suggested_hs_code: suggestion.hs_code }));
      } catch (e) {
        // silently fail
      } finally {
        setHsLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.name, form.material, form.category_id]);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price_inr || !form.category_id) {
      error('Product name, price, and category are required');
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls = form.images
        ? form.images.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

      const product = await api.createProduct({
        name: form.name,
        category_id: form.category_id,
        description: form.description,
        price_inr: parseFloat(form.price_inr),
        stock: parseInt(form.stock),
        weight_kg: parseFloat(form.weight_kg),
        dimensions: form.dimensions,
        material: form.material,
        country_of_origin: form.country_of_origin,
        images: imageUrls,
        suggested_hs_code: form.suggested_hs_code || hsSuggestion?.hs_code
      });
      success(`Product "${product.name}" created successfully!`);
      navigate('/artisan/products');
    } catch (err: any) {
      error(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826] transition-all";

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={() => navigate('/artisan')}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#143826] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="font-heading font-black text-2xl text-stone-900">Add New Product</h1>
          <p className="text-sm text-stone-500 mt-1">List your handmade craft on the global marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-800">Product Information</h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Product Name *</label>
              <input className={inputClass} required value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="Handmade Bamboo Fruit Basket" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Category *</label>
                <select className={inputClass} required value={form.category_id} onChange={e => update('category_id', e.target.value)}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Price (INR) *</label>
                <input className={inputClass} required type="number" min="0" value={form.price_inr}
                  onChange={e => update('price_inr', e.target.value)} placeholder="1200" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Description</label>
              <textarea className={inputClass + ' resize-none'} rows={3} value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe your craft, its origin, and the making process..." />
            </div>
          </div>

          {/* Physical Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-800">Physical Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Stock Quantity</label>
                <input className={inputClass} type="number" min="0" value={form.stock} onChange={e => update('stock', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Weight (kg)</label>
                <input className={inputClass} type="number" step="0.01" min="0" value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Dimensions</label>
                <input className={inputClass} value={form.dimensions} onChange={e => update('dimensions', e.target.value)} placeholder="32cm x 24cm x 10cm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Material</label>
                <input className={inputClass} value={form.material} onChange={e => update('material', e.target.value)} placeholder="River Bamboo" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Country of Origin</label>
              <input className={inputClass} value={form.country_of_origin} onChange={e => update('country_of_origin', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Image URLs (one per line)</label>
              <textarea className={inputClass + ' resize-none'} rows={2} value={form.images}
                onChange={e => update('images', e.target.value)}
                placeholder="https://images.unsplash.com/photo-xxx" />
            </div>
          </div>

          {/* HS Code Section */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#DDA15E]/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#BC6C25]" />
              <h2 className="font-heading font-bold text-base text-stone-800">HS Code Classification</h2>
              {hsLoading && <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />}
            </div>

            {hsSuggestion ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-stone-600">Suggested HS Code:</span>
                  <HSCodeBadge hsCode={hsSuggestion.hs_code} confidence={hsSuggestion.confidence} interactive />
                </div>
                <div className="text-xs text-stone-500 bg-stone-50 rounded-xl p-3">
                  <strong>Category:</strong> {hsSuggestion.category}<br />
                  <strong>Confidence:</strong> {hsSuggestion.confidence} ({hsSuggestion.confidence_score}%)<br />
                  <strong>Matched:</strong> {hsSuggestion.matched_keywords.join(', ')}<br />
                  <strong>Duty Notes:</strong> {hsSuggestion.duty_notes}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Override HS Code (optional)</label>
                  <input className={inputClass} value={form.suggested_hs_code} onChange={e => update('suggested_hs_code', e.target.value)} placeholder={hsSuggestion.hs_code} />
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <AlertCircle className="w-4 h-4" />
                Enter product name and material to auto-suggest HS code
              </div>
            )}

            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              ⚠️ Customs Classification: HS codes are system suggestions based on craft materials and category. Verify before export.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? 'Creating Product...' : 'Publish Product to Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
};
