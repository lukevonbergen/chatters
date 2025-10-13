const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Venue IDs
const venues = [
  { id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', name: 'The Lion of Beaconsfield' },
  { id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', name: 'The Dunn Inn' },
  { id: 'ba9c45d4-3947-4560-9327-7f00c695d177', name: 'The Fox' }
];

// Manager user IDs (from your users table)
const managerUsers = [
  { id: '653c284c-b69c-481f-b9bc-040b00f07b90', email: 'mattjj6@gmail.com' },
  { id: '3c51bf89-784c-4a65-8aba-63f67cfb4b37', email: 'Matthewjjackson@me.com' },
  { id: 'be8f278b-aee9-4bb3-87df-253681872732', email: 'luke-vb1@gmail.com' },
  { id: '0d86d189-203e-4fe2-872d-6bb0907da401', email: 'bon.mar69@pornhub.com' },
  { id: '2b278b63-e3a0-48d5-b394-cea4f4c22a41', email: 'hh@gg.com' },
  { id: '5ecb48b8-acca-4787-87ed-91d4f1ab8234', email: 'will.smith738@yahoo.com' },
  { id: '27a1a650-aa74-4c37-91c9-dc1169c03840', email: 'luke_vb1@outlook.com' }
];

async function createStaffLinks() {
  console.log('🔗 Creating staff table entries for manager users...\n');

  // Get employees for each venue to use their names
  const employeesByVenue = {};
  for (const venue of venues) {
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .eq('venue_id', venue.id)
      .eq('role', 'Manager');

    if (employees && employees.length > 0) {
      employeesByVenue[venue.id] = employees[0]; // Use first manager
    }
  }

  const staffRecords = [];

  // Create 2-3 manager links per venue for testing
  venues.forEach((venue, index) => {
    const managerEmployee = employeesByVenue[venue.id];

    if (!managerEmployee) {
      console.log(`⚠️  No manager employee found for ${venue.name}`);
      return;
    }

    // Link 2-3 manager users to each venue
    const managersForVenue = managerUsers.slice(index * 2, index * 2 + 3);

    managersForVenue.forEach((user, userIndex) => {
      staffRecords.push({
        user_id: user.id,
        venue_id: venue.id
        // Note: role field has constraint, leaving it null
      });

      console.log(`✓ Linking ${user.email} to ${venue.name}`);
    });
  });

  // Insert staff records
  const { data, error } = await supabase
    .from('staff')
    .insert(staffRecords)
    .select();

  if (error) {
    console.error('\n❌ Error inserting staff records:', error.message);
    if (error.code === '23505') {
      console.log('   Some staff links already exist (duplicate key). Continuing...');
    } else {
      throw error;
    }
  } else {
    console.log(`\n✅ Created ${data.length} staff links!`);
  }

  // Verify
  console.log('\n📊 Verification:\n');
  for (const venue of venues) {
    const { data: staff, count } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('venue_id', venue.id);

    console.log(`${venue.name}: ${count} managers linked`);
    if (staff) {
      staff.forEach(s => {
        const user = managerUsers.find(u => u.id === s.user_id);
        console.log(`  - ${user?.email || 'unknown'}`);
      });
    }
  }

  console.log('\n✅ Staff links created successfully!\n');
}

createStaffLinks();
