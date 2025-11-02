// /api/reviews/tripadvisor/unlink-venue.js
// Unlink TripAdvisor from a venue
const { createClient } = require('@supabase/supabase-js');
const { requireMasterRole } = require('../../auth-helper');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await requireMasterRole(req);
    const { venueId } = req.body;

    if (!venueId) {
      return res.status(400).json({ error: 'Venue ID is required' });
    }

    // Verify the venue belongs to the user's account
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .select('id, account_id, tripadvisor_location_id, tripadvisor_integration_locked')
      .eq('id', venueId)
      .eq('account_id', userData.account_id)
      .single();

    if (venueError || !venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    if (!venue.tripadvisor_location_id) {
      return res.status(400).json({ error: 'TripAdvisor is not connected to this venue' });
    }

    // Check if integration is locked
    if (venue.tripadvisor_integration_locked) {
      return res.status(403).json({
        error: 'TripAdvisor integration is locked',
        message: 'This integration is locked and cannot be unlinked. Contact support if you need to change this.'
      });
    }

    // Unlink TripAdvisor by clearing the fields
    const { error: updateError } = await supabaseAdmin
      .from('venues')
      .update({
        tripadvisor_location_id: null,
        tripadvisor_link: null,
        tripadvisor_integration_locked: false
      })
      .eq('id', venueId);

    if (updateError) {
      console.error('Error unlinking TripAdvisor:', updateError);
      return res.status(500).json({ error: 'Failed to unlink TripAdvisor' });
    }

    console.log(`TripAdvisor unlinked from venue ${venueId} by ${userData.id}`);

    return res.status(200).json({
      success: true,
      message: 'TripAdvisor successfully unlinked from venue'
    });

  } catch (error) {
    console.error('Unlink TripAdvisor error:', error);
    return res.status(500).json({ error: error.message });
  }
};
