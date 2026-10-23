import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavxfpixxanfeakornff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmails() {
  const testList = [
    'admin@ruralcraft.com',
    'admin.global@gmail.com',
    'ruralcraft.admin@gmail.com',
    'admin123@gmail.com',
    'admin@gmail.com'
  ];

  for (const email of testList) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'admin@123',
    });
    console.log(email, error ? 'FAIL: ' + error.message : 'OK: ' + data.user?.id);
  }
}

testEmails();
