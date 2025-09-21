// /api/cron/refresh-google-ratings.js
// Nightly cron job to refresh Google ratings for all venues with place_id
import { createClient } from '@supabase/supabase-js';

// Config constants
const GOOGLE_PLACES_FIELDS = 'rating,user_ratings_total';
const MAX_DAILY_CALLS = 1000; // Hard cap to control costs
const ACTIVE_VENUE_DAYS = 30; // Only refresh venues with feedback in last 30 days (optional optimization)

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
  let processedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const errors = [];

  try {
    console.log('🔄 Starting nightly Google ratings refresh...');

    // Get all venues with place_id
    let venuesQuery = supabaseAdmin
      .from('venues')
      .select('id, place_id, name')
      .not('place_id', 'is', null);

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
    for (let i = 0; i < venues.length && processedCount < MAX_DAILY_CALLS; i += batchSize) {
      const batch = venues.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (venue) => {
          if (processedCount >= MAX_DAILY_CALLS) {
            skippedCount++;
            return;
          }

          try {
            console.log(`🔍 Refreshing ${venue.name} (${venue.place_id})`);
            
            const googleData = await fetchGooglePlaceDetails(venue.place_id);
            processedCount++;

            // Upsert the rating data
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
              throw new Error(`Database upsert failed: ${upsertError.message}`);
            }

            console.log(`✅ Updated ${venue.name}: ${googleData.rating} ⭐ (${googleData.user_ratings_total} reviews)`);

          } catch (error) {
            errorCount++;
            errors.push({
              venue_id: venue.id,
              venue_name: venue.name,
              place_id: venue.place_id,
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
      processed: processedCount,
      errors: errorCount,
      skipped: skippedCount,
      daily_call_limit: MAX_DAILY_CALLS,
      error_details: errors.slice(0, 10) // Limit error details to prevent huge responses
    };

    console.log('📊 Refresh summary:', summary);

    // Log monthly call tracking (you might want to store this in a separate table)
    const monthKey = new Date().toISOString().substring(0, 7); // YYYY-MM
    console.log(`📈 Monthly calls for ${monthKey}: +${processedCount}`);

    return res.status(200).json(summary);

  } catch (error) {
    console.error('💥 Cron job failed:', error);
    return res.status(500).json({
      status: 'failed',
      error: error.message,
      processed: processedCount,
      errors: errorCount
    });
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