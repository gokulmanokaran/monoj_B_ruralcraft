import { generateCustomsPDF } from '../src/services/pdfGenerator';

const mockOrder: any = {
  id: 'ord-123',
  order_number: 'RCG-889900',
  customer_name: 'Manoj Kumar',
  customer_email: 'user@gmail.com',
  customer_phone: '+91 9876543210',
  items: [
    {
      product_id: 'p1',
      product_name: 'Jaipur Blue Pottery Vase',
      quantity: 1,
      price_inr: 1850,
      converted_price: 21.92,
      suggested_hs_code: '6912.00',
      weight_kg: 0.8
    }
  ],
  total_inr: 1850,
  selected_currency: 'USD',
  exchange_rate: 0.01185,
  converted_total: 21.92,
  shipping_address: {
    full_name: 'Manoj Kumar',
    address: '123 Craft Lane',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postal_code: '600040'
  },
  status: 'Confirmed',
  created_at: new Date().toISOString()
};

const mockDoc: any = {
  order_id: 'ord-123',
  invoice_number: 'INV-889900',
  invoice_date: '2026-10-23',
  exporter: {
    name: 'RuralCraft Global Hub',
    organization: 'Artisan Export Consortium',
    address: 'New Delhi, India',
    iec_code: '0519048821',
    gstin: '07AAAAA0000A1Z5',
    country: 'India',
    contact: '+91 80 4200 8888'
  },
  buyer: {
    name: 'Manoj Kumar',
    address: '123 Craft Lane',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postal_code: '600040',
    email: 'user@gmail.com',
    phone: '+91 9876543210'
  },
  country_of_origin: 'India',
  destination_country: 'India',
  items: [
    {
      product_name: 'Jaipur Blue Pottery Vase',
      hs_code: '6912.00',
      quantity: 1,
      unit_price_inr: 1850,
      total_price_inr: 1850,
      unit_price_converted: 21.92,
      total_price_converted: 21.92,
      weight_kg: 0.8
    }
  ],
  currency: 'USD',
  exchange_rate: 0.01185,
  total_value_inr: 1850,
  total_value_converted: 21.92,
  total_weight_kg: 0.8,
  declaration: 'Declaration text',
  disclaimer: 'Disclaimer text',
  verification_status: 'Suggested'
};

try {
  generateCustomsPDF(mockDoc, mockOrder);
  console.log('PDF Generated successfully!');
} catch (e: any) {
  console.error('PDF Generation ERROR:', e.message, e.stack);
}
