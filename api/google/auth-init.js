// /api/google/auth-init.js
// Initiates Google OAuth flow
const { getOAuth2Client } = require('./utils/google-client');
const { requireMasterRole } = require('../auth-helper');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Create OAuth2 client
    const oauth2Client = getOAuth2Client();

    // Define scopes we need
    const scopes = [
      'https://www.googleapis.com/auth/business.manage', // Manage Google Business Profile
      'https://www.googleapis.com/auth/userinfo.email'   // Get user's email
    ];

    // Generate auth URL with state parameter containing user and venue info
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',     // Get refresh token
      scope: scopes,
      prompt: 'consent',          // Force consent screen to ensure we get refresh token
      state: JSON.stringify({
        userId: userData.id,
        venueId: venueId,
        accountId: userData.account_id
      })
    });

    // Return the URL for frontend to redirect to
    return res.status(200).json({ authUrl });

  } catch (error) {
    console.error('Error initiating Google auth:', error);
    return res.status(500).json({
      error: 'Failed to initiate Google authentication',
      message: error.message
    });
  }
}
