// /api/admin/resend-invitation.js
const { createClient } = require('@supabase/supabase-js');
const { requireMasterRole } = require('../auth-helper');
const { Resend } = require('resend');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await requireMasterRole(req);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the pending invitation
    const { data: invitation, error } = await supabaseAdmin
      .from('manager_invitations')
      .select('*')
      .eq('email', email)
      .eq('account_id', userData.account_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !invitation) {
      return res.status(404).json({ error: 'No pending invitation found for this email' });
    }

    // Extend expiration
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await supabaseAdmin.from('manager_invitations').update({
      expires_at: newExpiresAt.toISOString()
    }).eq('id', invitation.id);

    // Resend the invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://my.getchatters.com'}/set-password?token=${invitation.token}`;

    if (process.env.RESEND_API_KEY) {
      // Get venue names
      const { data: venues } = await supabaseAdmin
        .from('venues')
        .select('name')
        .in('id', invitation.venue_ids);

      const venueNames = venues?.map(v => v.name).join(', ') || 'selected venues';

      // Get inviter's name
      const { data: inviter } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name')
        .eq('id', userData.id)
        .single();

      const inviterName = inviter ? `${inviter.first_name} ${inviter.last_name}` : 'Your account administrator';

      await resend.emails.send({
        from: 'Chatters <noreply@getchatters.com>',
        to: email,
        subject: 'Reminder: You\'ve been invited to manage venues on Chatters',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Reminder: You've been invited to Chatters</h1>
              <p style="margin: 0 0 15px 0; color: #555;">Hi ${invitation.first_name},</p>
              <p style="margin: 0 0 15px 0; color: #555;">
                This is a reminder that ${inviterName} has invited you to manage venues on Chatters.
              </p>
              <p style="margin: 0 0 20px 0; color: #555;">
                You'll have access to: <strong>${venueNames}</strong>
              </p>
              <a href="${inviteLink}"
                 style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 500; margin: 10px 0;">
                Accept Invitation
              </a>
              <p style="margin: 20px 0 0 0; color: #888; font-size: 14px;">
                This link expires in 7 days.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #888; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 0;">
                Can't click the button? Copy and paste this link into your browser:<br>
                <span style="color: #10b981;">${inviteLink}</span>
              </p>
            </div>
          </body>
          </html>
        `
      });

      console.log('Invitation resent to:', email);
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation email resent successfully'
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    return res.status(500).json({ error: error.message });
  }
};
