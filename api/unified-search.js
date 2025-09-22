// /api/unified-search.js
// Unified search across Google Places and TripAdvisor
import { authenticateAdmin } from './auth-helper.js';

// Config constants
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const TRIPADVISOR_API_KEY = 'B1376936160341EAB64621CD8AA5A719';

export default async function handler(req, res) {
  console.log('🔧 Unified search API called:', req.method, req.url);
  console.log('🔧 Query params:', req.query);

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
    // Search both platforms simultaneously
    const [googleResults, tripAdvisorResults] = await Promise.allSettled([
      searchGoogle(query),
      searchTripAdvisor(query)
    ]);

    console.log('🔧 Google search results:', googleResults.status);
    console.log('🔧 TripAdvisor search results:', tripAdvisorResults.status);

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

    // Try to match venues between platforms based on name and location
    if (response.google.suggestions.length > 0 && response.tripadvisor.suggestions.length > 0) {
      response.matched_venues = findMatchingVenues(response.google.suggestions, response.tripadvisor.suggestions);
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('💥 Unified search error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function searchGoogle(query) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.append('input', query);
  url.searchParams.append('types', 'establishment');
  url.searchParams.append('components', 'country:gb'); // Restrict to UK only
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
    throw new Error(`TripAdvisor API error: ${data.error || 'Unknown error'}`);
  }
}

function findMatchingVenues(googleVenues, tripAdvisorVenues) {
  const matches = [];

  for (const googleVenue of googleVenues) {
    for (const tripAdvisorVenue of tripAdvisorVenues) {
      const nameMatch = calculateSimilarity(googleVenue.name, tripAdvisorVenue.name);
      const addressMatch = calculateSimilarity(googleVenue.address, tripAdvisorVenue.address);
      
      // Consider it a match if name similarity > 0.7 and address similarity > 0.5
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
        break; // Don't match the same Google venue to multiple TripAdvisor venues
      }
    }
  }

  // Sort by overall similarity score (highest first)
  return matches.sort((a, b) => b.similarity_score.overall - a.similarity_score.overall);
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Simple Jaccard similarity using word sets
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}