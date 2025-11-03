const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xjznwqvwlooarskroogf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqem53cXZ3bG9vYXJza3Jvb2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAwODgwNCwiZXhwIjoyMDY2NTg0ODA0fQ.7EZdFEIzOTQm12SLq2YOQjfBR5vhiKzacUJfEiAsCEU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to generate ratings with fluctuation
function generateRatings(startRating, endRating, days) {
  const ratings = [];
  const increment = (endRating - startRating) / (days - 1);

  for (let i = 0; i < days; i++) {
    // Calculate base rating with linear progression
    const baseRating = startRating + (increment * i);

    // Add some random fluctuation (-0.1 to +0.1)
    const fluctuation = (Math.random() - 0.5) * 0.2;
    const rating = Math.max(1, Math.min(5, baseRating + fluctuation));

    // Round to 1 decimal place
    ratings.push(parseFloat(rating.toFixed(1)));
  }

  return ratings;
}

// Helper function to generate increasing review counts
function generateReviewCounts(startCount, days) {
  const counts = [];

  for (let i = 0; i < days; i++) {
    // Add 1-5 reviews per day randomly
    const dailyIncrease = Math.floor(Math.random() * 5) + 1;
    const count = startCount + (i * dailyIncrease);
    counts.push(count);
  }

  return counts;
}

async function populateRatingTrends() {
  try {
    console.log('Fetching venues...');

    // Get all venues from the account
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('id, name')
      .order('created_at', { ascending: true })
      .limit(3);

    if (venuesError) {
      console.error('Error fetching venues:', venuesError);
      return;
    }

    if (!venues || venues.length === 0) {
      console.error('No venues found');
      return;
    }

    console.log(`Found ${venues.length} venues\n`);

    // Rating configurations for each venue
    const venueConfigs = [
      { startRating: 3.9, endRating: 4.7 },
      { startRating: 4.2, endRating: 4.8 },
      { startRating: 3.4, endRating: 4.3 }
    ];

    const days = 30;
    const now = new Date();

    for (let i = 0; i < Math.min(venues.length, 3); i++) {
      const venue = venues[i];
      const config = venueConfigs[i];

      console.log(`Processing venue: ${venue.name}`);
      console.log(`Rating progression: ${config.startRating} -> ${config.endRating}`);

      // Generate ratings for 30 days
      const googleRatings = generateRatings(config.startRating, config.endRating, days);
      const tripadvisorRatings = generateRatings(
        config.startRating - 0.1,
        config.endRating - 0.1,
        days
      );

      // Generate review counts (starting from different bases)
      const googleReviewCounts = generateReviewCounts(150 + (i * 50), days);
      const tripadvisorReviewCounts = generateReviewCounts(100 + (i * 30), days);

      // Prepare batch inserts
      const googleInserts = [];
      const tripadvisorInserts = [];

      for (let day = 0; day < days; day++) {
        const recordedAt = new Date(now);
        recordedAt.setDate(recordedAt.getDate() - (days - 1 - day));
        recordedAt.setHours(12, 0, 0, 0); // Noon each day

        googleInserts.push({
          venue_id: venue.id,
          rating: googleRatings[day],
          ratings_count: googleReviewCounts[day],
          recorded_at: recordedAt.toISOString(),
          is_initial: day === 0
        });

        tripadvisorInserts.push({
          venue_id: venue.id,
          rating: tripadvisorRatings[day],
          ratings_count: tripadvisorReviewCounts[day],
          recorded_at: recordedAt.toISOString(),
          is_initial: day === 0
        });
      }

      // Delete existing ratings for this venue first
      console.log('Deleting existing ratings...');
      await supabase
        .from('venue_google_ratings')
        .delete()
        .eq('venue_id', venue.id);

      await supabase
        .from('venue_tripadvisor_ratings')
        .delete()
        .eq('venue_id', venue.id);

      // Insert Google ratings
      console.log(`Inserting ${googleInserts.length} Google ratings...`);
      const { error: googleError } = await supabase
        .from('venue_google_ratings')
        .insert(googleInserts);

      if (googleError) {
        console.error('❌ Error inserting Google ratings:', googleError);
      } else {
        console.log('✓ Google ratings inserted successfully');
      }

      // Insert TripAdvisor ratings
      console.log(`Inserting ${tripadvisorInserts.length} TripAdvisor ratings...`);
      const { error: tripadvisorError } = await supabase
        .from('venue_tripadvisor_ratings')
        .insert(tripadvisorInserts);

      if (tripadvisorError) {
        console.error('❌ Error inserting TripAdvisor ratings:', tripadvisorError);
      } else {
        console.log('✓ TripAdvisor ratings inserted successfully');
      }

      console.log('');
    }

    console.log('✅ Rating trend data population complete!');
    console.log(`Total records created: ${Math.min(venues.length, 3) * days * 2} (${days} days × 2 platforms × ${Math.min(venues.length, 3)} venues)`);

  } catch (error) {
    console.error('Error:', error);
  }
}

populateRatingTrends();
