// /api/admin/resend-invitation.js
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
    const { invitationId } = req.body;

    const { data: invitation, error } = await supabaseAdmin
      .from('manager_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('invited_by', userData.id)
      .single();

    if (error || !invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Extend expiration
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await supabaseAdmin.from('manager_invitations').update({
      expires_at: newExpiresAt.toISOString()
    }).eq('id', invitationId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend invitation error:', error);
    return res.status(500).json({ error: error.message });
  }
};
