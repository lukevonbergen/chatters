// /api/google-reviews/reply.js
// Reply to a Google review
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess } = require('../auth-helper');

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OAuth2 client helper
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://my.getchatters.com/api/google'
  );
}

// Token refresh helper
async function getRefreshedAuth(googleConnection) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: googleConnection.access_token,
    refresh_token: googleConnection.refresh_token,
    expiry_date: new Date(googleConnection.token_expires_at).getTime()
  });

  const now = Date.now();
  const expiryDate = new Date(googleConnection.token_expires_at).getTime();

  if (now >= expiryDate - 5 * 60 * 1000) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await supabaseAdmin.from('google_connections').update({
      access_token: credentials.access_token,
      token_expires_at: new Date(credentials.expiry_date).toISOString()
    }).eq('id', googleConnection.id);
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reviewId, replyText, venueId } = req.body;

    if (!reviewId || !replyText || !venueId) {
      return res.status(400).json({ error: 'reviewId, replyText, and venueId are required' });
    }

    if (replyText.trim().length === 0) {
      return res.status(400).json({ error: 'Reply text cannot be empty' });
    }

    if (replyText.length > 4096) {
      return res.status(400).json({ error: 'Reply text too long (max 4096 characters)' });
    }

    const userData = await authenticateVenueAccess(req, venueId);

    if (userData.role === 'manager') {
      // Use supabaseAdmin since we've already authenticated the user
      const { data: permissions } = await supabaseAdmin
        .from('venue_permissions')
        .select('can_reply_to_google_reviews')
        .eq('venue_id', venueId)
        .single();

      if (!permissions || !permissions.can_reply_to_google_reviews) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    const { data: review } = await supabaseAdmin
      .from('google_reviews')
      .select('*, google_locations!inner(*, google_connections!inner(*))')
      .eq('id', reviewId)
      .single();

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const connection = review.google_locations.google_connections;
    if (connection.venue_id !== venueId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (review.is_replied) {
      return res.status(400).json({ error: 'Already replied', canUpdate: true });
    }

    const auth = await getRefreshedAuth(connection);
    const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth });

    await mybusiness.accounts.locations.reviews.updateReply({
      name: review.google_review_id,
      requestBody: { comment: replyText.trim() }
    });

    await supabaseAdmin.from('google_reviews').update({
      review_reply: replyText.trim(),
      reply_date: new Date().toISOString(),
      replied_by_user_id: userData.id,
      is_replied: true
    }).eq('id', reviewId);

    return res.status(200).json({ success: true, message: 'Reply posted successfully' });
  } catch (error) {
    console.error('Google Reviews Reply API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
