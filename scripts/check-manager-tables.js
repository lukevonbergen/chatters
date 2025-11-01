const { createClient } = require('@supabase/supabase-js');

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function checkTables() {
  console.log('🔍 Checking for manager-related tables...\n');

  // Check for manager_invitations table
  const { data: invitations, error: invError } = await supabase
    .from('manager_invitations')
    .select('*')
    .limit(1);

  if (invError) {
    if (invError.code === '42P01') {
      console.log('❌ manager_invitations table does NOT exist');
    } else {
      console.log('⚠️  Error checking manager_invitations:', invError.message);
    }
  } else {
    console.log('✅ manager_invitations table exists');
    console.log('   Sample data:', invitations);
  }

  // Check staff table
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .limit(1);

  if (staffError) {
    console.log('❌ staff table error:', staffError.message);
  } else {
    console.log('\n✅ staff table exists');
    console.log('   Sample data:', staff);
  }

  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'manager')
    .limit(1);

  if (usersError) {
    console.log('\n❌ users table error:', usersError.message);
  } else {
    console.log('\n✅ users table exists');
    console.log('   Manager users count:', users?.length || 0);
  }
}

checkTables();
