// /api/google/utils/token-refresh.js
// Handles automatic token refresh for Google OAuth
const { createClient } = require('@supabase/supabase-js');
const { getOAuth2Client } = require('./google-client');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Gets a refreshed OAuth2 client for a Google connection
 * Automatically refreshes token if expired or expiring soon
 * @param {Object} googleConnection - The google_connections record
 * @returns {Promise<OAuth2Client>}
 */
async function getRefreshedAuth(googleConnection) {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: googleConnection.access_token,
    refresh_token: googleConnection.refresh_token,
    expiry_date: new Date(googleConnection.token_expires_at).getTime()
  });

  // Check if token is expired or expiring in next 5 minutes
  const now = Date.now();
  const expiryDate = new Date(googleConnection.token_expires_at).getTime();

  if (now >= expiryDate - 5 * 60 * 1000) { // Refresh 5 minutes before expiry
    try {
      console.log(`Refreshing token for connection ${googleConnection.id}`);
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update database with new token
      const { error } = await supabaseAdmin
        .from('google_connections')
        .update({
          access_token: credentials.access_token,
          token_expires_at: new Date(credentials.expiry_date).toISOString()
        })
        .eq('id', googleConnection.id);

      if (error) {
        console.error('Failed to update token in database:', error);
        throw new Error('Failed to update refreshed token');
      }

      oauth2Client.setCredentials(credentials);
      console.log(`Token refreshed successfully for connection ${googleConnection.id}`);
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh Google token. User may need to re-authenticate.');
    }
  }

  return oauth2Client;
}

module.exports = { getRefreshedAuth };
