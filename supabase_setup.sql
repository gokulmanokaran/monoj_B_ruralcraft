-- ========================================================================
-- RURALCRAFT GLOBAL - COMPLETE SUPABASE SETUP SCRIPT
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- Project: https://supabase.com/dashboard/project/kavxfpixxanfeakornff/sql
-- ========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure PROFILES table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- 3. CATEGORIES: Enable RLS with Full Access for All
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select categories" ON public.categories;
CREATE POLICY "Allow select categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert categories" ON public.categories;
CREATE POLICY "Allow insert categories" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update categories" ON public.categories;
CREATE POLICY "Allow update categories" ON public.categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete categories" ON public.categories;
CREATE POLICY "Allow delete categories" ON public.categories FOR DELETE USING (true);

-- 4. ARTISANS: Enable RLS with Full Access
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select artisans" ON public.artisans;
CREATE POLICY "Allow select artisans" ON public.artisans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert artisans" ON public.artisans;
CREATE POLICY "Allow insert artisans" ON public.artisans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update artisans" ON public.artisans;
CREATE POLICY "Allow update artisans" ON public.artisans FOR UPDATE USING (true);

-- 5. PRODUCTS: Enable RLS with Full Access for Catalog
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active products are viewable by all" ON public.products;
CREATE POLICY "Active products are viewable by all" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
CREATE POLICY "Allow insert products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update products" ON public.products;
CREATE POLICY "Allow update products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete products" ON public.products;
CREATE POLICY "Allow delete products" ON public.products FOR DELETE USING (true);

-- 6. PRODUCT IMAGES: Enable RLS with Full Access
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select product_images" ON public.product_images;
CREATE POLICY "Allow select product_images" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert product_images" ON public.product_images;
CREATE POLICY "Allow insert product_images" ON public.product_images FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update product_images" ON public.product_images;
CREATE POLICY "Allow update product_images" ON public.product_images FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete product_images" ON public.product_images;
CREATE POLICY "Allow delete product_images" ON public.product_images FOR DELETE USING (true);

-- 7. ORDERS & ORDER ITEMS: Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all orders" ON public.orders;
CREATE POLICY "Allow all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all order_items" ON public.order_items;
CREATE POLICY "Allow all order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- 8. CUSTOMS DOCUMENTS: Enable RLS
ALTER TABLE public.customs_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all customs" ON public.customs_documents;
CREATE POLICY "Allow all customs" ON public.customs_documents FOR ALL USING (true) WITH CHECK (true);

-- 9. HS CODES MASTER: Enable RLS
ALTER TABLE public.hs_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all hs_codes" ON public.hs_codes;
CREATE POLICY "Allow all hs_codes" ON public.hs_codes FOR ALL USING (true) WITH CHECK (true);

-- 10. CURRENCY RATES: Enable RLS
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all currency_rates" ON public.currency_rates;
CREATE POLICY "Allow all currency_rates" ON public.currency_rates FOR ALL USING (true) WITH CHECK (true);

-- ========================================================================
-- SEED INITIAL DATA IN SUPABASE
-- ========================================================================

-- Insert Master Categories
INSERT INTO public.categories (id, name, slug, icon, description, suggested_hs_code)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'Pottery & Ceramics', 'pottery-ceramics', 'Coffee', 'Handcrafted terracotta, blue pottery, and glazed ceramic tableware.', '6912.00'),
  ('c2222222-2222-2222-2222-222222222222', 'Handloom & Textiles', 'handloom-textiles', 'Scissors', 'Handwoven natural textiles, scarves, and silk embroidery.', '5208.52'),
  ('c3333333-3333-3333-3333-333333333333', 'Woodcraft & Carvings', 'woodcraft-carvings', 'Hammer', 'Carved teak, rosewood, and sandalwood decorative crafts.', '4420.10'),
  ('c4444444-4444-4444-4444-444444444444', 'Jewelry & Metalcraft', 'jewelry-metalcraft', 'Sparkles', 'Dokra brass casting, silver filigree, and tribal jewelry.', '7117.19'),
  ('c5555555-5555-5555-5555-555555555555', 'Basketry & Cane Weaving', 'basketry-cane', 'Package', 'Handplaited bamboo, jute baskets, and wicker items.', '4602.11'),
  ('c6666666-6666-6666-6666-666666666666', 'Stone & Marble Craft', 'stone-marble', 'Gem', 'Hand-carved soapstone, marble inlay, and sculptured artifacts.', '6802.91')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  suggested_hs_code = EXCLUDED.suggested_hs_code;

-- Insert Master Artisan
INSERT INTO public.artisans (id, user_id, brand_name, craft_type, story, location, village, state, country, verified, rating, total_sales, phone)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'cb4e2b50-f983-468a-bbfd-5ead910275ea',
  'Rural Heritage Studio',
  'Traditional Indian Master Crafts',
  'Generations of authentic handcrafted master artisans from rural Indian communities.',
  'Jaipur, Rajasthan',
  'Sanganer',
  'Rajasthan',
  'India',
  true,
  5.0,
  35,
  '+91 98765 43210'
) ON CONFLICT (id) DO NOTHING;

-- Seed Initial Live Currency Rates
INSERT INTO public.currency_rates (base, rates, last_updated)
VALUES (
  'INR',
  '{"INR": 1.0, "USD": 0.01185, "EUR": 0.01095, "GBP": 0.00938, "AED": 0.0435, "AUD": 0.0181, "CAD": 0.0163, "SGD": 0.0157, "JPY": 1.815}'::jsonb,
  NOW()
) ON CONFLICT DO NOTHING;
