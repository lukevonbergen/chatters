const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.REACT_APP_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - REACT_APP_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function createManagerInvitationsTable() {
  console.log('🔧 Creating manager_invitations table...\n');

  const sql = `
    -- Create manager_invitations table for tracking manager invitation flow
    CREATE TABLE IF NOT EXISTS manager_invitations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        venue_ids UUID[] NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        accepted_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_manager_invitations_email ON manager_invitations(email);
    CREATE INDEX IF NOT EXISTS idx_manager_invitations_token ON manager_invitations(token);
    CREATE INDEX IF NOT EXISTS idx_manager_invitations_account_id ON manager_invitations(account_id);
    CREATE INDEX IF NOT EXISTS idx_manager_invitations_status ON manager_invitations(status);
    CREATE INDEX IF NOT EXISTS idx_manager_invitations_expires_at ON manager_invitations(expires_at);

    -- Add RLS policies
    ALTER TABLE manager_invitations ENABLE ROW LEVEL SECURITY;
  `;

  try {
    // Execute the SQL using the REST API
    const response = await fetch(`${url}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative approach - just let the API call fail and it will show us the error
      console.log('⚠️  Cannot execute SQL via API.');
      console.log('\n📋 Please create the table manually in Supabase Dashboard:');
      console.log('   1. Go to SQL Editor in your Supabase Dashboard');
      console.log('   2. Copy and paste the migration file:');
      console.log('      supabase/migrations/20251101_create_manager_invitations_table.sql');
      console.log('   3. Click "Run"\n');

      // Also save SQL to a file for easy copying
      console.log('✅ Migration SQL file created at:');
      console.log('   supabase/migrations/20251101_create_manager_invitations_table.sql\n');

      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Table created successfully!');
    console.log('   You can now add managers through the dashboard.\n');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    console.log('\n📋 Please create the table manually in Supabase Dashboard:');
    console.log('   1. Go to SQL Editor in your Supabase Dashboard');
    console.log('   2. Copy and paste the migration file:');
    console.log('      supabase/migrations/20251101_create_manager_invitations_table.sql');
    console.log('   3. Click "Run"\n');
    process.exit(1);
  }
}

createManagerInvitationsTable();
