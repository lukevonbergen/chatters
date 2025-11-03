// /api/admin/populate-rating-trends.js
// Populates 30 days of rating trend data for Google and TripAdvisor for demo venues
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching venues...');

    // Get all venues from the account (limit to 3)
    const { data: venues, error: venuesError } = await supabaseAdmin
      .from('venues')
      .select('id, name')
      .order('created_at', { ascending: true })
      .limit(3);

    if (venuesError) {
      console.error('Error fetching venues:', venuesError);
      return res.status(500).json({ error: 'Failed to fetch venues', details: venuesError });
    }

    if (!venues || venues.length === 0) {
      return res.status(404).json({ error: 'No venues found' });
    }

    console.log(`Found ${venues.length} venues`);

    // Rating configurations for each venue
    const venueConfigs = [
      { startRating: 3.9, endRating: 4.7 },
      { startRating: 4.2, endRating: 4.8 },
      { startRating: 3.4, endRating: 4.3 }
    ];

    const days = 30;
    const now = new Date();
    const results = [];

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
      await supabaseAdmin
        .from('venue_google_ratings')
        .delete()
        .eq('venue_id', venue.id);

      await supabaseAdmin
        .from('venue_tripadvisor_ratings')
        .delete()
        .eq('venue_id', venue.id);

      // Insert Google ratings
      console.log(`Inserting ${googleInserts.length} Google ratings...`);
      const { error: googleError } = await supabaseAdmin
        .from('venue_google_ratings')
        .insert(googleInserts);

      if (googleError) {
        console.error('Error inserting Google ratings:', googleError);
        results.push({
          venue: venue.name,
          google: 'failed',
          googleError: googleError.message
        });
      } else {
        console.log('✓ Google ratings inserted successfully');
      }

      // Insert TripAdvisor ratings
      console.log(`Inserting ${tripadvisorInserts.length} TripAdvisor ratings...`);
      const { error: tripadvisorError } = await supabaseAdmin
        .from('venue_tripadvisor_ratings')
        .insert(tripadvisorInserts);

      if (tripadvisorError) {
        console.error('Error inserting TripAdvisor ratings:', tripadvisorError);
        results.push({
          venue: venue.name,
          tripadvisor: 'failed',
          tripadvisorError: tripadvisorError.message
        });
      } else {
        console.log('✓ TripAdvisor ratings inserted successfully');
      }

      results.push({
        venue: venue.name,
        google: googleError ? 'failed' : 'success',
        tripadvisor: tripadvisorError ? 'failed' : 'success',
        googleRecords: googleInserts.length,
        tripadvisorRecords: tripadvisorInserts.length
      });
    }

    console.log('✅ Rating trend data population complete!');

    return res.status(200).json({
      success: true,
      message: 'Rating trend data populated successfully',
      totalRecords: Math.min(venues.length, 3) * days * 2,
      venues: results
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to populate rating trends',
      details: error.message
    });
  }
};
