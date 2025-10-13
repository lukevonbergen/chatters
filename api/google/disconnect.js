// /api/google/disconnect.js
// Disconnects Google account for a venue
const { createClient } = require('@supabase/supabase-js');
const { requireMasterRole } = require('../auth-helper');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user is a master user
    const userData = await requireMasterRole(req);

    // Get venueId from request body
    const { venueId } = req.body;

    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    // Verify venue belongs to user's account
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .select('account_id')
      .eq('id', venueId)
      .single();

    if (venueError || !venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    if (venue.account_id !== userData.account_id) {
      return res.status(403).json({ error: 'Access denied. Venue not in your account.' });
    }

    // Delete the Google connection (cascade will delete locations and reviews)
    const { error: deleteError } = await supabaseAdmin
      .from('google_connections')
      .delete()
      .eq('venue_id', venueId);

    if (deleteError) {
      console.error('Error disconnecting Google:', deleteError);
      throw deleteError;
    }

    console.log(`Google connection disconnected for venue ${venueId}`);

    return res.status(200).json({
      success: true,
      message: 'Google account disconnected successfully'
    });

  } catch (error) {
    console.error('Error in disconnect handler:', error);
    return res.status(500).json({
      error: 'Failed to disconnect Google account',
      message: error.message
    });
  }
}
