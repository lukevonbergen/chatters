import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false, // triggers invitation
    });

    if (error) throw error;

    res.status(200).json({ user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}