const { createClient } = require('@supabase/supabase-js');

// This script adds first_name and last_name columns to manager_invitations table
const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - REACT_APP_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function addNameColumns() {
  console.log('🔧 Adding first_name and last_name columns to manager_invitations table...\n');

  try {
    // Try to add the columns using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE manager_invitations
        ADD COLUMN IF NOT EXISTS first_name TEXT,
        ADD COLUMN IF NOT EXISTS last_name TEXT;
      `
    });

    if (error) {
      // If RPC doesn't exist, try direct query
      const { error: directError } = await supabase
        .from('manager_invitations')
        .select('first_name, last_name')
        .limit(1);

      if (directError && directError.code === '42703') {
        // Column doesn't exist
        console.log('⚠️  Columns do not exist and cannot be added via API.');
        console.log('   You need to add them manually in Supabase Dashboard:');
        console.log('   1. Go to Table Editor > manager_invitations');
        console.log('   2. Add column: first_name (type: text)');
        console.log('   3. Add column: last_name (type: text)\n');
        process.exit(1);
      } else {
        console.log('✅ Columns already exist or were added successfully!\n');
      }
    } else {
      console.log('✅ Columns added successfully!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  You may need to add these columns manually in Supabase Dashboard:');
    console.log('   1. Go to Table Editor > manager_invitations');
    console.log('   2. Add column: first_name (type: text)');
    console.log('   3. Add column: last_name (type: text)\n');
    process.exit(1);
  }
}

addNameColumns();
