// /api/google.js
// Consolidated Google OAuth and connection management endpoints
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { authenticateVenueAccess, requireMasterRole } = require('./auth-helper');

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
    process.env.GOOGLE_REDIRECT_URI || 'https://my.getchatters.com/api/google?action=auth-callback'
  );
}

// Fetch and store Google Business locations
async function fetchAndStoreLocations(connectionId, auth) {
  try {
    const mybusinessAccountManagement = google.mybusinessaccountmanagement({ version: 'v1', auth });
    const accountsResponse = await mybusinessAccountManagement.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    if (accounts.length === 0) {
      throw new Error('No Google Business Profile accounts found');
    }

    let totalLocations = 0;
    for (const account of accounts) {
      const mybusinessBusinessInfo = google.mybusinessbusinessinformation({ version: 'v1', auth });
      const locationsResponse = await mybusinessBusinessInfo.accounts.locations.list({
        parent: account.name,
        readMask: 'name,title,storefrontAddress,phoneNumbers,websiteUri'
      });

      const locations = locationsResponse.data.locations || [];
      for (const location of locations) {
        const addressLines = location.storefrontAddress?.addressLines || [];
        const fullAddress = [...addressLines, location.storefrontAddress?.locality, location.storefrontAddress?.postalCode].filter(Boolean).join(', ');

        await supabaseAdmin.from('google_locations').upsert({
          google_connection_id: connectionId,
          location_id: location.name,
          location_name: location.title,
          address: fullAddress,
          phone_number: location.phoneNumbers?.primaryPhone,
          website_url: location.websiteUri,
          is_active: true
        }, { onConflict: 'location_id' });
        totalLocations++;
      }
    }
    return totalLocations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    // Route to appropriate handler based on action
    switch (action) {
      case 'auth-init':
        return await handleAuthInit(req, res);
      case 'auth-callback':
        return await handleAuthCallback(req, res);
      case 'disconnect':
        return await handleDisconnect(req, res);
      case 'status':
        return await handleStatus(req, res);
      case 'locations':
        return await handleLocations(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action. Use: auth-init, auth-callback, disconnect, status, locations' });
    }
  } catch (error) {
    console.error('Google API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Handler: Initiate OAuth flow
async function handleAuthInit(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userData = await requireMasterRole(req);
  const { venueId } = req.body;

  if (!venueId) {
    return res.status(400).json({ error: 'venueId is required' });
  }

  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: JSON.stringify({ userId: userData.id, venueId, accountId: userData.account_id })
  });

  return res.status(200).json({ authUrl });
}

// Handler: OAuth callback
async function handleAuthCallback(req, res) {
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

// Handler: Disconnect
async function handleDisconnect(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userData = await requireMasterRole(req);
  const { venueId } = req.body;

  if (!venueId) {
    return res.status(400).json({ error: 'venueId is required' });
  }

  const { data: venue } = await supabaseAdmin.from('venues').select('account_id').eq('id', venueId).single();
  if (!venue || venue.account_id !== userData.account_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  await supabaseAdmin.from('google_connections').delete().eq('venue_id', venueId);
  return res.status(200).json({ success: true, message: 'Disconnected successfully' });
}

// Handler: Status
async function handleStatus(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  if (!venueId) {
    return res.status(400).json({ error: 'venueId is required' });
  }

  await authenticateVenueAccess(req, venueId);

  const { data: connection, error } = await supabaseClient
    .from('google_connections')
    .select('id, google_account_email, created_at')
    .eq('venue_id', venueId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  let locationCount = 0;
  if (connection) {
    const { count } = await supabaseClient
      .from('google_locations')
      .select('*', { count: 'exact', head: true })
      .eq('google_connection_id', connection.id)
      .eq('is_active', true);
    locationCount = count || 0;
  }

  return res.status(200).json({
    connected: !!connection,
    connection: connection ? {
      id: connection.id,
      email: connection.google_account_email,
      connectedAt: connection.created_at,
      locationCount
    } : null
  });
}

// Handler: Locations
async function handleLocations(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venueId } = req.query;
  if (!venueId) {
    return res.status(400).json({ error: 'venueId is required' });
  }

  await authenticateVenueAccess(req, venueId);

  const { data: connection } = await supabaseClient
    .from('google_connections')
    .select('id')
    .eq('venue_id', venueId)
    .single();

  if (!connection) {
    return res.status(404).json({ error: 'No Google connection found', connected: false });
  }

  const { data: locations } = await supabaseClient
    .from('google_locations')
    .select('*')
    .eq('google_connection_id', connection.id)
    .eq('is_active', true)
    .order('location_name');

  return res.status(200).json({ locations: locations || [], count: locations?.length || 0 });
}
