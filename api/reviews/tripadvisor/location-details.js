// /api/reviews/tripadvisor/location-details.js
// TripAdvisor Location Details API endpoint
import { authenticateAdmin } from '../../auth-helper.js';

// Config constants
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

export default async function handler(req, res) {
  console.log('🟠 [TripAdvisor] handleTripAdvisorLocationDetails called');
  console.log('🟠 [TripAdvisor] Request method:', req.method);
  console.log('🟠 [TripAdvisor] Query params:', req.query);

  const referer = req.headers.origin || req.headers.referer || 'https://my.getchatters.com';
  console.log('🟠 [TripAdvisor] Using referer:', referer);

  if (req.method !== 'GET') {
    console.log('❌ [TripAdvisor] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔐 [TripAdvisor] Authenticating admin access');
  await authenticateAdmin(req);
  console.log('✅ [TripAdvisor] Admin authentication successful');

  const { locationId } = req.query;
  console.log('🟠 [TripAdvisor] Location ID:', locationId);

  if (!locationId) {
    console.log('❌ [TripAdvisor] Missing locationId parameter');
    return res.status(400).json({ error: 'locationId parameter is required' });
  }

  try {
    console.log('📡 [TripAdvisor] Fetching location details for ID:', locationId);
    const locationData = await fetchTripAdvisorLocationDetails(locationId, referer);
    console.log('✅ [TripAdvisor] Location details retrieved:', {
      location_id: locationData.location_id,
      name: locationData.name,
      rating: locationData.rating,
      num_reviews: locationData.num_reviews,
      hasAddress: !!locationData.structured_address
    });
    return res.status(200).json(locationData);
  } catch (error) {
    console.error('💥 [TripAdvisor] Location details error:', {
      message: error.message,
      stack: error.stack,
      locationId: locationId
    });
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'tripadvisor_api_error',
      details: error.message
    });
  }
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
