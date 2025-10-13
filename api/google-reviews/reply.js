// /api/google-reviews/reply.js
// Posts a reply to a Google review
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess } = require('../auth-helper');
const { getRefreshedAuth } = require('../google/utils/token-refresh');

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reviewId, replyText, venueId } = req.body;

    // Validation
    if (!reviewId || !replyText || !venueId) {
      return res.status(400).json({
        error: 'reviewId, replyText, and venueId are required'
      });
    }

    if (replyText.trim().length === 0) {
      return res.status(400).json({ error: 'Reply text cannot be empty' });
    }

    if (replyText.length > 4096) {
      return res.status(400).json({
        error: 'Reply text too long (max 4096 characters)'
      });
    }

    // Verify user has access to this venue
    const userData = await authenticateVenueAccess(req, venueId);

    // Check permissions for managers
    if (userData.role === 'manager') {
      const { data: permissions } = await supabaseClient
        .from('venue_permissions')
        .select('can_reply_to_google_reviews')
        .eq('venue_id', venueId)
        .single();

      if (!permissions || !permissions.can_reply_to_google_reviews) {
        return res.status(403).json({
          error: 'You do not have permission to reply to Google reviews for this venue'
        });
      }
    }

    // Get the review with location and connection info
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('google_reviews')
      .select(`
        *,
        google_locations!inner (
          *,
          google_connections!inner (*)
        )
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Verify the review belongs to the venue
    const connection = review.google_locations.google_connections;
    if (connection.venue_id !== venueId) {
      return res.status(403).json({ error: 'Access denied to this review' });
    }

    // Check if already replied
    if (review.is_replied) {
      return res.status(400).json({
        error: 'This review has already been replied to',
        canUpdate: true // Google allows updating replies
      });
    }

    // Get refreshed auth token
    const auth = await getRefreshedAuth(connection);

    // Post reply to Google
    console.log(`Posting reply to review ${review.google_review_id}`);

    const mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth
    });

    try {
      await mybusiness.accounts.locations.reviews.updateReply({
        name: review.google_review_id,
        requestBody: {
          comment: replyText.trim()
        }
      });

      console.log('Reply posted successfully to Google');

    } catch (googleError) {
      console.error('Google API error:', googleError);
      throw new Error(`Failed to post reply to Google: ${googleError.message}`);
    }

    // Update local database
    const { error: updateError } = await supabaseAdmin
      .from('google_reviews')
      .update({
        review_reply: replyText.trim(),
        reply_date: new Date().toISOString(),
        replied_by_user_id: userData.id,
        is_replied: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Failed to update review in database:', updateError);
      // Don't fail the request - reply was posted to Google successfully
    }

    return res.status(200).json({
      success: true,
      message: 'Reply posted successfully'
    });

  } catch (error) {
    console.error('Error replying to review:', error);
    return res.status(500).json({
      error: 'Failed to post reply',
      message: error.message
    });
  }
}
