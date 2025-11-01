const { createClient } = require('@supabase/supabase-js');

const url = 'https://xjznwqvwlooarskroogf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAwODgwNCwiZXhwIjoyMDY2NTg0ODA0fQ.7EZdFEIzOTQm12SLq2YOQjfBR5vhiKzacUJfEiAsCEU';

const supabase = createClient(url, serviceKey);

async function checkUser() {
  const email = 'lmvonbergen01@gmail.com';

  console.log(`🔍 Checking for user: ${email}\n`);

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (user) {
    console.log('✅ User exists in users table:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   First Name:', user.first_name);
    console.log('   Last Name:', user.last_name);
    console.log('   Account ID:', user.account_id);

    // Check if they have staff records
    const { data: staffRecords } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id);

    console.log('\n   Staff records:', staffRecords?.length || 0);
    if (staffRecords && staffRecords.length > 0) {
      staffRecords.forEach(s => {
        console.log(`     - Venue ID: ${s.venue_id}, Role: ${s.role}`);
      });
    }

    console.log('\n❓ Do you want to delete this user so you can create a new invitation?');
    console.log('   Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/delete-user.js lmvonbergen01@gmail.com\n');
  } else {
    console.log('✅ No user found with this email.');
    console.log('   You can create a manager invitation for this email.\n');
  }
}

checkUser();
