const { createClient } = require('@supabase/supabase-js');

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function cleanupOrphanedManagers() {
  console.log('🔍 Finding orphaned managers...\n');

  // Get all manager users
  const { data: managers, error: managersError } = await supabase
    .from('users')
    .select('id, email, role, account_id')
    .eq('role', 'manager');

  if (managersError) {
    console.error('Error fetching managers:', managersError);
    return;
  }

  console.log(`Found ${managers.length} manager users\n`);

  // Check which ones have no staff records
  const orphanedManagers = [];

  for (const manager of managers) {
    const { data: staffRecords, error: staffError } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', manager.id)
      .limit(1);

    if (staffError) {
      console.error(`Error checking staff for ${manager.email}:`, staffError);
      continue;
    }

    if (!staffRecords || staffRecords.length === 0) {
      orphanedManagers.push(manager);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total managers: ${managers.length}`);
  console.log(`  Orphaned managers (no venue assignments): ${orphanedManagers.length}`);
  console.log(`  Properly linked managers: ${managers.length - orphanedManagers.length}\n`);

  if (orphanedManagers.length > 0) {
    console.log('🗑️  Orphaned managers to clean up:');
    orphanedManagers.forEach(m => {
      console.log(`  - ${m.email} (${m.id})`);
    });

    console.log('\n⚠️  These users exist but have no venue assignments.');
    console.log('   They were likely created outside the proper invitation flow.');
    console.log('\n💡 To fix this properly:');
    console.log('   1. Delete these orphaned manager accounts');
    console.log('   2. Use the "Add Manager" button in the dashboard');
    console.log('   3. This will send proper invitations and create staff records\n');

    // Show deletion command
    console.log('🔧 To delete these orphaned managers, you can:');
    console.log('   A. Use the UI: Go to Staff > Managers and delete each one');
    console.log('   B. Run a cleanup script (requires service role key)\n');
  } else {
    console.log('✅ No orphaned managers found. All managers are properly linked to venues.\n');
  }
}

cleanupOrphanedManagers();
