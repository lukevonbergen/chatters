// /api/reviews/google/update-venue.js
// Google Update Venue API endpoint
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess } from '../../auth-helper.js';

// Config constants
const GOOGLE_PLACES_FIELDS = 'rating,user_ratings_total';
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Create Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  const { place_id, venue_data, auto_populate } = req.body;

  if (!venueId || !place_id) {
    return res.status(400).json({ error: 'venueId and place_id are required' });
  }

  await authenticateVenueAccess(req, venueId);

  // Check if Google integration is already locked
  const { data: existingVenue, error: venueCheckError } = await supabaseAdmin
    .from('venues')
    .select('google_integration_locked, place_id')
    .eq('id', venueId)
    .single();

  if (venueCheckError) {
    return res.status(500).json({ error: 'Failed to check venue status' });
  }

  if (existingVenue.google_integration_locked && existingVenue.place_id) {
    return res.status(403).json({
      error: 'Google integration is locked',
      message: 'Google venue can only be set once and cannot be changed.'
    });
  }

  // Generate Google review link
  const googleReviewLink = `https://search.google.com/local/writereview?placeid=${place_id}`;

  // Prepare update data
  let updateData = {
    place_id,
    google_review_link: googleReviewLink,
    google_integration_locked: true
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
    .select('id, name, place_id, google_integration_locked')
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
    message: 'Google listing connected successfully',
    venue: data
  });
}

// Helper function
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
