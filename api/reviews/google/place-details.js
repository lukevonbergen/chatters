// /api/reviews/google/place-details.js
// Google Place Details API endpoint
import { authenticateAdmin } from '../../auth-helper.js';

// Config constants
const GOOGLE_VENUE_DETAILS_FIELDS = 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total';
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default async function handler(req, res) {
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
