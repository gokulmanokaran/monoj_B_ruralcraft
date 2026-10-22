-- ========================================================================
-- RURALCRAFT GLOBAL - SUPABASE POSTGRESQL SCHEMA & SECURITY POLICIES
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'artisan', 'admin')),
  bio TEXT,
  avatar_url TEXT,
  default_currency TEXT DEFAULT 'USD',
  country TEXT DEFAULT 'India',
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ARTISANS
CREATE TABLE IF NOT EXISTS public.artisans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  craft_type TEXT NOT NULL,
  story TEXT NOT NULL,
  location TEXT NOT NULL,
  village TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 5.00,
  total_sales INTEGER DEFAULT 0,
  image_url TEXT,
  phone TEXT,
  iec_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  suggested_hs_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HS CODES MASTER
CREATE TABLE IF NOT EXISTS public.hs_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  hs_code TEXT NOT NULL,
  description TEXT NOT NULL,
  country_rules TEXT,
  duty_notes TEXT,
  confidence_rating TEXT DEFAULT 'High' CHECK (confidence_rating IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price_inr NUMERIC(10,2) NOT NULL CHECK (price_inr >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight_kg NUMERIC(6,3) DEFAULT 0.500,
  dimensions TEXT,
  material TEXT NOT NULL,
  country_of_origin TEXT DEFAULT 'India',
  suggested_hs_code TEXT NOT NULL,
  hs_confidence TEXT DEFAULT 'Medium' CHECK (hs_confidence IN ('High', 'Medium', 'Low')),
  hs_code_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'out_of_stock')),
  rating NUMERIC(3,2) DEFAULT 5.00,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- 7. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_inr NUMERIC(12,2) NOT NULL,
  selected_currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate NUMERIC(12,6) NOT NULL,
  converted_total NUMERIC(12,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_inr NUMERIC(10,2) NOT NULL,
  converted_price NUMERIC(10,2) NOT NULL,
  suggested_hs_code TEXT,
  weight_kg NUMERIC(6,3),
  image_url TEXT
);

-- 10. CUSTOMS DOCUMENTS
CREATE TABLE IF NOT EXISTS public.customs_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exporter JSONB NOT NULL,
  buyer JSONB NOT NULL,
  country_of_origin TEXT DEFAULT 'India',
  destination_country TEXT NOT NULL,
  items JSONB NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate NUMERIC(12,6) NOT NULL,
  total_value_inr NUMERIC(12,2) NOT NULL,
  total_value_converted NUMERIC(12,2) NOT NULL,
  total_weight_kg NUMERIC(8,3) NOT NULL,
  declaration TEXT NOT NULL,
  disclaimer TEXT NOT NULL,
  verification_status TEXT DEFAULT 'Suggested' CHECK (verification_status IN ('Suggested', 'Admin_Verified', 'Shipped')),
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CURRENCY RATES CACHE
CREATE TABLE IF NOT EXISTS public.currency_rates (
  id SERIAL PRIMARY KEY,
  base TEXT DEFAULT 'INR',
  rates JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 12. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_artisan ON public.products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_customs_order ON public.customs_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_hs_codes_category ON public.hs_codes(category);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customs_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public profiles; users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone can read active products; Artisans & Admins can insert/update
CREATE POLICY "Active products are viewable by all" ON public.products FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');
CREATE POLICY "Artisans and Admins can create products" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Artisans can update their own products" ON public.products FOR UPDATE USING (
  artisan_id IN (SELECT id FROM public.artisans WHERE user_id = auth.uid()) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: Users can view own orders, admins view all
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Customs: Admins can update/verify; buyers can view own document
CREATE POLICY "View customs documents" ON public.customs_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = customs_documents.order_id AND orders.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
