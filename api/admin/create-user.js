// File: /api/admin/create-user.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, venueName, trialEndsAt } = req.body;

  if (!email || !firstName || !lastName || !venueName || !trialEndsAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create the user in Supabase Auth
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        firstName,
        lastName,
        invited_by_admin: true,
      },
    });

    if (authError) throw authError;

    const userId = userData.user.id;

    // 2. Create venue row
    const { error: venueError } = await supabase.from('venues').insert([
      {
        id: userId, // optional, only if you want 1-to-1 link
        name: venueName,
        email,
        first_name: firstName,
        last_name: lastName,
        is_paid: false,
        trial_ends_at: new Date(trialEndsAt),
      },
    ]);

    if (venueError) throw venueError;

    res.status(200).json({ success: true, userId });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
}
