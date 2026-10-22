export type UserRole = 'customer' | 'artisan' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  user_id: string;
  bio?: string;
  avatar_url?: string;
  default_currency: string;
  country: string;
  city?: string;
  address_line?: string;
}

export interface Artisan {
  id: string;
  user_id: string;
  brand_name: string;
  craft_type: string;
  story: string;
  location: string;
  village: string;
  state: string;
  country: string;
  verified: boolean;
  rating: number;
  total_sales: number;
  image_url: string;
  phone: string;
  iec_code?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  suggested_hs_code: string;
}

export interface Product {
  id: string;
  artisan_id: string;
  artisan_name: string;
  category_id: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  price_inr: number;
  stock: number;
  weight_kg: number;
  dimensions: string;
  material: string;
  country_of_origin: string;
  images: string[];
  suggested_hs_code: string;
  hs_confidence: 'High' | 'Medium' | 'Low';
  hs_code_verified: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  created_at: string;
  rating: number;
  reviews_count: number;
  artisan?: Artisan;
}

export interface HSCodeMaster {
  id: string;
  category: string;
  keywords: string[];
  hs_code: string;
  description: string;
  country_rules: string;
  duty_notes: string;
  confidence_rating: 'High' | 'Medium';
}

export interface HSSuggestionResult {
  hs_code: string;
  category: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_score: number;
  matched_keywords: string[];
  country_rules: string;
  duty_notes: string;
  disclaimer: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  artisan_id: string;
  artisan_name: string;
  quantity: number;
  price_inr: number;
  converted_price: number;
  suggested_hs_code: string;
  weight_kg: number;
  image: string;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total_inr: number;
  selected_currency: string;
  exchange_rate: number;
  converted_total: number;
  shipping_address: ShippingAddress;
  status: OrderStatus;
  tracking_number?: string;
  created_at: string;
  customs_document_id?: string;
}

export interface CustomsDocument {
  id: string;
  order_id: string;
  order_number: string;
  invoice_number: string;
  invoice_date: string;
  exporter: {
    name: string;
    organization: string;
    address: string;
    iec_code: string;
    gstin: string;
    country: string;
    contact: string;
  };
  buyer: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    email: string;
    phone: string;
  };
  country_of_origin: string;
  destination_country: string;
  items: {
    product_name: string;
    hs_code: string;
    quantity: number;
    unit_price_inr: number;
    total_price_inr: number;
    unit_price_converted: number;
    total_price_converted: number;
    weight_kg: number;
  }[];
  currency: string;
  exchange_rate: number;
  total_value_inr: number;
  total_value_converted: number;
  total_weight_kg: number;
  declaration: string;
  disclaimer: string;
  verification_status: 'Suggested' | 'Admin_Verified' | 'Shipped';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  last_updated: string;
}

export const TYPES_VERSION = '1.0.0';
