const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRatings() {
  const venues = [
    { id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', name: 'The Lion of Beaconsfield' },
    { id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', name: 'The Dunn Inn' },
    { id: 'ba9c45d4-3947-4560-9327-7f00c695d177', name: 'The Fox' }
  ];

  console.log('📊 Verifying External Ratings Data\n');
  console.log('==========================================\n');

  for (const venue of venues) {
    console.log(`📍 ${venue.name}`);

    // Get current external ratings
    const { data: externalRatings } = await supabase
      .from('external_ratings')
      .select('*')
      .eq('venue_id', venue.id);

    if (externalRatings && externalRatings.length > 0) {
      externalRatings.forEach(rating => {
        console.log(`   ${rating.source}: ${rating.rating} ⭐ (${rating.ratings_count} reviews)`);
      });
    } else {
      console.log('   ⚠️  No external ratings found');
    }

    // Count historical ratings
    const { count: historicalCount } = await supabase
      .from('historical_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', venue.id);

    console.log(`   Historical records: ${historicalCount}`);

    // Get first and last historical rating for each source
    const { data: firstTrip } = await supabase
      .from('historical_ratings')
      .select('rating, recorded_at')
      .eq('venue_id', venue.id)
      .eq('source', 'tripadvisor')
      .order('recorded_at', { ascending: true })
      .limit(1);

    const { data: lastTrip } = await supabase
      .from('historical_ratings')
      .select('rating, recorded_at')
      .eq('venue_id', venue.id)
      .eq('source', 'tripadvisor')
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (firstTrip && firstTrip[0] && lastTrip && lastTrip[0]) {
      console.log(`   TripAdvisor progression: ${firstTrip[0].rating} → ${lastTrip[0].rating}`);
    }

    const { data: firstGoogle } = await supabase
      .from('historical_ratings')
      .select('rating, recorded_at')
      .eq('venue_id', venue.id)
      .eq('source', 'google')
      .order('recorded_at', { ascending: true })
      .limit(1);

    const { data: lastGoogle } = await supabase
      .from('historical_ratings')
      .select('rating, recorded_at')
      .eq('venue_id', venue.id)
      .eq('source', 'google')
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (firstGoogle && firstGoogle[0] && lastGoogle && lastGoogle[0]) {
      console.log(`   Google progression: ${firstGoogle[0].rating} → ${lastGoogle[0].rating}`);
    }

    console.log('');
  }

  // Check employees with roles and locations
  console.log('==========================================');
  console.log('Employee Details\n');
  console.log('==========================================\n');

  for (const venue of venues) {
    console.log(`📍 ${venue.name}`);

    const { data: employees } = await supabase
      .from('employees')
      .select('first_name, last_name, role, location')
      .eq('venue_id', venue.id)
      .order('role', { ascending: true });

    if (employees && employees.length > 0) {
      const roleGroups = employees.reduce((acc, emp) => {
        if (!acc[emp.role]) acc[emp.role] = [];
        acc[emp.role].push(emp);
        return acc;
      }, {});

      Object.keys(roleGroups).forEach(role => {
        console.log(`   ${role}s: ${roleGroups[role].length}`);
        roleGroups[role].forEach(emp => {
          console.log(`     - ${emp.first_name} ${emp.last_name}${emp.location ? ' (' + emp.location + ')' : ''}`);
        });
      });
    }

    console.log('');
  }

  console.log('==========================================');
  console.log('✅ Verification Complete!\n');
}

verifyRatings();
