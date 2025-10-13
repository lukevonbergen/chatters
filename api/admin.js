// /api/admin.js
// Consolidated admin endpoints
const { createClient } = require('@supabase/supabase-js');
const { requireAdminRole, requireMasterRole } = require('./auth-helper');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'create-user':
        return await handleCreateUser(req, res);
      case 'invite-manager':
        return await handleInviteManager(req, res);
      case 'resend-invitation':
        return await handleResendInvitation(req, res);
      case 'revoke-invitation':
        return await handleRevokeInvitation(req, res);
      case 'get-pending-invitations':
        return await handleGetPendingInvitations(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleCreateUser(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAdminRole(req);
    const { email, password, role, accountId } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email,
      role,
      account_id: accountId || null
    });

    if (userError) throw userError;

    return res.status(200).json({ success: true, user: authData.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function handleInviteManager(req, res) {
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
    return res.status(500).json({ error: error.message });
  }
}

async function handleResendInvitation(req, res) {
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
    return res.status(500).json({ error: error.message });
  }
}

async function handleRevokeInvitation(req, res) {
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
    return res.status(500).json({ error: error.message });
  }
}

async function handleGetPendingInvitations(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await requireMasterRole(req);

    const { data: invitations, error } = await supabaseAdmin
      .from('manager_invitations')
      .select('*')
      .eq('invited_by', userData.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ invitations: invitations || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
