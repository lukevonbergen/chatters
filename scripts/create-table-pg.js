const { Client } = require('pg');
const fs = require('fs');

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAwODgwNCwiZXhwIjoyMDY2NTg0ODA0fQ.7EZdFEIzOTQm12SLq2YOQjfBR5vhiKzacUJfEiAsCEU';

// Construct connection string - use direct connection, not pooler
const connectionString = `postgresql://postgres.xjznwqvwlooarskroogf:${serviceRoleKey}@aws-0-eu-west-2.pooler.supabase.com:5432/postgres`;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  console.log('🔧 Creating manager_invitations table...\n');

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read the SQL file
    const sql = fs.readFileSync('supabase/migrations/20251101_create_manager_invitations_table.sql', 'utf8');

    // Execute the SQL
    await client.query(sql);

    console.log('✅ Table created successfully!\n');

    // Verify the table exists
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'manager_invitations'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Table structure:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ You can now add managers through the dashboard!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTable();
