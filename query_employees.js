const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xjznwqvwlooarskroogf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDg4MDQsImV4cCI6MjA2NjU4NDgwNH0.5HVpJZg5tX3SvbpYipGUD55pkuYNrJTapZoVsKYjk9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryEmployees() {
  const venueIds = [
    'd7683570-11ac-4007-ba95-dcdb4ef6c101', // The Dunn Inn
    'ba9c45d4-3947-4560-9327-7f00c695d177', // The Fox
    'd877bd0b-6522-409f-9192-ca996e1a7f48'  // The Lion of Beaconsfield
  ];

  for (const venueId of venueIds) {
    const { data: venue } = await supabase
      .from('venues')
      .select('name')
      .eq('id', venueId)
      .single();

    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('venue_id', venueId);

    if (error) {
      console.log(`Error fetching employees for ${venue?.name}:`, error);
    } else {
      console.log(`\nEmployees for ${venue?.name}:`, JSON.stringify(employees, null, 2));
    }
  }
}

queryEmployees();
