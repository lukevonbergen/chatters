// /api/google/locations.js
// Get Google Business locations
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { venueId } = req.query;
    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    await authenticateVenueAccess(req, venueId);

    // Use supabaseAdmin since we've already authenticated the user
    const { data: connection } = await supabaseAdmin
      .from('google_connections')
      .select('id')
      .eq('venue_id', venueId)
      .single();

    if (!connection) {
      return res.status(404).json({ error: 'No Google connection found', connected: false });
    }

    const { data: locations } = await supabaseAdmin
      .from('google_locations')
      .select('*')
      .eq('google_connection_id', connection.id)
      .eq('is_active', true)
      .order('location_name');

    return res.status(200).json({ locations: locations || [], count: locations?.length || 0 });
  } catch (error) {
    console.error('Locations fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
