import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the email change request
    const { data: request, error: fetchError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !request) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired verification link'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already verified
    if (request.verified) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This email change has already been verified'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(request.expires_at);
    if (now > expiresAt) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This verification link has expired'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update auth.users email using admin API
    const { data: authUser, error: authUpdateError } = await supabase.auth.admin.updateUserById(
      request.user_id,
      { email: request.new_email }
    );

    if (authUpdateError) {
      console.error('Error updating auth.users:', authUpdateError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update email in authentication system'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update users table
    const { error: usersUpdateError } = await supabase
      .from('users')
      .update({ email: request.new_email })
      .eq('id', request.user_id);

    if (usersUpdateError) {
      console.error('Error updating users table:', usersUpdateError);
      // Don't fail the whole operation if users table update fails
      // The auth email is the source of truth
    }

    // Mark request as verified
    const { error: verifyError } = await supabase
      .from('email_change_requests')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('token', token);

    if (verifyError) {
      console.error('Error marking request as verified:', verifyError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Email address successfully updated',
      newEmail: request.new_email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in verify-email-change function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
