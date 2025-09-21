// /api/venues/[id].js
import { createClient } from '@supabase/supabase-js';
import { authenticateVenueAccess } from '../auth-helper.js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { id: venueId } = req.query;

  if (!venueId) {
    return res.status(400).json({ error: 'Venue ID is required' });
  }

  try {
    // Authenticate and check venue access
    await authenticateVenueAccess(req, venueId);

    if (req.method === 'PATCH') {
      return await handlePatch(req, res, venueId);
    }

    if (req.method === 'GET') {
      return await handleGet(req, res, venueId);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API error:', error);
    if (error.message.includes('Access denied') || error.message.includes('not assigned')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePatch(req, res, venueId) {
  const { place_id } = req.body;

  if (!place_id) {
    return res.status(400).json({ error: 'place_id is required' });
  }

  // Validate place_id format (Google Place IDs typically start with ChIJ)
  if (typeof place_id !== 'string' || place_id.length < 10) {
    return res.status(400).json({ error: 'Invalid place_id format' });
  }

  // Optional: Validate place_id exists by calling Google Places API
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      await validatePlaceId(place_id);
    } catch (validationError) {
      return res.status(400).json({ 
        error: 'Invalid place_id', 
        details: validationError.message 
      });
    }
  }

  // Update the venue
  const { data, error } = await supabaseClient
    .from('venues')
    .update({ place_id })
    .eq('id', venueId)
    .select('id, name, place_id')
    .single();

  if (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to update venue' });
  }

  return res.status(200).json({
    message: 'Venue updated successfully',
    venue: data
  });
}

async function handleGet(req, res, venueId) {
  const { data: venue, error } = await supabaseClient
    .from('venues')
    .select('id, name, place_id')
    .eq('id', venueId)
    .single();

  if (error || !venue) {
    return res.status(404).json({ error: 'Venue not found' });
  }

  return res.status(200).json({ venue });
}

async function validatePlaceId(placeId) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Invalid Place ID: ${data.status} - ${data.error_message || 'Place not found'}`);
  }

  return data.result;
}