// ===============================
// /api/admin/create-user.js
// ===============================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🔁 [API] Admin Create Master User + Venues');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, phone, trialEndsAt, venues } = req.body;

  if (!email || !firstName || !lastName || !phone || !trialEndsAt || !Array.isArray(venues) || venues.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or venues invalid' });
  }

  try {
    // 1. Create Supabase Auth user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      phone,
      user_metadata: { firstName, lastName, invited_by_admin: true },
    });
    if (createError) throw createError;
    const authUserId = userData.user.id;

    // 2. Invite user
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) throw inviteError;

    // 3. Create Account
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .insert([{ name: `${firstName} ${lastName} Org`, trial_ends_at: new Date(trialEndsAt), is_paid: false }])
      .select()
      .single();
    if (accountError) throw accountError;
    const accountId = accountData.id;

    // 4. Create User row
    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: authUserId,
        email,
        role: 'master',
        phone,
        account_id: accountId,
        venue_id: null,
      },
    ]);
    if (userInsertError) throw userInsertError;

    // 5. Create each venue
    for (const venue of venues) {
      const {
        name,
        address,
        tableCount,
        logo = null,
        primaryColor = '#000000',
        secondaryColor = '#ffffff',
      } = venue;

      if (!name || !address || !tableCount) continue;

      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([
          {
            name,
            account_id: accountId,
            first_name: firstName,
            last_name: lastName,
            is_paid: false,
            logo,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            address,
            table_count: tableCount,
          },
        ])
        .select()
        .single();

      if (venueError) throw venueError;

      const venueId = venueData.id;

      const { error: staffError } = await supabase.from('staff').insert([
        {
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