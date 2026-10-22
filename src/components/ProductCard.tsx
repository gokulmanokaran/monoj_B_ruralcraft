import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Award, Shield } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { PriceDisplay } from './PriceDisplay';
import { HSCodeBadge } from './HSCodeBadge';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { success } = useToast();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    success(`"${product.name}" added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
    success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const fallbackImg = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link to={`/products/${product.slug}`} className="block group">
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 hover:border-[#2D6A4F]/30">
          {/* Image */}
          <div className="relative overflow-hidden aspect-square bg-stone-100">
            <img
              src={imgError ? fallbackImg : (product.images?.[0] || fallbackImg)}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Category badge */}
            <div className="absolute top-2.5 left-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
                {product.category_name}
              </span>
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
            </button>

            {/* Quick add hover overlay */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 flex gap-2 bg-gradient-to-t from-black/70 to-transparent">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#143826] hover:bg-[#0D2818] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-heading font-bold text-sm leading-snug text-stone-900 line-clamp-2 group-hover:text-[#143826] transition-colors flex-1">
                {product.name}
              </h3>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <Award className="w-3 h-3 text-[#BC6C25]" />
              <span className="text-xs text-[#BC6C25] font-semibold truncate">{product.artisan_name}</span>
              {product.hs_code_verified && (
                <Shield className="w-3 h-3 text-[#2D6A4F] ml-1" title="HS Code Verified" />
              )}
            </div>

            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-stone-700">{product.rating}</span>
              <span className="text-xs text-stone-400">({product.reviews_count} reviews)</span>
            </div>

            <div className="flex items-end justify-between gap-1">
              <PriceDisplay priceInr={product.price_inr} size="sm" />
              {product.suggested_hs_code && (
                <HSCodeBadge
                  hsCode={product.suggested_hs_code}
                  confidence={product.hs_confidence}
                  verified={product.hs_code_verified}
                  size="sm"
                  interactive={false}
                />
              )}
            </div>

            {product.stock > 0 && product.stock <= 5 && (
              <div className="mt-2 text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Only {product.stock} left!
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
