const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xjznwqvwlooarskroogf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDg4MDQsImV4cCI6MjA2NjU4NDgwNH0.5HVpJZg5tX3SvbpYipGUD55pkuYNrJTapZoVsKYjk9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryVenues() {
  try {
    // First, find the account ID for "LMVB Pub Group Ltd"
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .ilike('name', '%LMVB%');

    if (accountError) {
      console.log('Error fetching accounts:', accountError);
      // Try without name filter
      const { data: allAccounts, error: allAccountsError } = await supabase
        .from('accounts')
        .select('*');

      console.log('All accounts:', JSON.stringify(allAccounts, null, 2));
    } else {
      console.log('LMVB Accounts:', JSON.stringify(accounts, null, 2));
    }

    // Get the Lion of Beaconsfield venue to find its account
    const { data: lionVenue, error: lionError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', 'd877bd0b-6522-409f-9192-ca996e1a7f48')
      .single();

    if (lionError) {
      console.log('Error fetching Lion venue:', lionError);
    } else {
      console.log('\nLion of Beaconsfield venue:', JSON.stringify(lionVenue, null, 2));

      // Now get all venues for this account
      const { data: allVenues, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .eq('account_id', lionVenue.account_id);

      if (venuesError) {
        console.log('Error fetching venues:', venuesError);
      } else {
        console.log('\nAll venues in account:', JSON.stringify(allVenues, null, 2));

        // Get staff for each venue
        for (const venue of allVenues) {
          const { data: staff, error: staffError } = await supabase
            .from('staff')
            .select('*')
            .eq('venue_id', venue.id);

          if (staffError) {
            console.log(`Error fetching staff for ${venue.name}:`, staffError);
          } else {
            console.log(`\nStaff for ${venue.name}:`, JSON.stringify(staff, null, 2));
          }
        }

        // Get questions for each venue
        for (const venue of allVenues) {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('venue_id', venue.id);

          if (questionsError) {
            console.log(`Error fetching questions for ${venue.name}:`, questionsError);
          } else {
            console.log(`\nQuestions for ${venue.name}:`, JSON.stringify(questions, null, 2));
          }
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

queryVenues();
