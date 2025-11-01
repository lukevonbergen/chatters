const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // Get all data
  const { data: venues } = await supabase.from('venues').select('*');
  const { data: accounts } = await supabase.from('accounts').select('*');
  const { data: users } = await supabase.from('users').select('*');

  console.log('📊 DATABASE HEALTH CHECK\n');
  console.log('Total Venues:', venues.length);
  console.log('Total Accounts:', accounts.length);
  console.log('Total Users:', users.length);

  console.log('\n🔍 Checking linkages...\n');

  // Check if all venues have accounts
  const venuesWithoutAccounts = venues.filter(v => !v.account_id);
  console.log('Venues WITHOUT account_id:', venuesWithoutAccounts.length);
  if (venuesWithoutAccounts.length > 0) {
    venuesWithoutAccounts.forEach(v => console.log('  -', v.name, v.id));
  }

  // Check if all venues link to existing accounts
  const orphanedVenues = venues.filter(v => {
    if (!v.account_id) return true;
    return !accounts.find(a => a.id === v.account_id);
  });
  console.log('Venues with INVALID account_id:', orphanedVenues.length);
  if (orphanedVenues.length > 0) {
    orphanedVenues.forEach(v => console.log('  -', v.name, '→', v.account_id));
  }

  // Check if all users have accounts
  const usersWithoutAccounts = users.filter(u => !u.account_id);
  console.log('Users WITHOUT account_id:', usersWithoutAccounts.length);
  if (usersWithoutAccounts.length > 0) {
    usersWithoutAccounts.forEach(u => console.log('  -', u.email, u.id, 'role:', u.role));
  }

  // Check if all users link to existing accounts
  const orphanedUsers = users.filter(u => {
    if (!u.account_id) return true;
    return !accounts.find(a => a.id === u.account_id);
  });
  console.log('Users with INVALID account_id:', orphanedUsers.length);

  // Check accounts billing data
  console.log('\n💳 Checking billing data...\n');
  accounts.forEach(a => {
    console.log('Account:', a.name || a.id);
    console.log('  is_paid:', a.is_paid);
    console.log('  trial_ends_at:', a.trial_ends_at);
    console.log('  stripe_customer_id:', a.stripe_customer_id || 'null');
    console.log('  stripe_subscription_id:', a.stripe_subscription_id || 'null');
    console.log('  demo_account:', a.demo_account || false);

    // Count linked entities
    const linkedVenues = venues.filter(v => v.account_id === a.id);
    const linkedUsers = users.filter(u => u.account_id === a.id);
    console.log('  Linked venues:', linkedVenues.length);
    console.log('  Linked users:', linkedUsers.length);
    console.log('');
  });

  console.log('✅ Health check complete!');
})();
