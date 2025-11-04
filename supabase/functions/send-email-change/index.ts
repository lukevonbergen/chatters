import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://my.getchatters.com';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { currentEmail, newEmail } = await req.json();

    if (!currentEmail || !newEmail) {
      return new Response(JSON.stringify({ error: 'Current and new email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Check if current user exists
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', currentEmail.toLowerCase())
      .single();

    if (userError || !currentUser) {
      return new Response(JSON.stringify({ error: 'Current user not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if new email is already in use
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail.toLowerCase())
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'This email is already in use by another account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate a random token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Store the email change request in a table (we'll need to create this)
    const { error: insertError } = await supabase
      .from('email_change_requests')
      .insert({
        user_id: currentUser.id,
        old_email: currentEmail.toLowerCase(),
        new_email: newEmail.toLowerCase(),
        token: token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating email change request:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create email change request' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create verification URL
    const verificationUrl = `${APP_URL}/verify-email-change?token=${token}`;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Chatters <noreply@getchatters.com>',
        to: [newEmail],
        subject: 'Verify Your New Email Address',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your New Email</h1>
              </div>

              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${currentUser.first_name || 'there'},</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  You've requested to change your Chatters account email address from <strong>${currentEmail}</strong> to <strong>${newEmail}</strong>.
                </p>

                <p style="font-size: 16px; margin-bottom: 30px;">
                  Click the button below to verify this email address and complete the change:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}"
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                    Verify New Email Address
                  </a>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 14px; color: #667eea; word-break: break-all; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                  ${verificationUrl}
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                    <strong>Important:</strong>
                  </p>
                  <ul style="font-size: 14px; color: #666; padding-left: 20px;">
                    <li>This link will expire in 24 hours</li>
                    <li>If you didn't request this change, please ignore this email</li>
                    <li>Your current email address will remain active until you verify the new one</li>
                  </ul>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="font-size: 12px; color: #999; margin: 0;">
                    © ${new Date().getFullYear()} Chatters. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to send verification email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Verification email sent to your new email address. Please check your inbox.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-email-change function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
