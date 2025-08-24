import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { venueId, tableNumber, message } = await req.json()

    // Validate required parameters
    if (!venueId || !tableNumber) {
      throw new Error('Missing required parameters: venueId and tableNumber')
    }

    // Create Supabase client with service key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify venue exists before creating assistance request
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('id', venueId)
      .single()

    if (venueError || !venue) {
      throw new Error('Invalid venue ID')
    }

    // Insert assistance request
    const { data, error } = await supabase
      .from('assistance_requests')
      .insert([{
        venue_id: venueId,
        table_number: parseInt(tableNumber),
        status: 'pending',
        message: message || 'Just need assistance - Our team will be right with you',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data?.[0],
        message: 'Assistance request created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create assistance request',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})