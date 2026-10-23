import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Package, Globe, Award } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { api } from '../services/api';
import type { Artisan } from '../types';

export const ArtisansPage: React.FC = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getArtisans().then(setArtisans).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-[#BC6C25] mb-2">The Artisans</div>
          <h1 className="font-heading text-3xl lg:text-5xl font-black text-[#1F2421]">
            Meet Our Rural Craft Masters
          </h1>
          <p className="text-stone-500 mt-3 text-base max-w-xl mx-auto">
            Verified rural craftmakers bringing centuries-old techniques to international markets
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-stone-200 rounded-2xl" />)}
          </div>
        ) : artisans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">🧑‍🎨</div>
            <h3 className="font-heading font-bold text-xl text-stone-700">No artisans found</h3>
            <p className="text-sm text-stone-400">Rural craft masters registered on the platform will appear here.</p>
            <Link to="/register?role=artisan" className="mt-2 px-5 py-2.5 bg-[#143826] text-white rounded-xl text-xs font-bold hover:bg-[#0D2818] transition-colors">
              Become an Artisan
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan, i) => (
              <motion.div
                key={artisan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/artisans/${artisan.id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#2D6A4F]/30">
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img
                        src={artisan.image_url}
                        alt={artisan.brand_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop'; }}
                      />
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {artisan.verified && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading font-bold text-base text-stone-900 mb-0.5 group-hover:text-[#143826] transition-colors">
                        {artisan.brand_name}
                      </h3>
                      <p className="text-xs text-[#BC6C25] font-semibold mb-2">{artisan.craft_type}</p>
                      <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
                        <Globe className="w-3 h-3" />
                        {artisan.village}, {artisan.state}, {artisan.country}
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">{artisan.story}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          ⭐ {artisan.rating}
                        </div>
                        <span className="text-stone-400">{artisan.total_sales}+ products sold</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
