// /api/ratings/google.js
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess } from '../auth-helper.js';

// Config constants
const GOOGLE_RATINGS_TTL_HOURS = 24;
const GOOGLE_PLACES_FIELDS = 'rating,user_ratings_total'; // Minimal fields to control cost
// Future fields (commented for cost control): name,editorial_summary,adr_address,icon_mask_base_uri,icon_background_color

// Create Supabase client with service role for database writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This needs to be added to your environment
);

// Regular client for user auth
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { venueId, forceRefresh = '0' } = req.query;

    if (!venueId) {
      return res.status(400).json({ error: 'venueId parameter is required' });
    }

    // Authenticate and check venue access
    await authenticateVenueAccess(req, venueId);

    // Get venue with place_id
    const { data: venue, error: venueError } = await supabaseClient
      .from('venues')
      .select('id, place_id, name')
      .eq('id', venueId)
      .single();

    if (venueError || !venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    if (!venue.place_id) {
      return res.status(404).json({ error: 'Venue has no Google Place ID configured' });
    }

    // Check cache unless force refresh is requested
    if (forceRefresh !== '1') {
      const { data: cachedRating } = await supabaseClient
        .from('external_ratings')
        .select('*')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .single();

      if (cachedRating) {
        const fetchedAt = new Date(cachedRating.fetched_at);
        const now = new Date();
        const hoursSinceUpdate = (now - fetchedAt) / (1000 * 60 * 60);

        if (hoursSinceUpdate < GOOGLE_RATINGS_TTL_HOURS) {
          // Return cached data
          return res.status(200).json({
            source: 'google',
            rating: cachedRating.rating ? parseFloat(cachedRating.rating) : null,
            ratings_count: cachedRating.ratings_count,
            attributions: cachedRating.attributions || [],
            fetched_at: cachedRating.fetched_at,
            cached: true
          });
        }
      }
    }

    // Fetch fresh data from Google Places API
    try {
      const googleData = await fetchGooglePlaceDetails(venue.place_id);
      
      // Cache the result using service role client
      const { error: upsertError } = await supabaseAdmin
        .from('external_ratings')
        .upsert({
          venue_id: venueId,
          source: 'google',
          rating: googleData.rating,
          ratings_count: googleData.user_ratings_total,
          attributions: googleData.attributions || ['Data © Google'],
          fetched_at: new Date().toISOString()
        }, {
          onConflict: 'venue_id,source'
        });

      if (upsertError) {
        console.error('Failed to cache Google rating:', upsertError);
        // Continue anyway - we can still return the fresh data
      }

      return res.status(200).json({
        source: 'google',
        rating: googleData.rating,
        ratings_count: googleData.user_ratings_total,
        attributions: googleData.attributions || ['Data © Google'],
        fetched_at: new Date().toISOString(),
        cached: false
      });

    } catch (googleError) {
      console.error('Google Places API error:', googleError);
      
      // Try to return stale cached data if available
      const { data: staleRating } = await supabaseClient
        .from('external_ratings')
        .select('*')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .single();

      if (staleRating) {
        return res.status(200).json({
          source: 'google',
          rating: staleRating.rating ? parseFloat(staleRating.rating) : null,
          ratings_count: staleRating.ratings_count,
          attributions: staleRating.attributions || [],
          fetched_at: staleRating.fetched_at,
          cached: true,
          stale: true
        });
      }

      // No cache available, return error
      return res.status(503).json({
        status: 'temporary_unavailable',
        reason: getErrorReason(googleError)
      });
    }

  } catch (error) {
    console.error('API error:', error);
    if (error.message.includes('Access denied') || error.message.includes('not assigned')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
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

function getErrorReason(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('quota') || message.includes('rate limit')) {
    return 'quota_exceeded';
  }
  if (message.includes('invalid') || message.includes('not found')) {
    return 'invalid_place_id';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'network_error';
  }
  
  return 'unknown_error';
}