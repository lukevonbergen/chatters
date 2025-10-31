// /api/google/disconnect.js
// Disconnect Google account
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { requireMasterRole } = require('../auth-helper');

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
  } catch (error) {
    console.error('Disconnect error:', error);
    return res.status(500).json({ error: error.message });
  }
}
