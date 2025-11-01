// /api/google/auth-init.js
// Initialize Google OAuth flow
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

// Google OAuth scopes
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/userinfo.email'
];

// OAuth2 client helper
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://my.getchatters.com/api/google/auth-callback'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await requireMasterRole(req);
    const { venueId } = req.body;

    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    const oauth2Client = getOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
      prompt: 'consent',
      state: JSON.stringify({ userId: userData.id, venueId, accountId: userData.account_id })
    });

    return res.status(200).json({ authUrl });
  } catch (error) {
    console.error('Auth init error:', error);
    return res.status(500).json({ error: error.message });
  }
}
