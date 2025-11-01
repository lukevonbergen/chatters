import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, firstName, lastName, venueName } = req.body;

  if (!email || !password || !firstName || !lastName || !venueName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw new Error(authError.message);

    // 2. Create account with trial billing info
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert([{
        trial_ends_at: trialEndsAt.toISOString(),
        is_paid: false,
        stripe_customer_id: null,
        stripe_subscription_id: null
      }])
      .select()
      .single();

    if (accountError) throw new Error(accountError.message);

    // 3. Create venue linked to account
    const { error: venueError } = await supabase
      .from('venues')
      .insert([{
        name: venueName,
        account_id: account.id,
        email: email,
      }]);

    if (venueError) throw new Error(venueError.message);

    // 4. Create user record linking auth user to account
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        role: 'master',
        account_id: account.id
      }]);

    if (userError) throw new Error(userError.message);

    return res.status(200).json({ message: 'Account created with trial' });
  } catch (err) {
    console.error('Trial account creation error:', err);
    return res.status(500).json({ error: err.message });
  }
}