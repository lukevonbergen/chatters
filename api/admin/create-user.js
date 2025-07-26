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
  console.log('📦 Incoming body:', { email, firstName, lastName, venueName, trialEndsAt });

  if (!email || !firstName || !lastName || !venueName || !trialEndsAt) {
    console.warn('❗ Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create the Supabase Auth user
    console.log('🔐 Creating Supabase Auth user...');
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: {
        firstName,
        lastName,
        invited_by_admin: true,
      },
    });

    if (createError) {
      console.error('❌ Auth user creation failed:', createError);
      throw createError;
    }

    const userId = userData.user.id;
    console.log('✅ Supabase user created:', userId);

    // 2. Send the invite email (required for password setup)
    console.log('📨 Sending invite email...');
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) {
      console.error('❌ Invite email failed:', inviteError);
      throw inviteError;
    }
    console.log('✅ Invite email sent');

    // 3. Insert into venues table
    console.log('🏠 Inserting venue...');
    const { error: venueError } = await supabase.from('venues').insert([
      {
        id: userId,
        name: venueName,
        email,
        first_name: firstName,
        last_name: lastName,
        is_paid: false,
        trial_ends_at: new Date(trialEndsAt),
      },
    ]);

    if (venueError) {
      console.error('❌ Venue insert failed:', venueError);
      throw venueError;
    }

    console.log('✅ Venue inserted successfully');

    return res.status(200).json({ success: true, userId });
  } catch (err) {
    console.error('🔥 Unexpected error in admin/create-user:', err);
    return res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
}
