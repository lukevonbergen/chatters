const { createClient } = require('@supabase/supabase-js');

const url = 'https://xjznwqvwlooarskroogf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAwODgwNCwiZXhwIjoyMDY2NTg0ODA0fQ.7EZdFEIzOTQm12SLq2YOQjfBR5vhiKzacUJfEiAsCEU';

const supabase = createClient(url, serviceRoleKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function createTable() {
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Master users can view their account invitations" ON manager_invitations;
DROP POLICY IF EXISTS "Master users can create invitations" ON manager_invitations;
DROP POLICY IF EXISTS "Master users can update their account invitations" ON manager_invitations;
DROP POLICY IF EXISTS "Master users can delete their account invitations" ON manager_invitations;
DROP POLICY IF EXISTS "Admin users have full access to invitations" ON manager_invitations;

-- Master users can view invitations for their account
CREATE POLICY "Master users can view their account invitations"
    ON manager_invitations FOR SELECT
    USING (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Master users can create invitations for their account
CREATE POLICY "Master users can create invitations"
    ON manager_invitations FOR INSERT
    WITH CHECK (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Master users can update invitations for their account
CREATE POLICY "Master users can update their account invitations"
    ON manager_invitations FOR UPDATE
    USING (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Master users can delete invitations for their account
CREATE POLICY "Master users can delete their account invitations"
    ON manager_invitations FOR DELETE
    USING (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Admin users have full access
CREATE POLICY "Admin users have full access to invitations"
    ON manager_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );
  `;

  try {
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      // Try using the REST API directly
      const response = await fetch(`${url}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ Table created successfully via REST API!');
    } else {
      console.log('✅ Table created successfully via RPC!');
    }

    // Verify the table was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('manager_invitations')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  Table may not have been created:', verifyError.message);
    } else {
      console.log('✅ Verified: manager_invitations table exists and is accessible!\n');
      console.log('You can now add managers through the dashboard.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTrying direct SQL execution via Supabase Management API...\n');

    // Fall back to direct SQL execution
    const { error: sqlError } = await supabase.rpc('exec', {
      query: sql
    }).catch(async (e) => {
      // Last resort: execute each statement separately
      console.log('Attempting to execute SQL statements individually...\n');

      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (!statement.trim()) continue;

        try {
          const res = await fetch(`${url}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`
            },
            body: JSON.stringify({ query: statement })
          });

          if (res.ok) {
            console.log('✅ Executed:', statement.substring(0, 50) + '...');
          }
        } catch (err) {
          console.log('⚠️  Skipped:', statement.substring(0, 50) + '...');
        }
      }
    });

    console.log('\n📝 If automatic creation failed, the SQL is in:');
    console.log('   supabase/migrations/20251101_create_manager_invitations_table.sql\n');
  }
}

createTable();
