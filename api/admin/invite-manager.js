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

  // Add detailed logging
  console.log('=== INVITE MANAGER API CALLED ===');
  console.log('Environment check:', {
    hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL),
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
  });

  try {
    const userData = await requireMasterRole(req);
    const { email, venueIds, firstName, lastName } = req.body;

    console.log('Invite manager request:', { email, firstName, lastName, venueIds, accountId: userData.account_id });

    if (!email || !venueIds || venueIds.length === 0) {
      return res.status(400).json({ error: 'Email and venue IDs required' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name required' });
    }

    // Verify venues belong to user's account
    const { data: venues, error: venuesError } = await supabaseAdmin
      .from('venues')
      .select('id')
      .eq('account_id', userData.account_id)
      .in('id', venueIds);

    if (venuesError) {
      console.error('Error fetching venues:', venuesError);
      throw new Error('Failed to verify venues: ' + venuesError.message);
    }

    if (!venues || venues.length !== venueIds.length) {
      return res.status(403).json({ error: 'Some venues do not belong to your account' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Create invitation
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('manager_invitations')
      .insert({
        email,
        invited_by: userData.id,
        account_id: userData.account_id,
        venue_ids: venueIds,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        first_name: firstName,
        last_name: lastName
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      throw new Error('Failed to create invitation: ' + inviteError.message);
    }

    console.log('Invitation created successfully:', invitation.id);

    // TODO: Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://my.getchatters.com'}/accept-invitation?token=${token}`;

    return res.status(200).json({
      success: true,
      invitation,
      inviteLink,
      message: 'Manager invitation created successfully'
    });
  } catch (error) {
    console.error('=== INVITE MANAGER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
