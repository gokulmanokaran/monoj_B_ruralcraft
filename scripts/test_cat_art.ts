import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('--- TESTING CATEGORY INSERT ---');
  const { data: catData, error: catErr } = await supabase.from('categories').insert([
    {
      name: 'Handloom & Textiles',
      slug: 'handloom-textiles',
      icon: 'Scissors',
      description: 'Handwoven natural textiles, scarves, and rugs.',
      suggested_hs_code: '5208.52'
    }
  ]).select();

  console.log('Category insert:', catData ? 'SUCCESS id=' + catData[0].id : 'ERROR: ' + catErr?.message);

  console.log('--- TESTING ARTISAN INSERT ---');
  // Check if profile exists
  const { data: profs } = await supabase.from('profiles').select('id, full_name, role').limit(1);
  if (profs && profs.length > 0) {
    const pId = profs[0].id;
    const { data: artData, error: artErr } = await supabase.from('artisans').insert([
      {
        user_id: pId,
        brand_name: 'Master Artisan Studio',
        craft_type: 'Handloom Weaving',
        story: 'Preserving ancient weaving traditions with organic dyes.',
        location: 'Jaipur, Rajasthan',
        village: 'Sanganer',
        state: 'Rajasthan',
        country: 'India',
        verified: true,
        rating: 4.9,
        total_sales: 15,
        phone: '+91 98765 43210'
      }
    ]).select();
    console.log('Artisan insert:', artData ? 'SUCCESS id=' + artData[0].id : 'ERROR: ' + artErr?.message);
  }
}

testInsert();
