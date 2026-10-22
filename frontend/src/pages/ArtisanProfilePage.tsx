import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Star, Award, Shield, ChevronLeft } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { api } from '../services/api';
import type { Artisan, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ArtisanProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getArtisan(id)
      .then(data => { setArtisan(data.artisan); setProducts(data.products); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-56 bg-stone-200 rounded-3xl mb-6" />
          <div className="h-8 bg-stone-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-stone-200 rounded w-2/3" />
        </div>
      </MainLayout>
    );
  }

  if (!artisan) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="text-6xl">🎨</div>
          <h2 className="font-heading font-bold text-xl text-stone-700">Artisan not found</h2>
          <Link to="/artisans" className="text-sm text-[#143826] font-semibold hover:underline">← All Artisans</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/artisans" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#143826] mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> All Artisans
        </Link>

        {/* Artisan Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#143826] to-[#0D2818] rounded-3xl p-6 md:p-10 mb-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-[#DDA15E]/40 shrink-0">
            <img
              src={artisan.image_url}
              alt={artisan.brand_name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'; }}
            />
          </div>
          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="font-heading font-black text-2xl md:text-3xl">{artisan.brand_name}</h1>
              {artisan.verified && (
                <span className="flex items-center gap-1 text-xs font-bold bg-emerald-600/30 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  <Shield className="w-3 h-3" /> Verified Artisan
                </span>
              )}
            </div>
            <p className="text-[#DDA15E] font-semibold text-sm mb-1">{artisan.craft_type}</p>
            <div className="flex items-center gap-1.5 text-stone-300 text-sm mb-3">
              <Globe className="w-4 h-4" />
              {artisan.village}, {artisan.state}, {artisan.country}
            </div>
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl">{artisan.story}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{artisan.rating}</span>
              </div>
              <span className="text-stone-400 text-xs">{artisan.total_sales}+ total sales</span>
              {artisan.iec_code && (
                <span className="text-stone-400 text-xs font-mono">IEC: {artisan.iec_code}</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Products */}
        <div>
          <h2 className="font-heading font-bold text-xl text-stone-900 mb-5">
            Products by {artisan.brand_name}
            <span className="text-sm font-normal text-stone-400 ml-2">({products.length} items)</span>
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-16 text-stone-400">No products listed yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
