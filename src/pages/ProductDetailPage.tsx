import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Star, Shield, Package, Award,
  Info, ChevronLeft, ChevronRight, Minus, Plus, Globe, Check
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { api } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { PriceDisplay } from '../components/PriceDisplay';
import { HSCodeBadge } from '../components/HSCodeBadge';
import { CurrencySelector } from '../components/CurrencySelector';
import { useCurrency } from '../context/CurrencyContext';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getProduct(slug)
      .then(p => { setProduct(p); setSelectedImage(0); })
      .catch(() => error('Failed to load product details'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    success(`${quantity}× "${product.name}" added to cart!`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4 py-4">
            <div className="h-6 bg-stone-200 rounded w-2/3" />
            <div className="h-10 bg-stone-200 rounded" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-16 bg-stone-200 rounded" />
            <div className="h-12 bg-stone-200 rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <div className="text-6xl">🏺</div>
          <h2 className="font-heading text-2xl font-bold text-stone-700">Product not found</h2>
          <Link to="/explore" className="px-6 py-3 bg-[#143826] text-white rounded-xl font-semibold">
            Continue Exploring
          </Link>
        </div>
      </MainLayout>
    );
  }

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop'];
  const { inrString, convertedString } = formatPrice(product.price_inr);

  const specs = [
    { label: 'Material', value: product.material },
    { label: 'Origin', value: product.country_of_origin },
    { label: 'Weight', value: `${product.weight_kg} kg` },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Stock', value: `${product.stock} units available` },
    { label: 'Handmade', value: 'Yes — 100% Handcrafted' }
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-400 mb-6">
          <Link to="/" className="hover:text-[#143826]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/explore" className="hover:text-[#143826]">Explore</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-700 font-medium truncate max-w-48">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-stone-100 aspect-square mb-3">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop'; }}
              />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === i ? 'border-[#143826] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=200&auto=format&fit=crop'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#143826]/10 text-[#143826]">
                {product.category_name}
              </span>
              {product.hs_code_verified && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> HS Verified
                </span>
              )}
            </div>

            <h1 className="font-heading text-2xl lg:text-3xl font-black text-[#1F2421] mb-3 leading-tight">
              {product.name}
            </h1>

            <Link to={`/artisans/${product.artisan_id}`} className="flex items-center gap-2 mb-3 group">
              <Award className="w-4 h-4 text-[#BC6C25]" />
              <span className="text-sm font-semibold text-[#BC6C25] group-hover:text-[#143826] transition-colors">
                by {product.artisan_name}
              </span>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-stone-800">{product.rating}</span>
              <span className="text-sm text-stone-400">({product.reviews_count} verified reviews)</span>
            </div>

            {/* Price */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-5">
              <div className="flex items-start justify-between">
                <div>
                  <PriceDisplay priceInr={product.price_inr} size="xl" showInrBase={true} />
                  <div className="text-xs text-stone-400 mt-1">Price per unit | Shipping calculated at checkout</div>
                </div>
                <CurrencySelector />
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-600 hover:text-[#143826] transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold text-stone-800 min-w-[32px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-600 hover:text-[#143826] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-stone-500">
                {product.stock > 0 ? (
                  <span className={product.stock <= 5 ? 'text-amber-600 font-semibold' : ''}>
                    {product.stock <= 5 ? `⚡ Only ${product.stock} left` : `${product.stock} in stock`}
                  </span>
                ) : (
                  <span className="text-rose-500 font-semibold">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Add to Cart & Buy Now */}
            <div className="flex gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#143826] hover:bg-[#0D2818] text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </motion.button>
              <Link
                to="/checkout"
                className="px-5 py-3.5 rounded-xl border-2 border-[#143826] text-[#143826] font-bold text-sm hover:bg-[#143826]/5 transition-all text-center flex items-center gap-2"
                onClick={handleAddToCart}
              >
                Buy Now
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: Globe, text: 'Ships Worldwide' },
                { icon: Shield, text: 'HS Classified' },
                { icon: Package, text: 'Eco Packaged' }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-[#2D6A4F]" />
                  <div className="text-[10px] font-semibold text-stone-600">{text}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-heading font-bold text-base text-stone-900 mb-2">About this Craft</h2>
              <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specs */}
            <div className="mb-6">
              <h2 className="font-heading font-bold text-base text-stone-900 mb-3">Specifications</h2>
              <div className="grid grid-cols-2 gap-2">
                {specs.map(spec => (
                  <div key={spec.label} className="flex flex-col p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">{spec.label}</span>
                    <span className="text-xs font-semibold text-stone-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HS Code Section */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-[#DDA15E]/50 bg-[#DDA15E]/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#BC6C25] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-sm text-[#1F2421] mb-2">
                    Customs Tariff Classification
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-stone-600">Suggested HS Code:</span>
                    <HSCodeBadge
                      hsCode={product.suggested_hs_code}
                      confidence={product.hs_confidence}
                      verified={product.hs_code_verified}
                      interactive={true}
                    />
                  </div>
                  <div className="text-[10px] text-stone-500 bg-amber-50 border border-amber-200 rounded-lg p-2 leading-relaxed">
                    ⚠️ <strong>Customs Notice:</strong> Suggested HS Code is automatically classified and must be verified by an authorized customs broker prior to international shipment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
