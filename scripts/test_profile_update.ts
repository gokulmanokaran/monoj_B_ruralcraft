import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileUpdate() {
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'user@gmail.com',
    password: 'user@123'
  });

  if (!auth.session) {
    console.log('Failed login');
    return;
  }

  const { data, error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', auth.user.id).select();
  console.log('Update profile to admin:', data ? 'SUCCESS: ' + JSON.stringify(data[0]) : 'ERROR: ' + error?.message);
}

testProfileUpdate();
