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

    // Resend invitation with redirect to set-password page
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://my.getchatters.com/set-password'
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