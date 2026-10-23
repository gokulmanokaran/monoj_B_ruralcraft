import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- TESTING SUPABASE AUTH ---');
  // Check admin login
  const { data: adminLogin, error: adminErr } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin@123'
  });
  console.log('Admin signIn:', adminLogin?.user?.id ? 'SUCCESS (id: ' + adminLogin.user.id + ')' : 'FAIL: ' + adminErr?.message);

  // Check user login
  const { data: userLogin, error: userErr } = await supabase.auth.signInWithPassword({
    email: 'user@gmail.com',
    password: 'user@123'
  });
  console.log('User signIn:', userLogin?.user?.id ? 'SUCCESS (id: ' + userLogin.user.id + ')' : 'FAIL: ' + userErr?.message);

  // Try signing up admin if not exists
  if (adminErr) {
    console.log('Attempting admin signUp...');
    const { data: adminUp, error: upErr } = await supabase.auth.signUp({
      email: 'admin@gmail.com',
      password: 'admin@123',
      options: {
        data: {
          full_name: 'Administrator',
          role: 'admin'
        }
      }
    });
    console.log('Admin signUp result:', adminUp?.user?.id ? 'SUCCESS id=' + adminUp.user.id : 'FAIL: ' + upErr?.message);
  }

  // Try signing up user if not exists
  if (userErr) {
    console.log('Attempting user signUp...');
    const { data: userUp, error: upErr2 } = await supabase.auth.signUp({
      email: 'user@gmail.com',
      password: 'user@123',
      options: {
        data: {
          full_name: 'Customer User',
          role: 'customer'
        }
      }
    });
    console.log('User signUp result:', userUp?.user?.id ? 'SUCCESS id=' + userUp.user.id : 'FAIL: ' + upErr2?.message);
  }

  console.log('\n--- TESTING PRODUCTS TABLE ---');
  const { data: prodData, error: prodErr } = await supabase.from('products').select('*').limit(2);
  if (prodErr) {
    console.log('Products select error:', prodErr.message);
  } else {
    console.log('Products count in sample:', prodData?.length);
    if (prodData && prodData.length > 0) {
      console.log('Products sample keys:', Object.keys(prodData[0]));
      console.log('First product:', prodData[0]);
    }
  }

  console.log('\n--- TESTING STORAGE BUCKETS ---');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets, bErr ? 'Err: ' + bErr.message : '');

  console.log('\n--- TESTING CATEGORIES & ARTISANS ---');
  const { data: cats } = await supabase.from('categories').select('*');
  console.log('Categories count:', cats?.length, cats?.map(c => ({ id: c.id, name: c.name })));

  const { data: arts } = await supabase.from('artisans').select('*');
  console.log('Artisans count:', arts?.length, arts?.map(a => ({ id: a.id, brand: a.brand_name })));

  const { data: profs } = await supabase.from('profiles').select('*');
  console.log('Profiles count:', profs?.length, profs);
}

check().then(() => console.log('Done check'));
