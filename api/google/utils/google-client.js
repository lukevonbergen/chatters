// /api/google/utils/google-client.js
// Google OAuth client configuration
const { google } = require('googleapis');

/**
 * Creates a Google OAuth2 client
 * @returns {OAuth2Client}
 */
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://my.getchatters.com/api/google/auth-callback'
  );
}

module.exports = { getOAuth2Client };
