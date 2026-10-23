import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('--- INSPECTING PRODUCTS TABLE SCHEMA ---');
  // Attempt to insert a dummy product to see column validation and error messages
  const testProd = {
    title: 'Handcrafted Terracotta Vase',
    slug: 'handcrafted-terracotta-vase-' + Date.now(),
    description: 'Traditional handcrafted terracotta vase made with natural river clay.',
    price_inr: 1250,
    price_usd: 15,
    stock: 25,
    weight_kg: 1.2,
    origin_country: 'India',
    origin_state: 'Rajasthan',
    hs_code: '6912.00',
    status: 'active',
    featured: true
  };

  const { data, error } = await supabase.from('products').insert([testProd]).select();
  if (error) {
    console.log('Insert error:', error.message, error.details, error.hint, error.code);
  } else {
    console.log('Insert SUCCESS! Product ID:', data[0]?.id);
    console.log('Columns:', Object.keys(data[0]));
  }
}

inspectSchema();
