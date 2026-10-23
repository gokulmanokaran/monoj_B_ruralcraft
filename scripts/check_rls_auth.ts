import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthTables() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'user@gmail.com',
    password: 'user@123'
  });
  console.log('Logged in:', auth.user?.id);

  const tables = ['categories', 'artisans', 'products', 'product_images', 'hs_codes', 'currency_rates', 'orders'];
  for (const t of tables) {
    const { error } = await supabase.from(t).insert([{}]);
    console.log(`[${t}] Auth Insert test:`, error?.message);
  }
}

testAuthTables();
