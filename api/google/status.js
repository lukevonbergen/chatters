// /api/google/status.js
// Checks if a venue has Google connected
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
    const userData = await authenticateVenueAccess(req, venueId);

    // Get Google connection status
    const { data: connection, error } = await supabaseClient
      .from('google_connections')
      .select('id, google_account_email, created_at')
      .eq('venue_id', venueId)
      .single();

    // PGRST116 = no rows returned (not an error, just not connected)
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Get location count if connected
    let locationCount = 0;
    if (connection) {
      const { count } = await supabaseClient
        .from('google_locations')
        .select('*', { count: 'exact', head: true })
        .eq('google_connection_id', connection.id)
        .eq('is_active', true);

      locationCount = count || 0;
    }

    return res.status(200).json({
      connected: !!connection,
      connection: connection ? {
        id: connection.id,
        email: connection.google_account_email,
        connectedAt: connection.created_at,
        locationCount
      } : null
    });

  } catch (error) {
    console.error('Error checking Google status:', error);
    return res.status(500).json({
      error: 'Failed to check Google connection status',
      message: error.message
    });
  }
}
