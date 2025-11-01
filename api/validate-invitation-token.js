// /api/validate-invitation-token.js
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        valid: false,
        message: 'Token is required'
      });
    }

    // Look up the invitation
    const { data: invitation, error } = await supabaseAdmin
      .from('manager_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !invitation) {
      return res.status(200).json({
        valid: false,
        message: 'Invalid invitation token'
      });
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return res.status(200).json({
        valid: false,
        message: 'This invitation has expired'
      });
    }

    // Check if invitation has already been accepted
    if (invitation.status === 'accepted') {
      return res.status(200).json({
        valid: false,
        message: 'This invitation has already been used'
      });
    }

    // Token is valid
    return res.status(200).json({
      valid: true,
      email: invitation.email,
      firstName: invitation.first_name,
      lastName: invitation.last_name
    });

  } catch (error) {
    console.error('Validate invitation token error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Internal server error'
    });
  }
};
