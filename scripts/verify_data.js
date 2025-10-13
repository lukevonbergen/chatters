const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyData() {
  const venues = [
    { id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', name: 'The Lion of Beaconsfield' },
    { id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', name: 'The Dunn Inn' },
    { id: 'ba9c45d4-3947-4560-9327-7f00c695d177', name: 'The Fox' }
  ];

  console.log('📊 Verifying Demo Data\n');
  console.log('==========================================\n');

  for (const venue of venues) {
    console.log(`📍 ${venue.name}`);

    // Count employees
    const { count: empCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', venue.id);

    // Count feedback
    const { count: feedbackCount } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', venue.id);

    // Count assistance requests
    const { count: assistCount } = await supabase
      .from('assistance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', venue.id);

    // Get date range
    const { data: dateRange } = await supabase
      .from('feedback')
      .select('created_at')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: true })
      .limit(1);

    const { data: dateRangeEnd } = await supabase
      .from('feedback')
      .select('created_at')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Get rating distribution
    const { data: ratings } = await supabase
      .from('feedback')
      .select('rating')
      .eq('venue_id', venue.id);

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings?.forEach(r => ratingCounts[r.rating]++);

    console.log(`   Employees: ${empCount}`);
    console.log(`   Feedback: ${feedbackCount}`);
    console.log(`   Assistance Requests: ${assistCount}`);

    if (dateRange && dateRange[0] && dateRangeEnd && dateRangeEnd[0]) {
      const start = new Date(dateRange[0].created_at).toLocaleDateString();
      const end = new Date(dateRangeEnd[0].created_at).toLocaleDateString();
      console.log(`   Date Range: ${start} - ${end}`);
    }

    console.log(`   Rating Distribution:`);
    console.log(`     ⭐ 1 star: ${ratingCounts[1]}`);
    console.log(`     ⭐ 2 stars: ${ratingCounts[2]}`);
    console.log(`     ⭐ 3 stars: ${ratingCounts[3]}`);
    console.log(`     ⭐ 4 stars: ${ratingCounts[4]}`);
    console.log(`     ⭐ 5 stars: ${ratingCounts[5]}`);
    console.log('');
  }

  console.log('==========================================');
  console.log('✅ Verification Complete!\n');
}

verifyData();
