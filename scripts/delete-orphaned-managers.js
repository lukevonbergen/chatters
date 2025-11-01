const { createClient } = require('@supabase/supabase-js');

// This script requires SUPABASE_SERVICE_ROLE_KEY to be set
const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - REACT_APP_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Get your service role key from Supabase Dashboard:');
  console.error('   Settings > API > Project API Keys > service_role key\n');
  console.error('   Then run: SUPABASE_SERVICE_ROLE_KEY=your_key_here node scripts/delete-orphaned-managers.js\n');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function deleteOrphanedManagers() {
  console.log('🔍 Finding orphaned managers...\n');

  // Get all manager users
  const { data: managers, error: managersError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'manager');

  if (managersError) {
    console.error('Error fetching managers:', managersError);
    return;
  }

  // Find orphaned ones
  const orphanedManagers = [];

  for (const manager of managers) {
    const { data: staffRecords } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', manager.id)
      .limit(1);

    if (!staffRecords || staffRecords.length === 0) {
      orphanedManagers.push(manager);
    }
  }

  if (orphanedManagers.length === 0) {
    console.log('✅ No orphaned managers found!\n');
    return;
  }

  console.log(`Found ${orphanedManagers.length} orphaned manager(s):\n`);
  orphanedManagers.forEach(m => {
    console.log(`  - ${m.email}`);
  });

  console.log('\n🗑️  Deleting orphaned managers...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const manager of orphanedManagers) {
    try {
      // Delete from users table first
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', manager.id);

      if (userDeleteError) {
        console.error(`❌ Failed to delete user ${manager.email}:`, userDeleteError.message);
        errorCount++;
        continue;
      }

      // Delete from auth
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(manager.id);

      if (authDeleteError) {
        console.log(`⚠️  Deleted user ${manager.email} from database, but auth deletion failed (this is okay)`);
      } else {
        console.log(`✅ Deleted ${manager.email}`);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ Error deleting ${manager.email}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Successfully deleted: ${successCount}`);
  console.log(`  Failed: ${errorCount}`);
  console.log('\n✨ All orphaned managers have been cleaned up!');
  console.log('   You can now add managers properly through the dashboard.\n');
}

deleteOrphanedManagers();
