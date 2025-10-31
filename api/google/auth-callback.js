// /api/google/auth-callback.js
// Handle Google OAuth callback
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

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
    process.env.GOOGLE_REDIRECT_URI || 'https://my.getchatters.com/api/google/auth-callback'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    return res.redirect('/settings?tab=Integrations&error=google_auth_denied');
  }

  if (!code || !state) {
    return res.redirect('/settings?tab=Integrations&error=invalid_callback');
  }

  try {
    const { userId, venueId } = JSON.parse(state);
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const { data: existingConnection } = await supabaseAdmin
      .from('google_connections')
      .select('id')
      .eq('venue_id', venueId)
      .single();

    if (existingConnection) {
      await supabaseAdmin.from('google_connections').update({
        google_account_email: userInfo.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(tokens.expiry_date).toISOString(),
        user_id: userId,
        updated_at: new Date().toISOString()
      }).eq('id', existingConnection.id);

      // SKIP location fetching - requires Business Profile API quota
      console.log('Google account connected, skipping location fetch (no API quota)');
      return res.redirect('/settings?tab=Integrations&success=google_reconnected');
    } else {
      const { data: newConnection } = await supabaseAdmin.from('google_connections').insert({
        venue_id: venueId,
        user_id: userId,
        google_account_email: userInfo.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(tokens.expiry_date).toISOString()
      }).select().single();

      // SKIP location fetching - requires Business Profile API quota
      console.log('Google account connected, skipping location fetch (no API quota)');
      return res.redirect('/settings?tab=Integrations&success=google_connected')
    }
  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect('/settings?tab=Integrations&error=google_auth_failed&details=' + encodeURIComponent(error.message));
  }
}
