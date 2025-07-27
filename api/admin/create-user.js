import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🔁 [API] Admin Create User called');

  if (req.method !== 'POST') {
    console.warn('🚫 Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, venueName, trialEndsAt } = req.body;

  if (!email || !firstName || !lastName || !venueName || !trialEndsAt) {
    console.warn('❗ Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create the Supabase Auth user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: {
        firstName,
        lastName,
        invited_by_admin: true,
      },
    });

    if (createError) throw createError;
    const authUserId = userData.user.id;

    // 2. Send the invite email
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) throw inviteError;

    // 3. Create an Account (Org) with trial date
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .insert([
        {
          name: `${venueName} Org`,
          trial_ends_at: new Date(trialEndsAt),
          is_paid: false,
        },
      ])
      .select()
      .single();

    if (accountError) throw accountError;
    const accountId = accountData.id;

    // 4. Create the Venue
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .insert([
        {
          name: venueName,
          email,
          first_name: firstName,
          last_name: lastName,
          is_paid: false,
          account_id: accountId,
        },
      ])
      .select()
      .single();

    if (venueError) throw venueError;
    const venueId = venueData.id;

    // 5. Create the App User (linked to Auth)
    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: authUserId,
        email,
        role: 'master',
        account_id: accountId,
        venue_id: venueId,
      },
    ]);

    if (userInsertError) throw userInsertError;

    // 6. Create a Staff record (for resolution tracking)
    const { error: staffError } = await supabase.from('staff').insert([
      {
        email,
        first_name: firstName,
        last_name: lastName,
        venue_id: venueId,
        role: 'manager',
        user_id: authUserId,
      },
    ]);

    if (staffError) throw staffError;

    return res.status(200).json({ success: true, userId: authUserId });
  } catch (err) {
    console.error('🔥 Error in create-user:', err);
    return res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
}