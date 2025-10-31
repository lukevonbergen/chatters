// /api/reviews/tripadvisor/ratings.js
// TripAdvisor Ratings API endpoint
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess } from '../../auth-helper.js';

// Config constants
const TRIPADVISOR_RATINGS_TTL_HOURS = 24;
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// Create Supabase clients
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  console.log('🟠 [TripAdvisor] handleTripAdvisorRatings called');
  console.log('🟠 [TripAdvisor] Request method:', req.method);
  console.log('🟠 [TripAdvisor] Query params:', req.query);

  const referer = req.headers.origin || req.headers.referer || 'https://my.getchatters.com';
  console.log('🟠 [TripAdvisor] Using referer:', referer);

  if (req.method !== 'GET') {
    console.log('❌ [TripAdvisor] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId, forceRefresh = '0' } = req.query;
  console.log('🟠 [TripAdvisor] venueId:', venueId, 'forceRefresh:', forceRefresh);

  if (!venueId) {
    console.log('❌ [TripAdvisor] Missing venueId parameter');
    return res.status(400).json({ error: 'venueId parameter is required' });
  }

  console.log('🔐 [TripAdvisor] Authenticating venue access for venueId:', venueId);
  await authenticateVenueAccess(req, venueId);
  console.log('✅ [TripAdvisor] Authentication successful');

  console.log('🟠 [TripAdvisor] Fetching venue data from database');
  const { data: venue, error: venueError } = await supabaseClient
    .from('venues')
    .select('id, tripadvisor_location_id, name')
    .eq('id', venueId)
    .single();

  console.log('🟠 [TripAdvisor] Database query result:', { venue, venueError });

  if (venueError || !venue) {
    console.log('❌ [TripAdvisor] Venue not found:', venueError);
    return res.status(404).json({ error: 'Venue not found' });
  }

  console.log('🟠 [TripAdvisor] Venue found:', venue.name, 'TripAdvisor ID:', venue.tripadvisor_location_id);

  if (!venue.tripadvisor_location_id) {
    console.log('❌ [TripAdvisor] No TripAdvisor location ID configured for venue');
    return res.status(404).json({ error: 'Venue has no TripAdvisor location ID configured' });
  }

  // Check cache unless force refresh
  console.log('🟠 [TripAdvisor] Checking cache (forceRefresh:', forceRefresh, ')');
  if (forceRefresh !== '1') {
    const { data: cachedRating } = await supabaseClient
      .from('external_ratings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('source', 'tripadvisor')
      .single();

    console.log('🟠 [TripAdvisor] Cached rating found:', !!cachedRating);
    if (cachedRating) {
      const fetchedAt = new Date(cachedRating.fetched_at);
      const now = new Date();
      const hoursSinceUpdate = (now - fetchedAt) / (1000 * 60 * 60);
      console.log('🟠 [TripAdvisor] Cache age:', hoursSinceUpdate.toFixed(2), 'hours (TTL:', TRIPADVISOR_RATINGS_TTL_HOURS, 'hours)');

      if (hoursSinceUpdate < TRIPADVISOR_RATINGS_TTL_HOURS) {
        console.log('✅ [TripAdvisor] Returning cached rating');
        return res.status(200).json({
          source: 'tripadvisor',
          rating: cachedRating.rating ? parseFloat(cachedRating.rating) : null,
          ratings_count: cachedRating.ratings_count,
          fetched_at: cachedRating.fetched_at,
          cached: true
        });
      } else {
        console.log('⏰ [TripAdvisor] Cache expired, fetching fresh data');
      }
    } else {
      console.log('🟠 [TripAdvisor] No cached rating found');
    }
  } else {
    console.log('🔄 [TripAdvisor] Force refresh requested, skipping cache');
  }

  // Fetch fresh data from TripAdvisor
  console.log('📡 [TripAdvisor] Fetching fresh data from API for location ID:', venue.tripadvisor_location_id);
  try {
    const tripAdvisorData = await fetchTripAdvisorLocationDetails(venue.tripadvisor_location_id, referer);
    console.log('✅ [TripAdvisor] API response received:', {
      rating: tripAdvisorData.rating,
      num_reviews: tripAdvisorData.num_reviews,
      location_id: tripAdvisorData.location_id
    });

    // Cache the result
    console.log('💾 [TripAdvisor] Caching rating data to database');
    const cacheResult = await supabaseAdmin
      .from('external_ratings')
      .upsert({
        venue_id: venueId,
        source: 'tripadvisor',
        rating: tripAdvisorData.rating,
        ratings_count: tripAdvisorData.num_reviews,
        fetched_at: new Date().toISOString()
      }, {
        onConflict: 'venue_id,source'
      });

    if (cacheResult.error) {
      console.error('⚠️ [TripAdvisor] Failed to cache rating:', cacheResult.error);
    } else {
      console.log('✅ [TripAdvisor] Rating cached successfully');
    }

    const responseData = {
      source: 'tripadvisor',
      rating: tripAdvisorData.rating,
      ratings_count: tripAdvisorData.num_reviews,
      fetched_at: new Date().toISOString(),
      cached: false
    };
    console.log('✅ [TripAdvisor] Sending response:', responseData);
    return res.status(200).json(responseData);

  } catch (tripAdvisorError) {
    console.error('💥 [TripAdvisor] API error occurred:', {
      message: tripAdvisorError.message,
      stack: tripAdvisorError.stack,
      venue_id: venueId,
      location_id: venue.tripadvisor_location_id
    });

    // Try to return stale cached data
    console.log('🔄 [TripAdvisor] Attempting to retrieve stale cached data as fallback');
    const { data: staleRating } = await supabaseClient
      .from('external_ratings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('source', 'tripadvisor')
      .single();

    if (staleRating) {
      console.log('✅ [TripAdvisor] Returning stale cached data:', {
        rating: staleRating.rating,
        ratings_count: staleRating.ratings_count,
        fetched_at: staleRating.fetched_at
      });
      return res.status(200).json({
        source: 'tripadvisor',
        rating: staleRating.rating ? parseFloat(staleRating.rating) : null,
        ratings_count: staleRating.ratings_count,
        fetched_at: staleRating.fetched_at,
        cached: true,
        stale: true
      });
    }

    console.log('❌ [TripAdvisor] No fallback data available, returning error');
    const errorReason = getErrorReason(tripAdvisorError);
    console.log('❌ [TripAdvisor] Error reason classified as:', errorReason);
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: errorReason
    });
  }
}

// Helper functions
async function fetchTripAdvisorLocationDetails(locationId, referer = 'https://my.getchatters.com') {
  console.log('🟠 [TripAdvisor] fetchTripAdvisorLocationDetails called for ID:', locationId);
  console.log('🟠 [TripAdvisor] Using referer:', referer);

  if (!TRIPADVISOR_API_KEY) {
    console.log('❌ [TripAdvisor] API key not configured');
    throw new Error('TripAdvisor API key not configured');
  }
  console.log('✅ [TripAdvisor] API key found');

  const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/details?key=${TRIPADVISOR_API_KEY}&language=en&currency=USD`;
  console.log('📡 [TripAdvisor] Making API request to:', url.replace(TRIPADVISOR_API_KEY, '[REDACTED]'));

  const response = await fetch(url, {
    headers: {
      'Referer': referer
    }
  });
  console.log('📡 [TripAdvisor] API response status:', response.status, response.statusText);

  const data = await response.json();
  console.log('📡 [TripAdvisor] Raw API response:', JSON.stringify(data, null, 2));

  if (response.ok && data) {
    console.log('✅ [TripAdvisor] Valid response received');
    const location = data;
    console.log('🟠 [TripAdvisor] Processing location data:', {
      location_id: location.location_id,
      name: location.name,
      hasAddressObj: !!location.address_obj,
      rating: location.rating,
      num_reviews: location.num_reviews
    });

    let structuredAddress = {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postalCode: '',
      country: ''
    };

    if (location.address_obj) {
      console.log('🟠 [TripAdvisor] Processing address object:', location.address_obj);
      structuredAddress = {
        line1: location.address_obj.street1 || '',
        line2: location.address_obj.street2 || '',
        city: location.address_obj.city || '',
        county: location.address_obj.state || '',
        postalCode: location.address_obj.postalcode || '',
        country: location.address_obj.country || ''
      };
    } else {
      console.log('⚠️ [TripAdvisor] No address object found in response');
    }

    const result = {
      location_id: location.location_id,
      name: location.name,
      formatted_address: location.address,
      structured_address: structuredAddress,
      phone: location.phone,
      website: location.website,
      rating: location.rating ? parseFloat(location.rating) : null,
      num_reviews: location.num_reviews || 0
    };

    console.log('✅ [TripAdvisor] Returning processed location data:', {
      location_id: result.location_id,
      name: result.name,
      rating: result.rating,
      num_reviews: result.num_reviews,
      hasStructuredAddress: !!result.structured_address.city
    });

    return result;
  } else {
    console.log('❌ [TripAdvisor] API error response:', {
      status: response.status,
      statusText: response.statusText,
      error: data.error || 'Unknown error',
      data: data
    });
    throw new Error(`TripAdvisor API error: ${data.error || 'Unknown error'}`);
  }
}

function getErrorReason(error) {
  const message = error.message.toLowerCase();

  if (message.includes('quota') || message.includes('rate limit')) {
    return 'quota_exceeded';
  }
  if (message.includes('invalid') || message.includes('not found')) {
    return 'invalid_id';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'network_error';
  }

  return 'unknown_error';
}
