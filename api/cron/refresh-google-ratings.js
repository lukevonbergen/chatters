// /api/cron/refresh-google-ratings.js
// Nightly cron job to refresh Google and TripAdvisor ratings for all venues
import { createClient } from '@supabase/supabase-js';

// Config constants
const GOOGLE_PLACES_FIELDS = 'rating,user_ratings_total';
const MAX_DAILY_CALLS = 1000; // Hard cap to control costs
const ACTIVE_VENUE_DAYS = 30; // Only refresh venues with feedback in last 30 days (optional optimization)
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// Create Supabase client with service role for database writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Verify this is a cron request (Vercel sets this header)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = new Date();
  let googleProcessedCount = 0;
  let tripadvisorProcessedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const errors = [];

  try {
    console.log('🔄 Starting nightly Google & TripAdvisor ratings refresh...');

    // Get all venues with place_id OR tripadvisor_location_id
    let venuesQuery = supabaseAdmin
      .from('venues')
      .select('id, place_id, tripadvisor_location_id, name')
      .or('place_id.not.is.null,tripadvisor_location_id.not.is.null');

    // Optional: Only refresh active venues (venues with feedback in last 30 days)
    if (process.env.REFRESH_ACTIVE_ONLY === 'true') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - ACTIVE_VENUE_DAYS);
      
      venuesQuery = venuesQuery
        .select('id, place_id, name, feedback!inner(created_at)')
        .gte('feedback.created_at', cutoffDate.toISOString());
    }

    const { data: venues, error: venuesError } = await venuesQuery;

    if (venuesError) {
      throw new Error(`Failed to fetch venues: ${venuesError.message}`);
    }

    console.log(`📍 Found ${venues.length} venues to refresh`);

    // Process venues in batches to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 0; i < venues.length && (googleProcessedCount + tripadvisorProcessedCount) < MAX_DAILY_CALLS; i += batchSize) {
      const batch = venues.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (venue) => {
          if ((googleProcessedCount + tripadvisorProcessedCount) >= MAX_DAILY_CALLS) {
            skippedCount++;
            return;
          }

          try {
            // Refresh Google if venue has place_id
            if (venue.place_id) {
              console.log(`🔵 Refreshing Google for ${venue.name} (${venue.place_id})`);
              
              const googleData = await fetchGooglePlaceDetails(venue.place_id);
              googleProcessedCount++;

              // Upsert the rating data in cache table
              const { error: upsertError } = await supabaseAdmin
                .from('external_ratings')
                .upsert({
                  venue_id: venue.id,
                  source: 'google',
                  rating: googleData.rating,
                  ratings_count: googleData.user_ratings_total,
                  attributions: googleData.attributions || ['Data © Google'],
                  fetched_at: new Date().toISOString()
                }, {
                  onConflict: 'venue_id,source'
                });

              if (upsertError) {
                throw new Error(`Google database upsert failed: ${upsertError.message}`);
              }

              // Store historical rating every 2 days for progression tracking
              const shouldStoreHistorical = await shouldStoreHistoricalRating(venue.id, 'google');
              if (shouldStoreHistorical && googleData.rating) {
                const { error: historyError } = await supabaseAdmin
                  .from('historical_ratings')
                  .insert({
                    venue_id: venue.id,
                    source: 'google',
                    rating: googleData.rating,
                    ratings_count: googleData.user_ratings_total,
                    is_initial: false,
                    recorded_at: new Date().toISOString()
                  });

                if (historyError) {
                  console.warn(`⚠️ Failed to store Google historical rating for ${venue.name}: ${historyError.message}`);
                } else {
                  console.log(`📊 Stored Google historical rating for ${venue.name}`);
                }
              }

              console.log(`✅ Updated Google for ${venue.name}: ${googleData.rating} ⭐ (${googleData.user_ratings_total} reviews)`);
            }

            // Refresh TripAdvisor if venue has tripadvisor_location_id
            if (venue.tripadvisor_location_id) {
              console.log(`🟢 Refreshing TripAdvisor for ${venue.name} (${venue.tripadvisor_location_id})`);
              
              const tripadvisorData = await fetchTripAdvisorLocationDetails(venue.tripadvisor_location_id);
              tripadvisorProcessedCount++;

              // Upsert the rating data in cache table
              const { error: upsertError } = await supabaseAdmin
                .from('external_ratings')
                .upsert({
                  venue_id: venue.id,
                  source: 'tripadvisor',
                  rating: tripadvisorData.rating,
                  ratings_count: tripadvisorData.num_reviews,
                  fetched_at: new Date().toISOString()
                }, {
                  onConflict: 'venue_id,source'
                });

              if (upsertError) {
                throw new Error(`TripAdvisor database upsert failed: ${upsertError.message}`);
              }

              // Store historical rating every 2 days for progression tracking
              const shouldStoreHistorical = await shouldStoreHistoricalRating(venue.id, 'tripadvisor');
              if (shouldStoreHistorical && tripadvisorData.rating) {
                const { error: historyError } = await supabaseAdmin
                  .from('historical_ratings')
                  .insert({
                    venue_id: venue.id,
                    source: 'tripadvisor',
                    rating: tripadvisorData.rating,
                    ratings_count: tripadvisorData.num_reviews,
                    is_initial: false,
                    recorded_at: new Date().toISOString()
                  });

                if (historyError) {
                  console.warn(`⚠️ Failed to store TripAdvisor historical rating for ${venue.name}: ${historyError.message}`);
                } else {
                  console.log(`📊 Stored TripAdvisor historical rating for ${venue.name}`);
                }
              }

              console.log(`✅ Updated TripAdvisor for ${venue.name}: ${tripadvisorData.rating} ⭐ (${tripadvisorData.num_reviews} reviews)`);
            }

          } catch (error) {
            errorCount++;
            errors.push({
              venue_id: venue.id,
              venue_name: venue.name,
              place_id: venue.place_id,
              tripadvisor_location_id: venue.tripadvisor_location_id,
              error: error.message
            });
            console.error(`❌ Error refreshing ${venue.name}:`, error.message);
          }
        })
      );

      // Small delay between batches to be respectful to Google's API
      if (i + batchSize < venues.length && processedCount < MAX_DAILY_CALLS) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const duration = new Date() - startTime;
    const summary = {
      status: 'completed',
      duration_ms: duration,
      total_venues: venues.length,
      google_processed: googleProcessedCount,
      tripadvisor_processed: tripadvisorProcessedCount,
      total_processed: googleProcessedCount + tripadvisorProcessedCount,
      errors: errorCount,
      skipped: skippedCount,
      daily_call_limit: MAX_DAILY_CALLS,
      error_details: errors.slice(0, 10) // Limit error details to prevent huge responses
    };

    console.log('📊 Refresh summary:', summary);

    // Log monthly call tracking (you might want to store this in a separate table)
    const monthKey = new Date().toISOString().substring(0, 7); // YYYY-MM
    console.log(`📈 Monthly calls for ${monthKey}: +${googleProcessedCount + tripadvisorProcessedCount}`);

    return res.status(200).json(summary);

  } catch (error) {
    console.error('💥 Cron job failed:', error);
    return res.status(500).json({
      status: 'failed',
      error: error.message,
      google_processed: googleProcessedCount,
      tripadvisor_processed: tripadvisorProcessedCount,
      errors: errorCount
    });
  }
}

async function shouldStoreHistoricalRating(venueId, source) {
  try {
    // Get the most recent historical rating for this venue and source
    const { data: lastHistorical } = await supabaseAdmin
      .from('historical_ratings')
      .select('recorded_at')
      .eq('venue_id', venueId)
      .eq('source', source)
      .order('recorded_at', { ascending: false })
      .limit(1);

    // If no historical data exists, don't store (initial should be handled during venue setup)
    if (!lastHistorical || lastHistorical.length === 0) {
      return false;
    }

    // Check if it's been at least 2 days since last historical record
    const lastRecorded = new Date(lastHistorical[0].recorded_at);
    const now = new Date();
    const hoursSinceLastRecord = (now - lastRecorded) / (1000 * 60 * 60);
    
    // Store historical data every 48 hours (2 days)
    return hoursSinceLastRecord >= 48;
  } catch (error) {
    console.error('Error checking historical rating schedule:', error);
    return false; // Fail safe - don't store if we can't determine
  }
}

async function fetchGooglePlaceDetails(placeId) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${GOOGLE_PLACES_FIELDS}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    const result = data.result;
    return {
      rating: result.rating || null,
      user_ratings_total: result.user_ratings_total || 0,
      attributions: data.html_attributions || ['Data © Google']
    };
  } else {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }
}

async function fetchTripAdvisorLocationDetails(locationId) {
  if (!TRIPADVISOR_API_KEY) {
    throw new Error('TRIPADVISOR_API_KEY not configured');
  }

  const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/details?key=${TRIPADVISOR_API_KEY}&language=en&currency=USD`;
  
  const response = await fetch(url, {
    headers: {
      'Referer': 'https://my.getchatters.com'
    }
  });
  
  const data = await response.json();

  if (response.ok && data) {
    return {
      rating: data.rating ? parseFloat(data.rating) : null,
      num_reviews: data.num_reviews || 0,
      location_id: data.location_id
    };
  } else {
    throw new Error(`TripAdvisor API error: ${data.error || 'Unknown error'}`);
  }
}