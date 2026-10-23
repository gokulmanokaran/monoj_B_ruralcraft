import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithAuth() {
  console.log('--- SIGNING IN WITH USER@GMAIL.COM ---');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'user@gmail.com',
    password: 'user@123'
  });

  if (authErr || !auth.session) {
    console.log('Auth error:', authErr?.message);
    return;
  }

  console.log('Signed in as user id:', auth.user.id);

  // Try creating an artisan record for this authenticated user
  const { data: artData, error: artErr } = await supabase.from('artisans').insert([
    {
      user_id: auth.user.id,
      brand_name: 'Rural Crafts Studio',
      craft_type: 'Handloom & Pottery',
      story: 'Artisans preserving heritage rural crafts across India.',
      location: 'Jaipur, Rajasthan',
      village: 'Sanganer',
      state: 'Rajasthan',
      country: 'India',
      verified: true,
      rating: 5.0,
      total_sales: 0,
      phone: '+91 98765 43210'
    }
  ]).select();

  console.log('Artisan insert while authenticated:', artData ? 'SUCCESS id=' + artData[0].id : 'ERROR: ' + artErr?.message);

  // Try category insert
  const { data: catData, error: catErr } = await supabase.from('categories').insert([
    {
      name: 'Handloom & Textiles',
      slug: 'handloom-textiles',
      icon: 'Scissors',
      description: 'Handwoven natural textiles, scarves, and rugs.',
      suggested_hs_code: '5208.52'
    }
  ]).select();
  console.log('Category insert while authenticated:', catData ? 'SUCCESS id=' + catData[0].id : 'ERROR: ' + catErr?.message);

  // Check if we can create a category if not allowed or what policies exist
}

testWithAuth();
