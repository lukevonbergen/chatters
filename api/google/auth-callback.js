// /api/google/auth-callback.js
// Handles OAuth callback from Google
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { getOAuth2Client } = require('./utils/google-client');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Fetches and stores Google Business locations for a connection
 */
async function fetchAndStoreLocations(connectionId, auth) {
  try {
    console.log('Fetching Google Business locations...');

    // Get Google Business accounts
    const mybusinessAccountManagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth
    });

    const accountsResponse = await mybusinessAccountManagement.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    if (accounts.length === 0) {
      throw new Error('No Google Business Profile accounts found for this Google account');
    }

    console.log(`Found ${accounts.length} Google Business account(s)`);

    let totalLocations = 0;

    for (const account of accounts) {
      // Get locations for each account
      const mybusinessBusinessInfo = google.mybusinessbusinessinformation({
        version: 'v1',
        auth
      });

      const locationsResponse = await mybusinessBusinessInfo.accounts.locations.list({
        parent: account.name,
        readMask: 'name,title,storefrontAddress,phoneNumbers,websiteUri'
      });

      const locations = locationsResponse.data.locations || [];
      console.log(`Found ${locations.length} location(s) for account ${account.name}`);

      for (const location of locations) {
        // Build address string
        const addressLines = location.storefrontAddress?.addressLines || [];
        const fullAddress = [
          ...addressLines,
          location.storefrontAddress?.locality,
          location.storefrontAddress?.postalCode
        ].filter(Boolean).join(', ');

        // Insert or update location
        const { error } = await supabaseAdmin
          .from('google_locations')
          .upsert({
            google_connection_id: connectionId,
            location_id: location.name,
            location_name: location.title,
            address: fullAddress,
            phone_number: location.phoneNumbers?.primaryPhone,
            website_url: location.websiteUri,
            is_active: true
          }, {
            onConflict: 'location_id'
          });

        if (error) {
          console.error('Error storing location:', error);
        } else {
          totalLocations++;
        }
      }
    }

    console.log(`Successfully stored ${totalLocations} location(s)`);
    return totalLocations;

  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error: oauthError } = req.query;

  // Handle OAuth errors
  if (oauthError) {
    console.error('Google OAuth error:', oauthError);
    return res.redirect('/settings?tab=Integrations&error=google_auth_denied');
  }

  if (!code || !state) {
    return res.redirect('/settings?tab=Integrations&error=invalid_callback');
  }

  try {
    // Parse state parameter
    const { userId, venueId, accountId } = JSON.parse(state);

    // Create OAuth2 client
    const oauth2Client = getOAuth2Client();

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's Google email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log(`Google OAuth successful for ${userInfo.email}`);

    // Check if venue already has a Google connection
    const { data: existingConnection } = await supabaseAdmin
      .from('google_connections')
      .select('id')
      .eq('venue_id', venueId)
      .single();

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from('google_connections')
        .update({
          google_account_email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(tokens.expiry_date).toISOString(),
          user_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id);

      if (updateError) throw updateError;

      console.log('Updated existing Google connection');

      // Fetch and store locations
      await fetchAndStoreLocations(existingConnection.id, oauth2Client);

      return res.redirect('/settings?tab=Integrations&success=google_reconnected');

    } else {
      // Create new connection
      const { data: newConnection, error: insertError } = await supabaseAdmin
        .from('google_connections')
        .insert({
          venue_id: venueId,
          user_id: userId,
          google_account_email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(tokens.expiry_date).toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Created new Google connection');

      // Fetch and store locations
      const locationCount = await fetchAndStoreLocations(newConnection.id, oauth2Client);

      return res.redirect(`/settings?tab=Integrations&success=google_connected&locations=${locationCount}`);
    }

  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect('/settings?tab=Integrations&error=google_auth_failed&details=' + encodeURIComponent(error.message));
  }
}
