// ==========================
// /api/admin/create-user.js
// ==========================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🔁 [API] Admin Create User + Locations');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, trialEndsAt, venues } = req.body;

  if (!email || !firstName || !lastName || !trialEndsAt || !Array.isArray(venues)) {
    return res.status(400).json({ error: 'Missing required fields or venues not valid' });
  }

  try {
    // 1. Create Supabase Auth user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: { firstName, lastName, invited_by_admin: true },
    });
    if (createError) throw createError;
    const authUserId = userData.user.id;

    // 2. Invite user
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) throw inviteError;

    // 3. Create Account with trial info
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .insert([{ name: `${firstName} ${lastName} Org`, trial_ends_at: new Date(trialEndsAt), is_paid: false }])
      .select()
      .single();
    if (accountError) throw accountError;
    const accountId = accountData.id;

    // 4. Insert user row
    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: authUserId,
        email,
        role: 'master',
        account_id: accountId,
        venue_id: null, // linked by staff entries instead
      },
    ]);
    if (userInsertError) throw userInsertError;

    // 5. Create each Venue & Staff
    for (const venue of venues) {
      const { name, email: venueEmail } = venue;
      if (!name || !venueEmail) continue;

      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([{ name, email: venueEmail, account_id: accountId, is_paid: false, first_name: firstName, last_name: lastName }])
        .select()
        .single();
      if (venueError) throw venueError;

      const venueId = venueData.id;

      const { error: staffError } = await supabase.from('staff').insert([
        {
          email: venueEmail,
          first_name: firstName,
          last_name: lastName,
          venue_id: venueId,
          role: 'manager',
          user_id: authUserId,
        },
      ]);
      if (staffError) throw staffError;
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🔥 Error in create-user:', err);
    return res.status(500).json({ error: err.message });
  }
}
