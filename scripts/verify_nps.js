const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyNPS() {
  const venues = [
    { id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', name: 'The Lion of Beaconsfield' },
    { id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', name: 'The Dunn Inn' },
    { id: 'ba9c45d4-3947-4560-9327-7f00c695d177', name: 'The Fox' }
  ];

  console.log('📧 Verifying NPS Data\n');
  console.log('==========================================\n');

  let totalSubmissions = 0;
  let totalSent = 0;
  let totalResponses = 0;
  let allPromoters = 0;
  let allPassives = 0;
  let allDetractors = 0;

  for (const venue of venues) {
    console.log(`📍 ${venue.name}`);

    // Get all NPS submissions
    const { data: submissions, count } = await supabase
      .from('nps_submissions')
      .select('*', { count: 'exact' })
      .eq('venue_id', venue.id);

    if (!submissions) {
      console.log('   ⚠️  No NPS data found\n');
      continue;
    }

    // Calculate metrics
    const sent = submissions.filter(s => s.sent_at).length;
    const responses = submissions.filter(s => s.score !== null);
    const pending = submissions.filter(s => !s.sent_at).length;
    const failed = submissions.filter(s => s.send_error).length;

    const promoters = responses.filter(s => s.score >= 9).length;
    const passives = responses.filter(s => s.score >= 7 && s.score <= 8).length;
    const detractors = responses.filter(s => s.score <= 6).length;

    const npsScore = responses.length > 0
      ? Math.round(((promoters - detractors) / responses.length) * 100)
      : 0;

    const responseRate = sent > 0
      ? Math.round((responses.length / sent) * 100)
      : 0;

    console.log(`   Total Submissions: ${count}`);
    console.log(`   Sent: ${sent} | Pending: ${pending} | Failed: ${failed}`);
    console.log(`   Responses: ${responses.length} (${responseRate}% response rate)`);
    console.log(`   NPS Score: ${npsScore}`);
    console.log(`   Promoters (9-10): ${promoters}`);
    console.log(`   Passives (7-8): ${passives}`);
    console.log(`   Detractors (0-6): ${detractors}`);

    // Score distribution
    const scoreDistribution = {};
    for (let i = 0; i <= 10; i++) {
      scoreDistribution[i] = responses.filter(s => s.score === i).length;
    }

    console.log(`   Score Distribution:`);
    for (let i = 10; i >= 0; i--) {
      if (scoreDistribution[i] > 0) {
        const bar = '█'.repeat(Math.ceil(scoreDistribution[i] / 10));
        console.log(`     ${i}: ${bar} ${scoreDistribution[i]}`);
      }
    }

    // Get date range
    const { data: dateRange } = await supabase
      .from('nps_submissions')
      .select('created_at')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: true })
      .limit(1);

    const { data: dateRangeEnd } = await supabase
      .from('nps_submissions')
      .select('created_at')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (dateRange && dateRange[0] && dateRangeEnd && dateRangeEnd[0]) {
      const start = new Date(dateRange[0].created_at).toLocaleDateString();
      const end = new Date(dateRangeEnd[0].created_at).toLocaleDateString();
      console.log(`   Date Range: ${start} - ${end}`);
    }

    console.log('');

    totalSubmissions += count;
    totalSent += sent;
    totalResponses += responses.length;
    allPromoters += promoters;
    allPassives += passives;
    allDetractors += detractors;
  }

  // Overall summary
  console.log('==========================================');
  console.log('Overall NPS Summary');
  console.log('==========================================');
  console.log(`Total Submissions: ${totalSubmissions}`);
  console.log(`Total Sent: ${totalSent}`);
  console.log(`Total Responses: ${totalResponses}`);

  const overallNPS = totalResponses > 0
    ? Math.round(((allPromoters - allDetractors) / totalResponses) * 100)
    : 0;

  const overallResponseRate = totalSent > 0
    ? Math.round((totalResponses / totalSent) * 100)
    : 0;

  console.log(`Overall Response Rate: ${overallResponseRate}%`);
  console.log(`Overall NPS Score: ${overallNPS}`);
  console.log(`Promoters: ${allPromoters} (${Math.round(allPromoters / totalResponses * 100)}%)`);
  console.log(`Passives: ${allPassives} (${Math.round(allPassives / totalResponses * 100)}%)`);
  console.log(`Detractors: ${allDetractors} (${Math.round(allDetractors / totalResponses * 100)}%)`);
  console.log('==========================================\n');

  console.log('✅ Verification Complete!\n');
}

verifyNPS();
