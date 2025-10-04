// supabase/functions/validate-invitation-token/index.ts
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

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Token is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Look up the token in the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('staff_invitation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid invitation token' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if token has been used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ valid: false, message: 'This invitation has already been used' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, message: 'This invitation has expired' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Token is valid
    return new Response(
      JSON.stringify({
        valid: true,
        email: tokenData.email,
        venueId: tokenData.venue_id,
        role: tokenData.role
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error validating invitation token:', error);
    return new Response(
      JSON.stringify({ valid: false, message: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
