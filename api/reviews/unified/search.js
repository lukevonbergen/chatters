// /api/reviews/unified/search.js
// Unified Search API endpoint (Google + TripAdvisor)
import { authenticateAdmin } from '../../auth-helper.js';

// Config constants
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authenticateAdmin(req);

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  // Get referer for TripAdvisor API calls
  const referer = req.headers.origin || req.headers.referer || 'https://my.getchatters.com';
  console.log('🔧 [Unified Search] Using referer:', referer);

  try {
    // Search both platforms simultaneously
    const [googleResults, tripAdvisorResults] = await Promise.allSettled([
      searchGoogle(query),
      searchTripAdvisor(query, referer)
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

// Helper functions
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

async function searchTripAdvisor(query, referer = 'https://my.getchatters.com') {
  console.log('🟠 [TripAdvisor] searchTripAdvisor called for query:', query);
  console.log('🟠 [TripAdvisor] Using referer:', referer);

  if (!TRIPADVISOR_API_KEY) {
    console.log('❌ [TripAdvisor] API key not configured for unified search');
    throw new Error('TripAdvisor API key not configured');
  }
  console.log('✅ [TripAdvisor] API key found for unified search');

  const url = `https://api.content.tripadvisor.com/api/v1/location/search?key=${TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(query)}&language=en`;
  console.log('📡 [TripAdvisor] Unified search API request to:', url.replace(TRIPADVISOR_API_KEY, '[REDACTED]'));

  const response = await fetch(url, {
    headers: {
      'Referer': referer
    }
  });
  console.log('📡 [TripAdvisor] Unified search response status:', response.status, response.statusText);

  const data = await response.json();
  console.log('📡 [TripAdvisor] Unified search response data:', JSON.stringify(data, null, 2));

  if (response.ok && data.data) {
    console.log('✅ [TripAdvisor] Unified search successful, processing', data.data.length, 'results');
    const results = data.data.map((location, index) => {
      console.log(`🟠 [TripAdvisor] Processing unified search result ${index + 1}:`, {
        location_id: location.location_id,
        name: location.name,
        city: location.address_obj?.city,
        rating: location.rating,
        num_reviews: location.num_reviews
      });

      return {
        platform: 'tripadvisor',
        location_id: location.location_id,
        name: location.name,
        description: `${location.name}${location.address_obj ? `, ${location.address_obj.city || ''}` : ''}`,
        address: location.address_obj ? `${location.address_obj.city || ''}, ${location.address_obj.country || ''}` : '',
        rating: location.rating,
        num_reviews: location.num_reviews,
        address_obj: location.address_obj
      };
    });

    console.log('✅ [TripAdvisor] Returning', results.length, 'processed unified search results');
    return results;
  } else {
    console.log('❌ [TripAdvisor] Unified search failed');

    // Handle specific TripAdvisor error types
    if (data.Message && data.Message.includes('not authorized')) {
      console.log('❌ [TripAdvisor] Authorization error - likely domain restrictions');
      throw new Error('TripAdvisor API key unauthorized - this is likely due to domain restrictions. Remove domain restrictions from your TripAdvisor API key to allow server-side requests.');
    }

    const errorMsg = `TripAdvisor API error: ${data.error || data.message || data.Message || `HTTP ${response.status} ${response.statusText}`}`;
    console.log('❌ [TripAdvisor] Unified search error:', errorMsg);
    throw new Error(errorMsg);
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
