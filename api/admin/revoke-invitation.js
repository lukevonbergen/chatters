// /api/admin/revoke-invitation.js
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

    const { error } = await supabaseAdmin
      .from('manager_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId)
      .eq('invited_by', userData.id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    return res.status(500).json({ error: error.message });
  }
};
