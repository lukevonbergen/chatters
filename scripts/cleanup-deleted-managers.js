const { createClient } = require('@supabase/supabase-js');

// This script permanently deletes managers that were soft-deleted more than 14 days ago
// Run this as a cron job or manually

const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - REACT_APP_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function cleanupDeletedManagers() {
  console.log('🔍 Finding soft-deleted managers older than 14 days...\n');

  // Calculate date 14 days ago
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Find managers deleted more than 14 days ago
  const { data: deletedManagers, error: fetchError } = await supabase
    .from('users')
    .select('id, email, deleted_at')
    .eq('role', 'manager')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', fourteenDaysAgo.toISOString());

  if (fetchError) {
    console.error('❌ Error fetching deleted managers:', fetchError);
    return;
  }

  if (!deletedManagers || deletedManagers.length === 0) {
    console.log('✅ No managers found that need permanent deletion.\n');
    return;
  }

  console.log(`Found ${deletedManagers.length} manager(s) to permanently delete:\n`);
  deletedManagers.forEach(m => {
    const daysAgo = Math.floor((Date.now() - new Date(m.deleted_at)) / (1000 * 60 * 60 * 24));
    console.log(`  - ${m.email} (deleted ${daysAgo} days ago)`);
  });

  console.log('\n🗑️  Permanently deleting managers...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const manager of deletedManagers) {
    try {
      // Delete staff records
      const { error: staffError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', manager.id);

      if (staffError) {
        console.error(`❌ Failed to delete staff records for ${manager.email}:`, staffError.message);
        errorCount++;
        continue;
      }

      // Delete user record
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', manager.id);

      if (userError) {
        console.error(`❌ Failed to delete user ${manager.email}:`, userError.message);
        errorCount++;
        continue;
      }

      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(manager.id);

      if (authError) {
        console.log(`⚠️  Deleted user ${manager.email}, but auth deletion failed (this may be okay)`);
      } else {
        console.log(`✅ Permanently deleted ${manager.email}`);
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
  console.log('\n✨ Cleanup complete!\n');
}

cleanupDeletedManagers();
