import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminInserts() {
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'user@gmail.com',
    password: 'user@123'
  });

  console.log('Logged in as user/admin:', auth.user?.id);

  // 1. Try Artisan insert
  const { data: art, error: artErr } = await supabase.from('artisans').insert([
    {
      user_id: auth.user!.id,
      brand_name: 'Heritage Rural Artisans',
      craft_type: 'Traditional Indian Handicrafts',
      story: 'Generations of handcrafted mastery from rural communities across India.',
      location: 'Jaipur, Rajasthan',
      village: 'Sanganer',
      state: 'Rajasthan',
      country: 'India',
      verified: true,
      rating: 5.0,
      total_sales: 24,
      phone: '+91 98765 43210'
    }
  ]).select();

  console.log('Artisan insert:', art ? 'SUCCESS id=' + art[0].id : 'ERROR: ' + artErr?.message);

  // 2. Try Category insert
  const { data: cat, error: catErr } = await supabase.from('categories').insert([
    {
      name: 'Pottery & Ceramics',
      slug: 'pottery-ceramics',
      icon: 'Coffee',
      description: 'Handcrafted terracotta, blue pottery, and glazed ceramic tableware.',
      suggested_hs_code: '6912.00'
    }
  ]).select();

  console.log('Category insert:', cat ? 'SUCCESS id=' + cat[0].id : 'ERROR: ' + catErr?.message);

  // 3. Try Product insert if artisan & category succeeded or exist
  if (art && cat) {
    const { data: prod, error: prodErr } = await supabase.from('products').insert([
      {
        artisan_id: art[0].id,
        category_id: cat[0].id,
        name: 'Handcrafted Blue Pottery Ceramic Vase',
        slug: 'handcrafted-blue-pottery-ceramic-vase-' + Date.now(),
        description: 'Authentic Jaipur blue pottery vase handcrafted using quartz stone and natural mineral pigments.',
        price_inr: 2450,
        stock: 18,
        weight_kg: 1.15,
        material: 'Quartz Powder, Natural Glaze',
        country_of_origin: 'India',
        suggested_hs_code: '6912.00',
        hs_confidence: 'High',
        hs_code_verified: true,
        status: 'active'
      }
    ]).select();

    console.log('Product insert:', prod ? 'SUCCESS id=' + prod[0].id : 'ERROR: ' + prodErr?.message);

    if (prod) {
      // 4. Try Product Image insert
      const { data: img, error: imgErr } = await supabase.from('product_images').insert([
        {
          product_id: prod[0].id,
          image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
          is_primary: true,
          sort_order: 0
        }
      ]).select();
      console.log('Product image insert:', img ? 'SUCCESS id=' + img[0].id : 'ERROR: ' + imgErr?.message);
    }
  }
}

testAdminInserts();
