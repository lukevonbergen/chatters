// /api/reviews/tripadvisor/update-venue.js
// TripAdvisor Update Venue API endpoint
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess } from '../../auth-helper.js';

// Config constants
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// Create Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🟠 [TripAdvisor] handleTripAdvisorUpdateVenue called');
  console.log('🟠 [TripAdvisor] Request method:', req.method);
  console.log('🟠 [TripAdvisor] Query params:', req.query);
  console.log('🟠 [TripAdvisor] Request body:', req.body);

  const referer = req.headers.origin || req.headers.referer || 'https://my.getchatters.com';
  console.log('🟠 [TripAdvisor] Using referer:', referer);

  if (req.method !== 'PATCH') {
    console.log('❌ [TripAdvisor] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  const { location_id, venue_data, auto_populate } = req.body;

  console.log('🟠 [TripAdvisor] Update params:', {
    venueId,
    location_id,
    auto_populate,
    hasVenueData: !!venue_data
  });

  if (!venueId || !location_id) {
    console.log('❌ [TripAdvisor] Missing required parameters');
    return res.status(400).json({ error: 'venueId and location_id are required' });
  }

  console.log('🔐 [TripAdvisor] Authenticating venue access for venueId:', venueId);
  await authenticateVenueAccess(req, venueId);
  console.log('✅ [TripAdvisor] Venue access authenticated');

  // Check if TripAdvisor integration is already locked
  const { data: existingVenue, error: venueCheckError } = await supabaseAdmin
    .from('venues')
    .select('tripadvisor_integration_locked, tripadvisor_location_id')
    .eq('id', venueId)
    .single();

  if (venueCheckError) {
    return res.status(500).json({ error: 'Failed to check venue status' });
  }

  if (existingVenue.tripadvisor_integration_locked && existingVenue.tripadvisor_location_id) {
    return res.status(403).json({
      error: 'TripAdvisor integration is locked',
      message: 'TripAdvisor venue can only be set once and cannot be changed.'
    });
  }

  // Generate TripAdvisor review link
  const tripAdvisorReviewLink = `https://www.tripadvisor.com/UserReviewEdit-g${location_id}`;

  // Prepare update data
  let updateData = {
    tripadvisor_location_id: location_id,
    tripadvisor_link: tripAdvisorReviewLink,
    tripadvisor_integration_locked: true
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
    .select('id, name, tripadvisor_location_id, tripadvisor_integration_locked')
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }

  // Store initial rating
  console.log('💾 [TripAdvisor] Fetching and storing initial rating data');
  try {
    const tripAdvisorData = await fetchTripAdvisorLocationDetails(location_id, referer);
    console.log('✅ [TripAdvisor] Initial rating data fetched:', {
      rating: tripAdvisorData.rating,
      num_reviews: tripAdvisorData.num_reviews,
      location_id: tripAdvisorData.location_id
    });

    if (tripAdvisorData.rating) {
      console.log('💾 [TripAdvisor] Storing initial rating in venue_tripadvisor_ratings table');
      // Store initial rating in venue_tripadvisor_ratings table
      const result = await supabaseAdmin
        .from('venue_tripadvisor_ratings')
        .insert({
          venue_id: venueId,
          rating: tripAdvisorData.rating,
          ratings_count: tripAdvisorData.num_reviews,
          is_initial: true,
          recorded_at: new Date().toISOString()
        });

      if (result.error) {
        console.error('⚠️ [TripAdvisor] Failed to store initial rating:', result.error);
      } else {
        console.log(`✅ Stored initial TripAdvisor rating for venue ${venueId}: ${tripAdvisorData.rating} ⭐`);
      }
    } else {
      console.log('⚠️ [TripAdvisor] No rating found in initial data, skipping rating storage');
    }
  } catch (ratingError) {
    console.error('💥 [TripAdvisor] Failed to fetch initial rating:', {
      message: ratingError.message,
      stack: ratingError.stack,
      location_id: location_id,
      venueId: venueId
    });
  }

  return res.status(200).json({
    message: 'Venue updated with TripAdvisor data successfully',
    venue: data
  });
}

// Helper function
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
