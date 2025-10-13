// /api/google-reviews/list.js
// Lists Google reviews for a venue
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess, authenticateAdmin } = require('../auth-helper');

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { venueId, filter = 'all', locationId } = req.query;

    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    // Verify user has access to this venue
    const userData = await authenticateVenueAccess(req, venueId);

    // Check if manager has permission to view reviews
    if (userData.role === 'manager') {
      const { data: permissions } = await supabaseClient
        .from('venue_permissions')
        .select('can_view_google_reviews')
        .eq('venue_id', venueId)
        .single();

      if (!permissions || !permissions.can_view_google_reviews) {
        return res.status(403).json({
          error: 'You do not have permission to view Google reviews for this venue'
        });
      }
    }

    // Get Google connection for this venue
    const { data: connection, error: connError } = await supabaseClient
      .from('google_connections')
      .select('id')
      .eq('venue_id', venueId)
      .single();

    if (connError || !connection) {
      return res.status(404).json({
        error: 'No Google connection found for this venue',
        connected: false,
        reviews: []
      });
    }

    // Build query for reviews
    let query = supabaseAdmin
      .from('google_reviews')
      .select(`
        *,
        google_locations!inner (
          id,
          location_name,
          address,
          google_connection_id
        )
      `)
      .eq('google_locations.google_connection_id', connection.id)
      .order('review_date', { ascending: false });

    // Filter by specific location if provided
    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    // Filter by reply status
    if (filter === 'unresponded') {
      query = query.eq('is_replied', false);
    } else if (filter === 'responded') {
      query = query.eq('is_replied', true);
    }

    const { data: reviews, error: reviewsError } = await query;

    if (reviewsError) throw reviewsError;

    // Calculate stats
    const stats = {
      total: reviews.length,
      unresponded: reviews.filter(r => !r.is_replied).length,
      responded: reviews.filter(r => r.is_replied).length,
      avgRating: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length).toFixed(1)
        : 0,
      ratingBreakdown: {
        5: reviews.filter(r => r.star_rating === 5).length,
        4: reviews.filter(r => r.star_rating === 4).length,
        3: reviews.filter(r => r.star_rating === 3).length,
        2: reviews.filter(r => r.star_rating === 2).length,
        1: reviews.filter(r => r.star_rating === 1).length
      }
    };

    return res.status(200).json({
      reviews: reviews || [],
      stats
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return res.status(500).json({
      error: 'Failed to fetch Google reviews',
      message: error.message
    });
  }
}
