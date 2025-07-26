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
    // Step 1: Create user in Supabase Auth
    console.log('🔐 Creating Supabase Auth user...');
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        firstName,
        lastName,
        invited_by_admin: true,
      },
    });

    if (authError) {
      console.error('❌ Supabase Auth creation error:', authError);
      throw authError;
    }

    const userId = userData.user.id;
    console.log('✅ Supabase user created:', userId);

    // Step 2: Insert venue row
    console.log('🏠 Inserting venue record...');
    const { error: venueError } = await supabase.from('venues').insert([
      {
        id: userId, // optional, aligns auth user to venue
        name: venueName,
        email,
        first_name: firstName,
        last_name: lastName,
        is_paid: false,
        trial_ends_at: new Date(trialEndsAt),
      },
    ]);

    if (venueError) {
      console.error('❌ Venue insert error:', venueError);
      throw venueError;
    }

    console.log('✅ Venue inserted successfully');

    res.status(200).json({ success: true, userId });
  } catch (err) {
    console.error('🔥 Unexpected error in admin/create-user:', err);
    res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
}
