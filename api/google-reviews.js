// /api/google-reviews.js
// Consolidated Google Reviews management endpoints
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess } = require('./auth-helper');

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
  const { action } = req.query;

  try {
    switch (action) {
      case 'list':
        return await handleList(req, res);
      case 'sync':
        return await handleSync(req, res);
      case 'reply':
        return await handleReply(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action. Use: list, sync, reply' });
    }
  } catch (error) {
    console.error('Google Reviews API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Handler: List reviews
async function handleList(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId, filter = 'all', locationId } = req.query;
  if (!venueId) {
    return res.status(400).json({ error: 'venueId is required' });
  }

  const userData = await authenticateVenueAccess(req, venueId);

  if (userData.role === 'manager') {
    const { data: permissions } = await supabaseClient
      .from('venue_permissions')
      .select('can_view_google_reviews')
      .eq('venue_id', venueId)
      .single();

    if (!permissions || !permissions.can_view_google_reviews) {
      return res.status(403).json({ error: 'Permission denied' });
    }
  }

  const { data: connection } = await supabaseClient
    .from('google_connections')
    .select('id')
    .eq('venue_id', venueId)
    .single();

  if (!connection) {
    return res.status(404).json({ error: 'No Google connection found', connected: false, reviews: [] });
  }

  let query = supabaseAdmin
    .from('google_reviews')
    .select('*, google_locations!inner(id, location_name, address, google_connection_id)')
    .eq('google_locations.google_connection_id', connection.id)
    .order('review_date', { ascending: false });

  if (locationId) query = query.eq('location_id', locationId);
  if (filter === 'unresponded') query = query.eq('is_replied', false);
  else if (filter === 'responded') query = query.eq('is_replied', true);

  const { data: reviews } = await query;

  const stats = {
    total: reviews.length,
    unresponded: reviews.filter(r => !r.is_replied).length,
    responded: reviews.filter(r => r.is_replied).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length).toFixed(1) : 0,
    ratingBreakdown: {
      5: reviews.filter(r => r.star_rating === 5).length,
      4: reviews.filter(r => r.star_rating === 4).length,
      3: reviews.filter(r => r.star_rating === 3).length,
      2: reviews.filter(r => r.star_rating === 2).length,
      1: reviews.filter(r => r.star_rating === 1).length
    }
  };

  return res.status(200).json({ reviews: reviews || [], stats });
}

// Handler: Sync reviews
async function handleSync(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

// Handler: Reply to review
async function handleReply(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const { data: permissions } = await supabaseClient
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
}
