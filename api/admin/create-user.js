// /api/admin/create-user.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🔁 [API] Admin Create User + Venues');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, phone, trialEndsAt, companyName, accountPhone, venues } = req.body;

  if (!email || !firstName || !lastName || !phone || !trialEndsAt || !companyName || !Array.isArray(venues)) {
    return res.status(400).json({ error: 'Missing required fields or invalid venue data' });
  }

  try {
    // 1. Create Supabase Auth user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: { firstName, lastName, phone, invited_by_admin: true },
    });
    if (createError) throw createError;

    const authUserId = userData.user.id;

    // 2. Send invitation email
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) throw inviteError;

    // 3. Create account (company)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .insert([
        {
          name: companyName,
          phone: accountPhone,
          trial_ends_at: new Date(trialEndsAt),
          is_paid: false,
        },
      ])
      .select()
      .single();
    if (accountError) throw accountError;

    const accountId = accountData.id;

    // 4. Insert user into users table as master
    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: authUserId,
        email,
        phone,
        role: 'master',
        account_id: accountId,
        venue_id: null,
      },
    ]);
    if (userInsertError) throw userInsertError;

    // 5. Loop through venues and insert each one
    for (const venue of venues) {
      const {
        name,
        address = {},
        table_count = 0,
        logo = null,
        primary_color = '#000000',
        secondary_color = '#ffffff',
        tripadvisor_link = '',
        google_review_link = '',
      } = venue;

      if (!name || typeof table_count !== 'number') continue;

      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([
          {
            name,
            table_count,
            logo,
            primary_color,
            secondary_color,
            address,
            tripadvisor_link,
            google_review_link,
            account_id: accountId,
            is_paid: false,
            first_name: firstName,
            last_name: lastName,
          },
        ])
        .select()
        .single();
      if (venueError) throw venueError;

      const venueId = venueData.id;

      // 6. Add staff entry for the user at this venue
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
    return res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}