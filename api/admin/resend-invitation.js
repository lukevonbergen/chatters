// /api/admin/resend-invitation.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists and is not confirmed
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already confirmed
    if (user.email_confirmed_at) {
      return res.status(400).json({ error: 'User has already accepted the invitation' });
    }

    // Get user's venue for invitation email
    const { data: staffData } = await supabase
      .from('staff')
      .select('venue_id, venues(name)')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    let venueName = 'the team';
    let venueId = null;
    if (staffData) {
      venueName = staffData.venues?.name || 'the team';
      venueId = staffData.venue_id;
    }

    // Resend invitation via Resend Edge Function
    const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-staff-invitation', {
      body: {
        email,
        venueId,
        role: 'manager',
        venueName
      }
    });
    if (inviteError) throw inviteError;

    return res.status(200).json({ 
      success: true, 
      message: 'Invitation resent successfully' 
    });

  } catch (err) {
    console.error('🔥 Error resending invitation:', err);
    return res.status(500).json({ error: err.message });
  }
}