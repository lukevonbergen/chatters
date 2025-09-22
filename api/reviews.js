// /api/reviews.js
// Consolidated review platform APIs (Google, TripAdvisor, Unified Search)
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess, authenticateAdmin } from './auth-helper.js';

// Config constants
const GOOGLE_RATINGS_TTL_HOURS = 24;
const TRIPADVISOR_RATINGS_TTL_HOURS = 24;
const GOOGLE_PLACES_FIELDS = 'rating,user_ratings_total';
const GOOGLE_VENUE_DETAILS_FIELDS = 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total';
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
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
  console.log('🔧 Reviews API called:', req.method, req.url);
  console.log('🔧 Query params:', req.query);

  const { platform, action } = req.query;

  try {
    // Route based on platform and action
    if (platform === 'google') {
      return await handleGoogleAction(req, res, action);
    } else if (platform === 'tripadvisor') {
      return await handleTripAdvisorAction(req, res, action);
    } else if (platform === 'unified') {
      return await handleUnifiedAction(req, res, action);
    } else {
      return res.status(400).json({ 
        error: 'Invalid platform parameter', 
        expected: 'google, tripadvisor, or unified',
        received: platform 
      });
    }
  } catch (error) {
    console.error('💥 Reviews API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// =============================================================================
// GOOGLE PLATFORM HANDLERS
// =============================================================================

async function handleGoogleAction(req, res, action) {
  switch (action) {
    case 'ratings':
      return await handleGoogleRatings(req, res);
    case 'places-search':
      return await handleGooglePlacesSearch(req, res);
    case 'place-details':
      return await handleGooglePlaceDetails(req, res);
    case 'update-venue':
      return await handleGoogleUpdateVenue(req, res);
    default:
      return res.status(400).json({ error: 'Invalid Google action', received: action });
  }
}

async function handleGoogleRatings(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId, forceRefresh = '0' } = req.query;
  if (!venueId) {
    return res.status(400).json({ error: 'venueId parameter is required' });
  }

  await authenticateVenueAccess(req, venueId);

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

  // Check cache unless force refresh
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

  // Fetch fresh data from Google
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
    
    // Try to return stale cached data
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

async function handleGooglePlacesSearch(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authenticateAdmin(req);

  const { query, type = 'autocomplete' } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(503).json({ 
      status: 'temporary_unavailable', 
      reason: 'google_api_not_configured' 
    });
  }

  if (type === 'autocomplete') {
    return await handleGoogleAutocomplete(req, res, query, GOOGLE_API_KEY);
  } else if (type === 'findplace') {
    return await handleGoogleFindPlace(req, res, query, GOOGLE_API_KEY);
  } else {
    return res.status(400).json({ error: 'Invalid type. Use "autocomplete" or "findplace"' });
  }
}

async function handleGooglePlaceDetails(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authenticateAdmin(req);

  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ error: 'placeId parameter is required' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(503).json({ 
      status: 'temporary_unavailable', 
      reason: 'google_api_not_configured' 
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${GOOGLE_VENUE_DETAILS_FIELDS}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      const result = data.result;
      
      // Parse address components
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
        structuredAddress.country = 'United Kingdom';
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

async function handleGoogleUpdateVenue(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  const { place_id, venue_data, auto_populate } = req.body;

  if (!venueId || !place_id) {
    return res.status(400).json({ error: 'venueId and place_id are required' });
  }

  await authenticateVenueAccess(req, venueId);

  // Check if venue is already locked
  const { data: existingVenue, error: venueCheckError } = await supabaseAdmin
    .from('venues')
    .select('venue_locked, place_id')
    .eq('id', venueId)
    .single();

  if (venueCheckError) {
    return res.status(500).json({ error: 'Failed to check venue status' });
  }

  if (existingVenue.venue_locked && existingVenue.place_id) {
    return res.status(403).json({ 
      error: 'Venue is locked', 
      message: 'Google venue can only be set once and cannot be changed.' 
    });
  }

  // Generate Google review link
  const googleReviewLink = `https://search.google.com/local/writereview?placeid=${place_id}`;

  // Prepare update data
  let updateData = { 
    place_id, 
    venue_locked: true,
    google_review_link: googleReviewLink
  };

  if (auto_populate && venue_data) {
    updateData = {
      ...updateData,
      name: venue_data.name || updateData.name,
      address: venue_data.structured_address || updateData.address,
      phone: venue_data.phone || updateData.phone,
      website: venue_data.website || updateData.website
    };
  }

  // Update venue
  const { data, error } = await supabaseAdmin
    .from('venues')
    .update(updateData)
    .eq('id', venueId)
    .select('id, name, place_id, venue_locked')
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }

  // Store initial rating
  try {
    const googleData = await fetchGooglePlaceDetails(place_id);
    
    if (googleData.rating) {
      // Historical ratings
      await supabaseAdmin
        .from('historical_ratings')
        .insert({
          venue_id: venueId,
          source: 'google',
          rating: googleData.rating,
          ratings_count: googleData.user_ratings_total,
          is_initial: true,
          recorded_at: new Date().toISOString()
        });

      // Cache
      await supabaseAdmin
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
    }
  } catch (ratingError) {
    console.error('Failed to fetch initial rating:', ratingError);
  }

  return res.status(200).json({
    message: 'Venue updated and locked successfully',
    venue: data,
    locked: true
  });
}

// =============================================================================
// TRIPADVISOR PLATFORM HANDLERS
// =============================================================================

async function handleTripAdvisorAction(req, res, action) {
  switch (action) {
    case 'ratings':
      return await handleTripAdvisorRatings(req, res);
    case 'location-search':
      return await handleTripAdvisorLocationSearch(req, res);
    case 'location-details':
      return await handleTripAdvisorLocationDetails(req, res);
    case 'update-venue':
      return await handleTripAdvisorUpdateVenue(req, res);
    default:
      return res.status(400).json({ error: 'Invalid TripAdvisor action', received: action });
  }
}

async function handleTripAdvisorRatings(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId, forceRefresh = '0' } = req.query;
  if (!venueId) {
    return res.status(400).json({ error: 'venueId parameter is required' });
  }

  await authenticateVenueAccess(req, venueId);

  const { data: venue, error: venueError } = await supabaseClient
    .from('venues')
    .select('id, tripadvisor_location_id, name')
    .eq('id', venueId)
    .single();

  if (venueError || !venue) {
    return res.status(404).json({ error: 'Venue not found' });
  }

  if (!venue.tripadvisor_location_id) {
    return res.status(404).json({ error: 'Venue has no TripAdvisor location ID configured' });
  }

  // Check cache unless force refresh
  if (forceRefresh !== '1') {
    const { data: cachedRating } = await supabaseClient
      .from('external_ratings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('source', 'tripadvisor')
      .single();

    if (cachedRating) {
      const fetchedAt = new Date(cachedRating.fetched_at);
      const now = new Date();
      const hoursSinceUpdate = (now - fetchedAt) / (1000 * 60 * 60);

      if (hoursSinceUpdate < TRIPADVISOR_RATINGS_TTL_HOURS) {
        return res.status(200).json({
          source: 'tripadvisor',
          rating: cachedRating.rating ? parseFloat(cachedRating.rating) : null,
          ratings_count: cachedRating.ratings_count,
          fetched_at: cachedRating.fetched_at,
          cached: true
        });
      }
    }
  }

  // Fetch fresh data from TripAdvisor
  try {
    const tripAdvisorData = await fetchTripAdvisorLocationDetails(venue.tripadvisor_location_id);
    
    // Cache the result
    await supabaseAdmin
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

    return res.status(200).json({
      source: 'tripadvisor',
      rating: tripAdvisorData.rating,
      ratings_count: tripAdvisorData.num_reviews,
      fetched_at: new Date().toISOString(),
      cached: false
    });

  } catch (tripAdvisorError) {
    console.error('TripAdvisor API error:', tripAdvisorError);
    
    // Try to return stale cached data
    const { data: staleRating } = await supabaseClient
      .from('external_ratings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('source', 'tripadvisor')
      .single();

    if (staleRating) {
      return res.status(200).json({
        source: 'tripadvisor',
        rating: staleRating.rating ? parseFloat(staleRating.rating) : null,
        ratings_count: staleRating.ratings_count,
        fetched_at: staleRating.fetched_at,
        cached: true,
        stale: true
      });
    }

    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: getErrorReason(tripAdvisorError)
    });
  }
}

async function handleTripAdvisorLocationSearch(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authenticateAdmin(req);

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  if (!TRIPADVISOR_API_KEY) {
    return res.status(503).json({ 
      status: 'temporary_unavailable', 
      reason: 'tripadvisor_api_not_configured' 
    });
  }

  try {
    const url = `https://api.content.tripadvisor.com/api/v1/location/search?key=${TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(query)}&language=en`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.data) {
      const suggestions = data.data.map(location => ({
        location_id: location.location_id,
        name: location.name,
        address: location.address_obj ? {
          street1: location.address_obj.street1 || '',
          street2: location.address_obj.street2 || '',
          city: location.address_obj.city || '',
          state: location.address_obj.state || '',
          country: location.address_obj.country || '',
          postalcode: location.address_obj.postalcode || ''
        } : null,
        rating: location.rating,
        num_reviews: location.num_reviews,
        description: `${location.name}${location.address_obj ? `, ${location.address_obj.city || ''}` : ''}`
      }));

      return res.status(200).json({ suggestions });
    } else {
      return res.status(503).json({
        status: 'temporary_unavailable',
        reason: 'tripadvisor_api_error',
        details: data.error || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('TripAdvisor search error:', error);
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'network_error',
      details: error.message
    });
  }
}

async function handleTripAdvisorLocationDetails(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authenticateAdmin(req);

  const { locationId } = req.query;
  if (!locationId) {
    return res.status(400).json({ error: 'locationId parameter is required' });
  }

  try {
    const locationData = await fetchTripAdvisorLocationDetails(locationId);
    return res.status(200).json(locationData);
  } catch (error) {
    console.error('Location details error:', error);
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'tripadvisor_api_error',
      details: error.message
    });
  }
}

async function handleTripAdvisorUpdateVenue(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  const { location_id, venue_data, auto_populate } = req.body;

  if (!venueId || !location_id) {
    return res.status(400).json({ error: 'venueId and location_id are required' });
  }

  await authenticateVenueAccess(req, venueId);

  // Generate TripAdvisor review link
  const tripAdvisorReviewLink = `https://www.tripadvisor.com/UserReviewEdit-g${location_id}`;

  // Prepare update data
  let updateData = { 
    tripadvisor_location_id: location_id,
    tripadvisor_link: tripAdvisorReviewLink
  };

  if (auto_populate && venue_data) {
    updateData = {
      ...updateData,
      name: venue_data.name || updateData.name,
      address: venue_data.structured_address || updateData.address,
      phone: venue_data.phone || updateData.phone,
      website: venue_data.website || updateData.website
    };
  }

  // Update venue
  const { data, error } = await supabaseAdmin
    .from('venues')
    .update(updateData)
    .eq('id', venueId)
    .select('id, name, tripadvisor_location_id')
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }

  // Store initial rating
  try {
    const tripAdvisorData = await fetchTripAdvisorLocationDetails(location_id);
    
    if (tripAdvisorData.rating) {
      // Historical ratings
      await supabaseAdmin
        .from('historical_ratings')
        .insert({
          venue_id: venueId,
          source: 'tripadvisor',
          rating: tripAdvisorData.rating,
          ratings_count: tripAdvisorData.num_reviews,
          is_initial: true,
          recorded_at: new Date().toISOString()
        });

      // Cache
      await supabaseAdmin
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
    }
  } catch (ratingError) {
    console.error('Failed to fetch initial rating:', ratingError);
  }

  return res.status(200).json({
    message: 'Venue updated with TripAdvisor data successfully',
    venue: data
  });
}

// =============================================================================
// UNIFIED SEARCH HANDLERS
// =============================================================================

async function handleUnifiedAction(req, res, action) {
  switch (action) {
    case 'search':
      return await handleUnifiedSearch(req, res);
    default:
      return res.status(400).json({ error: 'Invalid unified action', received: action });
  }
}

async function handleUnifiedSearch(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authenticateAdmin(req);

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  try {
    // Search both platforms simultaneously
    const [googleResults, tripAdvisorResults] = await Promise.allSettled([
      searchGoogle(query),
      searchTripAdvisor(query)
    ]);

    const response = {
      query,
      google: {
        status: googleResults.status,
        suggestions: googleResults.status === 'fulfilled' ? googleResults.value : [],
        error: googleResults.status === 'rejected' ? googleResults.reason.message : null
      },
      tripadvisor: {
        status: tripAdvisorResults.status,
        suggestions: tripAdvisorResults.status === 'fulfilled' ? tripAdvisorResults.value : [],
        error: tripAdvisorResults.status === 'rejected' ? tripAdvisorResults.reason.message : null
      }
    };

    // Try to match venues between platforms
    if (response.google.suggestions.length > 0 && response.tripadvisor.suggestions.length > 0) {
      response.matched_venues = findMatchingVenues(response.google.suggestions, response.tripadvisor.suggestions);
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Unified search error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function fetchGooglePlaceDetails(placeId) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${GOOGLE_PLACES_FIELDS}&key=${GOOGLE_API_KEY}`;
  
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
    throw new Error('TripAdvisor API key not configured');
  }

  const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/details?key=${TRIPADVISOR_API_KEY}&language=en&currency=USD`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (response.ok && data) {
    const location = data;
    
    let structuredAddress = {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postalCode: '',
      country: ''
    };

    if (location.address_obj) {
      structuredAddress = {
        line1: location.address_obj.street1 || '',
        line2: location.address_obj.street2 || '',
        city: location.address_obj.city || '',
        county: location.address_obj.state || '',
        postalCode: location.address_obj.postalcode || '',
        country: location.address_obj.country || ''
      };
    }

    return {
      location_id: location.location_id,
      name: location.name,
      formatted_address: location.address,
      structured_address: structuredAddress,
      phone: location.phone,
      website: location.website,
      rating: location.rating ? parseFloat(location.rating) : null,
      num_reviews: location.num_reviews || 0
    };
  } else {
    throw new Error(`TripAdvisor API error: ${data.error || 'Unknown error'}`);
  }
}

async function searchGoogle(query) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.append('input', query);
  url.searchParams.append('types', 'establishment');
  url.searchParams.append('components', 'country:gb');
  url.searchParams.append('key', GOOGLE_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status === 'OK') {
    return data.predictions.map(prediction => ({
      platform: 'google',
      place_id: prediction.place_id,
      name: prediction.structured_formatting?.main_text || prediction.description,
      description: prediction.description,
      address: prediction.structured_formatting?.secondary_text || '',
      structured_formatting: prediction.structured_formatting
    }));
  } else {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }
}

async function searchTripAdvisor(query) {
  if (!TRIPADVISOR_API_KEY) {
    throw new Error('TripAdvisor API key not configured');
  }

  const url = `https://api.content.tripadvisor.com/api/v1/location/search?key=${TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(query)}&language=en`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (response.ok && data.data) {
    return data.data.map(location => ({
      platform: 'tripadvisor',
      location_id: location.location_id,
      name: location.name,
      description: `${location.name}${location.address_obj ? `, ${location.address_obj.city || ''}` : ''}`,
      address: location.address_obj ? `${location.address_obj.city || ''}, ${location.address_obj.country || ''}` : '',
      rating: location.rating,
      num_reviews: location.num_reviews,
      address_obj: location.address_obj
    }));
  } else {
    // Handle specific TripAdvisor error types
    if (data.Message && data.Message.includes('not authorized')) {
      throw new Error('TripAdvisor API key unauthorized - this is likely due to domain restrictions. Remove domain restrictions from your TripAdvisor API key to allow server-side requests.');
    }
    
    throw new Error(`TripAdvisor API error: ${data.error || data.message || data.Message || `HTTP ${response.status} ${response.statusText}`}`);
  }
}

async function handleGoogleAutocomplete(req, res, query, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.append('input', query);
  url.searchParams.append('types', 'establishment');
  url.searchParams.append('components', 'country:gb');
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

async function handleGoogleFindPlace(req, res, query, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.append('input', query);
  url.searchParams.append('inputtype', 'textquery');
  url.searchParams.append('fields', 'place_id,name,formatted_address,rating,user_ratings_total');
  url.searchParams.append('locationbias', 'country:gb');
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

function findMatchingVenues(googleVenues, tripAdvisorVenues) {
  const matches = [];

  for (const googleVenue of googleVenues) {
    for (const tripAdvisorVenue of tripAdvisorVenues) {
      const nameMatch = calculateSimilarity(googleVenue.name, tripAdvisorVenue.name);
      const addressMatch = calculateSimilarity(googleVenue.address, tripAdvisorVenue.address);
      
      if (nameMatch > 0.7 && addressMatch > 0.5) {
        matches.push({
          google: googleVenue,
          tripadvisor: tripAdvisorVenue,
          similarity_score: {
            name: nameMatch,
            address: addressMatch,
            overall: (nameMatch + addressMatch) / 2
          }
        });
        break;
      }
    }
  }

  return matches.sort((a, b) => b.similarity_score.overall - a.similarity_score.overall);
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
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