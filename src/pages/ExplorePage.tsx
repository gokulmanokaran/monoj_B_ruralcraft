import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, Package } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import type { Product, Category } from '../types';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
];

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse">
    <div className="aspect-square bg-stone-200" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-stone-200 rounded w-3/4" />
      <div className="h-3 bg-stone-200 rounded w-1/2" />
      <div className="h-4 bg-stone-200 rounded w-1/3 mt-3" />
    </div>
  </div>
);

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.getProducts({
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        sort,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined
      });
      setProducts(resp.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sort, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSort('popular');
    setPriceRange([0, 10000]);
  };

  const hasActiveFilters = search || selectedCategory || sort !== 'popular';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-[#BC6C25] mb-1">Handmade with Love</div>
          <h1 className="font-heading text-3xl lg:text-4xl font-black text-[#1F2421]">
            Explore Artisan Products
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            {loading ? 'Loading...' : `${products.length} handmade products from verified rural artisans`}
          </p>
        </motion.div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search bamboo, terracotta, handloom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#143826]/30 focus:border-[#143826]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-3 pr-8 py-2.5 border border-stone-200 rounded-xl bg-white text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#143826]/30 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              showFilters ? 'bg-[#143826] text-white border-[#143826]' : 'bg-white text-stone-700 border-stone-200 hover:border-[#143826]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Categories */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    !selectedCategory ? 'bg-[#143826] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.slug ? 'bg-[#143826] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Price Range (₹): ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
              </label>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-[#143826]"
              />
            </div>

            {/* Clear */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Category pills (quick shortcuts) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              !selectedCategory ? 'bg-[#143826] text-white border-[#143826]' : 'bg-white text-stone-600 border-stone-200 hover:border-[#143826]'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.slug ? 'bg-[#143826] text-white border-[#143826]' : 'bg-white text-stone-600 border-stone-200 hover:border-[#143826]'
              }`}
            >
              <span>{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center text-4xl">🧺</div>
            <div>
              <h3 className="font-heading font-bold text-xl text-stone-700">No products found</h3>
              <p className="text-sm text-stone-400 mt-1">Try adjusting your search or filters</p>
            </div>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-[#143826] text-white rounded-xl font-semibold text-sm hover:bg-[#0D2818] transition-colors cursor-pointer">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
