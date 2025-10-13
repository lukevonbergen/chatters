// /api/google/locations.js
// Gets Google Business Profile locations for a venue
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess } = require('../auth-helper');

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { venueId } = req.query;

    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    // Verify user has access to this venue
    await authenticateVenueAccess(req, venueId);

    // Get Google connection for this venue
    const { data: connection, error: connError } = await supabaseClient
      .from('google_connections')
      .select('id')
      .eq('venue_id', venueId)
      .single();

    if (connError || !connection) {
      return res.status(404).json({
        error: 'No Google connection found for this venue',
        connected: false
      });
    }

    // Get locations for this connection
    const { data: locations, error: locError } = await supabaseClient
      .from('google_locations')
      .select('*')
      .eq('google_connection_id', connection.id)
      .eq('is_active', true)
      .order('location_name');

    if (locError) throw locError;

    return res.status(200).json({
      locations: locations || [],
      count: locations?.length || 0
    });

  } catch (error) {
    console.error('Error fetching Google locations:', error);
    return res.status(500).json({
      error: 'Failed to fetch Google locations',
      message: error.message
    });
  }
}
