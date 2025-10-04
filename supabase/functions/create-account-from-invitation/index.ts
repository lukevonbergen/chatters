// supabase/functions/create-account-from-invitation/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, password } = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token and password are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, message: 'Password must be at least 6 characters long' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Look up and validate the token
    const { data: tokenData, error: tokenError } = await supabase
      .from('staff_invitation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid invitation token' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if token has been used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ success: false, message: 'This invitation has already been used' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ success: false, message: 'This invitation has expired. Please request a new invitation.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === tokenData.email);

    if (userExists) {
      // User exists, just mark token as used
      await supabase
        .from('staff_invitation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      return new Response(
        JSON.stringify({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create the user account
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: tokenData.email,
      password: password,
      email_confirm: true, // Auto-confirm email since they're invited
      user_metadata: {
        role: tokenData.role || 'manager'
      }
    });

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create account. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the user's role in the users table
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ role: tokenData.role || 'manager' })
      .eq('id', newUser.user.id);

    if (updateUserError) {
      console.error('Error updating user role:', updateUserError);
    }

    // Add the user to the staff table for the venue
    const { error: staffError } = await supabase
      .from('staff')
      .insert({
        user_id: newUser.user.id,
        venue_id: tokenData.venue_id,
        role: tokenData.role || 'manager'
      });

    if (staffError) {
      console.error('Error adding user to staff:', staffError);
      return new Response(
        JSON.stringify({ success: false, message: 'Account created but failed to link to venue. Please contact support.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Mark the token as used
    await supabase
      .from('staff_invitation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created successfully',
        userId: newUser.user.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating account from invitation:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
