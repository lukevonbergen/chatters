// /api/tripadvisor.js
// TripAdvisor Content API integration
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess, authenticateAdmin } from './auth-helper.js';

// Config constants
const TRIPADVISOR_RATINGS_TTL_HOURS = 24;
const TRIPADVISOR_API_KEY = 'B1376936160341EAB64621CD8AA5A719';

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
  console.log('🔧 TripAdvisor API called:', req.method, req.url);
  console.log('🔧 Query params:', req.query);

  const { action } = req.query;

  try {
    switch (action) {
      case 'ratings':
        return await handleRatings(req, res);
      case 'location-search':
        console.log('🔧 Handling location-search');
        return await handleLocationSearch(req, res);
      case 'location-details':
        console.log('🔧 Handling location-details');
        return await handleLocationDetails(req, res);
      case 'update-venue':
        return await handleUpdateVenue(req, res);
      default:
        console.log('🔧 Invalid action:', action);
        return res.status(400).json({ error: 'Invalid action parameter', received_action: action });
    }
  } catch (error) {
    console.error('💥 TripAdvisor API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Handle ratings (GET /api/tripadvisor?action=ratings&venueId=...&forceRefresh=...)
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

  // Get venue with tripadvisor_location_id
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

  // Check cache unless force refresh is requested
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

  // Fetch fresh data from TripAdvisor API
  try {
    const tripAdvisorData = await fetchTripAdvisorLocationDetails(venue.tripadvisor_location_id);
    
    // Cache the result
    const { error: upsertError } = await supabaseAdmin
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

    if (upsertError) {
      console.error('Failed to cache TripAdvisor rating:', upsertError);
    }

    return res.status(200).json({
      source: 'tripadvisor',
      rating: tripAdvisorData.rating,
      ratings_count: tripAdvisorData.num_reviews,
      fetched_at: new Date().toISOString(),
      cached: false
    });

  } catch (tripAdvisorError) {
    console.error('TripAdvisor API error:', tripAdvisorError);
    
    // Try to return stale cached data if available
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

// Handle location search (GET /api/tripadvisor?action=location-search&query=...)
async function handleLocationSearch(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
  await authenticateAdmin(req);

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
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

      return res.status(200).json({
        suggestions
      });
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

// Handle location details (GET /api/tripadvisor?action=location-details&locationId=...)
async function handleLocationDetails(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
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

// Handle venue update (PATCH /api/tripadvisor?action=update-venue&venueId=...)
async function handleUpdateVenue(req, res) {
  console.log('🔧 Update venue called:', { venueId: req.query.venueId, method: req.method });
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  const { location_id, venue_data, auto_populate } = req.body;

  console.log('🔧 Update venue params:', { venueId, location_id, auto_populate, hasVenueData: !!venue_data });

  if (!venueId) {
    return res.status(400).json({ error: 'venueId parameter is required' });
  }

  if (!location_id) {
    return res.status(400).json({ error: 'location_id is required' });
  }

  // Authenticate and check venue access
  console.log('🔧 Authenticating venue access...');
  await authenticateVenueAccess(req, venueId);

  // Generate TripAdvisor review link from location_id
  const tripAdvisorReviewLink = `https://www.tripadvisor.com/UserReviewEdit-g${location_id}`;

  // Prepare venue update data
  let updateData = { 
    tripadvisor_location_id: location_id,
    tripadvisor_link: tripAdvisorReviewLink // Always set the TripAdvisor review link
  };

  // If auto-populate is enabled and venue_data is provided, update basic info
  if (auto_populate && venue_data) {
    console.log('🔧 Auto-populating venue data from TripAdvisor...');
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
    .select('id, name, tripadvisor_location_id')
    .single();

  if (error) {
    console.error('💥 Database error:', error);
    return res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }

  // Get current TripAdvisor rating to store as initial baseline
  try {
    console.log('🔧 Fetching initial TripAdvisor rating...');
    const tripAdvisorData = await fetchTripAdvisorLocationDetails(location_id);
    
    if (tripAdvisorData.rating) {
      // Store initial rating in historical_ratings table
      const { error: historyError } = await supabaseAdmin
        .from('historical_ratings')
        .insert({
          venue_id: venueId,
          source: 'tripadvisor',
          rating: tripAdvisorData.rating,
          ratings_count: tripAdvisorData.num_reviews,
          is_initial: true, // Mark as baseline rating
          recorded_at: new Date().toISOString()
        });

      if (historyError) {
        console.error('💥 Failed to store initial rating:', historyError);
        // Don't fail the whole operation for this
      } else {
        console.log('✅ Stored initial TripAdvisor rating:', tripAdvisorData.rating);
      }

      // Also store in external_ratings cache
      const { error: cacheError } = await supabaseAdmin
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

      if (cacheError) {
        console.error('💥 Failed to cache rating:', cacheError);
      }
    }
  } catch (ratingError) {
    console.error('💥 Failed to fetch initial rating:', ratingError);
    // Don't fail the venue update for this
  }

  console.log('✅ Venue updated with TripAdvisor data successfully:', data);
  return res.status(200).json({
    message: 'Venue updated with TripAdvisor data successfully',
    venue: data
  });
}

// Helper functions
async function fetchTripAdvisorLocationDetails(locationId) {
  const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/details?key=${TRIPADVISOR_API_KEY}&language=en&currency=USD`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (response.ok && data) {
    const location = data;
    
    // Parse address components for structured data
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

function getErrorReason(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('quota') || message.includes('rate limit')) {
    return 'quota_exceeded';
  }
  if (message.includes('invalid') || message.includes('not found')) {
    return 'invalid_location_id';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'network_error';
  }
  
  return 'unknown_error';
}