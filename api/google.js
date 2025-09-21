// /api/google.js
// Consolidated Google APIs endpoint
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess, authenticateAdmin } from './auth-helper.js';

// Config constants
const GOOGLE_RATINGS_TTL_HOURS = 24;
const GOOGLE_PLACES_FIELDS = 'rating,user_ratings_total';
const GOOGLE_VENUE_DETAILS_FIELDS = 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total';

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
  console.log('🔧 Google API called:', req.method, req.url);
  console.log('🔧 Query params:', req.query);
  console.log('🔧 Environment check:', {
    google_api_key: !!process.env.GOOGLE_MAPS_API_KEY,
    supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  const { action } = req.query;

  try {
    switch (action) {
      case 'ratings':
        return await handleRatings(req, res);
      case 'places-search':
        console.log('🔧 Handling places-search');
        return await handlePlacesSearch(req, res);
      case 'place-details':
        console.log('🔧 Handling place-details');
        return await handlePlaceDetails(req, res);
      case 'update-venue':
        return await handleUpdateVenue(req, res);
      default:
        console.log('🔧 Invalid action:', action);
        return res.status(400).json({ error: 'Invalid action parameter', received_action: action });
    }
  } catch (error) {
    console.error('💥 Google API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Handle ratings (GET /api/google?action=ratings&venueId=...&forceRefresh=...)
async function handleRatings(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    
    // Cache the result
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

    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: getErrorReason(googleError)
    });
  }
}

// Handle places search (GET /api/google?action=places-search&query=...&type=...)
async function handlePlacesSearch(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
  await authenticateAdmin(req);

  const { query, type = 'autocomplete' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(503).json({ 
      status: 'temporary_unavailable', 
      reason: 'google_api_not_configured' 
    });
  }

  if (type === 'autocomplete') {
    return await handleAutocomplete(req, res, query, apiKey);
  } else if (type === 'findplace') {
    return await handleFindPlace(req, res, query, apiKey);
  } else {
    return res.status(400).json({ error: 'Invalid type. Use "autocomplete" or "findplace"' });
  }
}

// Handle place details (GET /api/google?action=place-details&placeId=...)
async function handlePlaceDetails(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
  await authenticateAdmin(req);

  const { placeId } = req.query;

  if (!placeId) {
    return res.status(400).json({ error: 'placeId parameter is required' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(503).json({ 
      status: 'temporary_unavailable', 
      reason: 'google_api_not_configured' 
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${GOOGLE_VENUE_DETAILS_FIELDS}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      const result = data.result;
      
      // Parse address components for structured data
      const addressParts = result.formatted_address ? result.formatted_address.split(', ') : [];
      let structuredAddress = {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postalCode: '',
        country: ''
      };

      if (addressParts.length >= 2) {
        structuredAddress.line1 = addressParts[0] || '';
        structuredAddress.city = addressParts[addressParts.length - 3] || '';
        structuredAddress.county = addressParts[addressParts.length - 2] || '';
        structuredAddress.postalCode = addressParts[addressParts.length - 1] || '';
        structuredAddress.country = 'United Kingdom'; // Since we're UK-only
      }

      return res.status(200).json({
        place_id: result.place_id,
        name: result.name,
        formatted_address: result.formatted_address,
        structured_address: structuredAddress,
        phone: result.formatted_phone_number,
        website: result.website,
        rating: result.rating,
        ratings_count: result.user_ratings_total,
        attributions: data.html_attributions || ['Data © Google']
      });
    } else {
      return res.status(503).json({
        status: 'temporary_unavailable',
        reason: 'google_api_error',
        details: data.error_message || data.status
      });
    }
  } catch (error) {
    console.error('Place details error:', error);
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'network_error',
      details: error.message
    });
  }
}

// Handle venue update (PATCH /api/google?action=update-venue&venueId=...)
async function handleUpdateVenue(req, res) {
  console.log('🔧 Update venue called:', { venueId: req.query.venueId, method: req.method });
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  const { place_id, venue_data, auto_populate } = req.body;

  console.log('🔧 Update venue params:', { venueId, place_id, auto_populate, hasVenueData: !!venue_data });

  if (!venueId) {
    return res.status(400).json({ error: 'venueId parameter is required' });
  }

  if (!place_id) {
    return res.status(400).json({ error: 'place_id is required' });
  }

  // Authenticate and check venue access
  console.log('🔧 Authenticating venue access...');
  await authenticateVenueAccess(req, venueId);

  // Check if venue is already locked
  const { data: existingVenue, error: venueCheckError } = await supabaseAdmin
    .from('venues')
    .select('venue_locked, place_id')
    .eq('id', venueId)
    .single();

  if (venueCheckError) {
    console.error('💥 Error checking venue:', venueCheckError);
    return res.status(500).json({ error: 'Failed to check venue status' });
  }

  if (existingVenue.venue_locked && existingVenue.place_id) {
    return res.status(403).json({ 
      error: 'Venue is locked', 
      message: 'Google venue can only be set once and cannot be changed.' 
    });
  }

  // Validate place_id format
  if (typeof place_id !== 'string' || place_id.length < 10) {
    return res.status(400).json({ error: 'Invalid place_id format' });
  }

  // Optional: Validate place_id exists
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      await validatePlaceId(place_id);
    } catch (validationError) {
      return res.status(400).json({ 
        error: 'Invalid place_id', 
        details: validationError.message 
      });
    }
  }

  // Prepare venue update data
  let updateData = { 
    place_id, 
    venue_locked: true // Lock venue after setting Google place
  };

  // If auto-populate is enabled and venue_data is provided, update basic info
  if (auto_populate && venue_data) {
    console.log('🔧 Auto-populating venue data...');
    updateData = {
      ...updateData,
      name: venue_data.name || updateData.name,
      address: venue_data.structured_address || updateData.address,
      phone: venue_data.phone || updateData.phone,
      website: venue_data.website || updateData.website
    };
  }

  // Update the venue (use admin client for write operations)
  console.log('🔧 Updating venue in database...');
  const { data, error } = await supabaseAdmin
    .from('venues')
    .update(updateData)
    .eq('id', venueId)
    .select('id, name, place_id, venue_locked')
    .single();

  if (error) {
    console.error('💥 Database error:', error);
    return res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }

  // Get current Google rating to store as initial baseline
  try {
    console.log('🔧 Fetching initial Google rating...');
    const googleData = await fetchGooglePlaceDetails(place_id);
    
    if (googleData.rating) {
      // Store initial rating in historical_ratings table
      const { error: historyError } = await supabaseAdmin
        .from('historical_ratings')
        .insert({
          venue_id: venueId,
          source: 'google',
          rating: googleData.rating,
          ratings_count: googleData.user_ratings_total,
          is_initial: true, // Mark as baseline rating
          recorded_at: new Date().toISOString()
        });

      if (historyError) {
        console.error('💥 Failed to store initial rating:', historyError);
        // Don't fail the whole operation for this
      } else {
        console.log('✅ Stored initial rating:', googleData.rating);
      }

      // Also store in external_ratings cache
      const { error: cacheError } = await supabaseAdmin
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

      if (cacheError) {
        console.error('💥 Failed to cache rating:', cacheError);
      }
    }
  } catch (ratingError) {
    console.error('💥 Failed to fetch initial rating:', ratingError);
    // Don't fail the venue update for this
  }

  console.log('✅ Venue updated and locked successfully:', data);
  return res.status(200).json({
    message: 'Venue updated and locked successfully',
    venue: data,
    locked: true
  });
}

// Helper functions
async function handleAutocomplete(req, res, query, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.append('input', query);
  url.searchParams.append('types', 'establishment');
  url.searchParams.append('components', 'country:gb'); // Restrict to UK only
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status === 'OK') {
    const suggestions = data.predictions.map(prediction => ({
      place_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: prediction.structured_formatting
    }));

    return res.status(200).json({
      suggestions,
      attributions: data.html_attributions || []
    });
  } else {
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'google_api_error',
      details: data.error_message || data.status
    });
  }
}

async function handleFindPlace(req, res, query, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.append('input', query);
  url.searchParams.append('inputtype', 'textquery');
  url.searchParams.append('fields', 'place_id,name,formatted_address,rating,user_ratings_total');
  url.searchParams.append('locationbias', 'country:gb'); // Bias results to UK
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status === 'OK') {
    const places = data.candidates.map(candidate => ({
      place_id: candidate.place_id,
      name: candidate.name,
      formatted_address: candidate.formatted_address,
      rating: candidate.rating,
      user_ratings_total: candidate.user_ratings_total
    }));

    return res.status(200).json({
      places,
      attributions: data.html_attributions || []
    });
  } else {
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'google_api_error',
      details: data.error_message || data.status
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

async function validatePlaceId(placeId) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Invalid Place ID: ${data.status} - ${data.error_message || 'Place not found'}`);
  }

  return data.result;
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