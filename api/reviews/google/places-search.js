// /api/reviews/google/places-search.js
// Google Places Search API endpoint
import { authenticateAdmin } from '../../auth-helper.js';

// Config constants
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default async function handler(req, res) {
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

// Helper functions
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
