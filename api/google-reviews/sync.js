// /api/google-reviews/sync.js
// Manually triggers a sync of Google reviews for a venue
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess } = require('../auth-helper');
const { getRefreshedAuth } = require('../google/utils/token-refresh');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Fetches and stores reviews for a Google location
 */
async function syncLocationReviews(location, auth) {
  try {
    console.log(`Syncing reviews for location: ${location.location_name}`);

    const mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth
    });

    // Fetch reviews from Google
    const response = await mybusiness.accounts.locations.reviews.list({
      parent: location.location_id
    });

    const reviews = response.data.reviews || [];
    console.log(`Found ${reviews.length} reviews for ${location.location_name}`);

    let newCount = 0;
    let updatedCount = 0;

    for (const review of reviews) {
      // Convert star rating from enum to number
      const starRating = {
        'FIVE': 5,
        'FOUR': 4,
        'THREE': 3,
        'TWO': 2,
        'ONE': 1
      }[review.starRating] || 3;

      const reviewData = {
        location_id: location.id,
        google_review_id: review.name,
        reviewer_name: review.reviewer?.displayName || 'Anonymous',
        reviewer_profile_photo: review.reviewer?.profilePhotoUrl,
        star_rating: starRating,
        review_text: review.comment || null,
        review_date: review.createTime,
        review_reply: review.reviewReply?.comment || null,
        reply_date: review.reviewReply?.updateTime || null,
        is_replied: !!review.reviewReply
      };

      // Check if review already exists
      const { data: existing } = await supabaseAdmin
        .from('google_reviews')
        .select('id, is_replied')
        .eq('google_review_id', review.name)
        .single();

      if (existing) {
        // Update existing review
        const { error } = await supabaseAdmin
          .from('google_reviews')
          .update(reviewData)
          .eq('id', existing.id);

        if (!error) updatedCount++;
      } else {
        // Insert new review
        const { error } = await supabaseAdmin
          .from('google_reviews')
          .insert(reviewData);

        if (!error) newCount++;
      }
    }

    // Update last synced timestamp
    await supabaseAdmin
      .from('google_locations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', location.id);

    return {
      locationName: location.location_name,
      total: reviews.length,
      new: newCount,
      updated: updatedCount
    };

  } catch (error) {
    console.error(`Error syncing reviews for location ${location.location_name}:`, error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { venueId, locationId } = req.body;

    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    // Verify user has access to this venue
    const userData = await authenticateVenueAccess(req, venueId);

    // Get Google connection with credentials
    const { data: connection, error: connError } = await supabaseAdmin
      .from('google_connections')
      .select('*')
      .eq('venue_id', venueId)
      .single();

    if (connError || !connection) {
      return res.status(404).json({
        error: 'No Google connection found for this venue'
      });
    }

    // Get refreshed auth
    const auth = await getRefreshedAuth(connection);

    // Get locations to sync
    let locationsQuery = supabaseAdmin
      .from('google_locations')
      .select('*')
      .eq('google_connection_id', connection.id)
      .eq('is_active', true);

    // If specific location requested, filter to just that one
    if (locationId) {
      locationsQuery = locationsQuery.eq('id', locationId);
    }

    const { data: locations, error: locError } = await locationsQuery;

    if (locError || !locations || locations.length === 0) {
      return res.status(404).json({
        error: 'No active locations found for this venue'
      });
    }

    console.log(`Starting sync for ${locations.length} location(s)`);

    // Sync reviews for each location
    const results = [];
    let totalNew = 0;
    let totalUpdated = 0;
    let totalReviews = 0;

    for (const location of locations) {
      try {
        const result = await syncLocationReviews(location, auth);
        results.push(result);
        totalNew += result.new;
        totalUpdated += result.updated;
        totalReviews += result.total;
      } catch (error) {
        results.push({
          locationName: location.location_name,
          error: error.message
        });
      }
    }

    console.log(`Sync complete: ${totalReviews} reviews (${totalNew} new, ${totalUpdated} updated)`);

    return res.status(200).json({
      success: true,
      summary: {
        locationsProcessed: locations.length,
        totalReviews,
        newReviews: totalNew,
        updatedReviews: totalUpdated
      },
      details: results
    });

  } catch (error) {
    console.error('Error in sync handler:', error);
    return res.status(500).json({
      error: 'Failed to sync reviews',
      message: error.message
    });
  }
}
