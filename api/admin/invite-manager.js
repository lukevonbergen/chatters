// /api/admin/invite-manager.js
const { createClient } = require('@supabase/supabase-js');
const { requireMasterRole } = require('../auth-helper');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await requireMasterRole(req);
    const { email, venueIds } = req.body;

    if (!email || !venueIds || venueIds.length === 0) {
      return res.status(400).json({ error: 'Email and venue IDs required' });
    }

    // Verify venues belong to user's account
    const { data: venues } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('account_id', userData.account_id)
      .in('id', venueIds);

    if (venues.length !== venueIds.length) {
      return res.status(403).json({ error: 'Some venues do not belong to your account' });
    }

    // Create invitation
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitation, error } = await supabaseAdmin.from('manager_invitations').insert({
      email,
      invited_by: userData.id,
      account_id: userData.account_id,
      venue_ids: venueIds,
      token,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    }).select().single();

    if (error) throw error;

    // TODO: Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://my.getchatters.com'}/accept-invitation?token=${token}`;

    return res.status(200).json({ success: true, invitation, inviteLink });
  } catch (error) {
    console.error('Invite manager error:', error);
    return res.status(500).json({ error: error.message });
  }
};
