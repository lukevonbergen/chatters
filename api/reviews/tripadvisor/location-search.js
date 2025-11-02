// /api/reviews/tripadvisor/location-search.js
// TripAdvisor Location Search API endpoint
import { authenticateAdmin } from '../../auth-helper.js';

// Config constants
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

export default async function handler(req, res) {
  console.log('🟠 [TripAdvisor] handleTripAdvisorLocationSearch called');
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

  const { query } = req.query;
  console.log('🟠 [TripAdvisor] Search query:', query);

  if (!query) {
    console.log('❌ [TripAdvisor] Missing query parameter');
    return res.status(400).json({ error: 'query parameter is required' });
  }

  console.log('🟠 [TripAdvisor] Checking API key configuration');
  if (!TRIPADVISOR_API_KEY) {
    console.log('❌ [TripAdvisor] API key not configured');
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'tripadvisor_api_not_configured'
    });
  }
  console.log('✅ [TripAdvisor] API key found');

  try {
    // Build URL with category filter for restaurants and UK focus
    const url = `https://api.content.tripadvisor.com/api/v1/location/search?key=${TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(query)}&category=restaurants&language=en`;
    console.log('📡 [TripAdvisor] Making API request to:', url.replace(TRIPADVISOR_API_KEY, '[REDACTED]'));

    const response = await fetch(url, {
      headers: {
        'Referer': referer
      }
    });
    console.log('📡 [TripAdvisor] API response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📡 [TripAdvisor] API response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.data) {
      console.log('✅ [TripAdvisor] Search successful, found', data.data.length, 'locations');

      // Filter for UK locations if the search looks like a postcode or UK city
      let filteredData = data.data;
      const isPostcode = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(query.trim());
      const ukKeywords = ['UK', 'United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'];

      if (isPostcode || ukKeywords.some(keyword => query.includes(keyword))) {
        console.log('🇬🇧 [TripAdvisor] UK-focused search detected, prioritizing UK results');
        filteredData = data.data.filter(loc =>
          loc.address_obj?.country === 'United Kingdom' ||
          loc.address_obj?.country === 'England' ||
          loc.address_obj?.country === 'Scotland' ||
          loc.address_obj?.country === 'Wales'
        );

        // If no UK results found, fall back to all results
        if (filteredData.length === 0) {
          console.log('⚠️ [TripAdvisor] No UK results found, showing all results');
          filteredData = data.data;
        }
      }

      const suggestions = filteredData.map((location, index) => {
        console.log(`🟠 [TripAdvisor] Processing location ${index + 1}:`, {
          location_id: location.location_id,
          name: location.name,
          city: location.address_obj?.city,
          rating: location.rating,
          num_reviews: location.num_reviews
        });

        return {
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
        };
      });

      console.log('✅ [TripAdvisor] Returning', suggestions.length, 'processed suggestions');
      return res.status(200).json({ suggestions });
    } else {
      console.log('❌ [TripAdvisor] Search failed or no data returned');
      console.log('❌ [TripAdvisor] Error details:', data.error || 'Unknown error');
      return res.status(503).json({
        status: 'temporary_unavailable',
        reason: 'tripadvisor_api_error',
        details: data.error || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('💥 [TripAdvisor] Search error occurred:', {
      message: error.message,
      stack: error.stack,
      query: query
    });
    return res.status(503).json({
      status: 'temporary_unavailable',
      reason: 'network_error',
      details: error.message
    });
  }
}
