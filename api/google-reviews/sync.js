// /api/google-reviews/sync.js
// Sync reviews from Google My Business
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

// Sync reviews for a location
async function syncLocationReviews(location, auth) {
  const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth });
  const response = await mybusiness.accounts.locations.reviews.list({ parent: location.location_id });
  const reviews = response.data.reviews || [];

  let newCount = 0;
  let updatedCount = 0;

  for (const review of reviews) {
    const starRating = { 'FIVE': 5, 'FOUR': 4, 'THREE': 3, 'TWO': 2, 'ONE': 1 }[review.starRating] || 3;
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

    const { data: existing } = await supabaseAdmin
      .from('google_reviews')
      .select('id')
      .eq('google_review_id', review.name)
      .single();

    if (existing) {
      await supabaseAdmin.from('google_reviews').update(reviewData).eq('id', existing.id);
      updatedCount++;
    } else {
      await supabaseAdmin.from('google_reviews').insert(reviewData);
      newCount++;
    }
  }

  await supabaseAdmin.from('google_locations').update({ last_synced_at: new Date().toISOString() }).eq('id', location.id);

  return { locationName: location.location_name, total: reviews.length, new: newCount, updated: updatedCount };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { venueId, locationId } = req.body;
    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    await authenticateVenueAccess(req, venueId);

    const { data: connection } = await supabaseAdmin
      .from('google_connections')
      .select('*')
      .eq('venue_id', venueId)
      .single();

    if (!connection) {
      return res.status(404).json({ error: 'No Google connection found' });
    }

    const auth = await getRefreshedAuth(connection);

    let locationsQuery = supabaseAdmin
      .from('google_locations')
      .select('*')
      .eq('google_connection_id', connection.id)
      .eq('is_active', true);

    if (locationId) locationsQuery = locationsQuery.eq('id', locationId);

    const { data: locations } = await locationsQuery;

    if (!locations || locations.length === 0) {
      return res.status(404).json({ error: 'No active locations found' });
    }

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
        results.push({ locationName: location.location_name, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      summary: { locationsProcessed: locations.length, totalReviews, newReviews: totalNew, updatedReviews: totalUpdated },
      details: results
    });
  } catch (error) {
    console.error('Google Reviews Sync API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
