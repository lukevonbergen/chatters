const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running Stripe fields migration\n');

  try {
    // Read the migration file
    const sql = fs.readFileSync('migrations/add_stripe_fields_to_accounts.sql', 'utf8');
    console.log('Migration SQL:\n', sql);
    console.log('\n' + '='.repeat(60) + '\n');

    // Since Supabase doesn't have a direct SQL execution endpoint from client,
    // we'll use the REST API to add columns via table alterations

    console.log('Adding stripe_customer_id column...');
    // Supabase client doesn't support ALTER TABLE, so we need to use raw SQL
    // For now, let's verify what we need and provide manual steps

    console.log('\n⚠️  Manual migration required!\n');
    console.log('Please run the following SQL in your Supabase SQL Editor:\n');
    console.log(sql);
    console.log('\nTo run this:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Paste the SQL above');
    console.log('6. Click "Run"');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runMigration();
