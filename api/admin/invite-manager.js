// /api/admin/invite-manager.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, venueId, accountId } = req.body;

  if (!email || !firstName || !lastName || !venueId || !accountId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: { firstName, lastName, invited_by_admin: true },
    });
    if (createError) throw createError;

    const authUserId = userData.user.id;

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) throw inviteError;

    const { error: userInsertError } = await supabase.from('users').insert([
      {
        id: authUserId,
        email,
        role: 'manager',
        account_id: accountId,
        venue_id: venueId,
      },
    ]);
    if (userInsertError) throw userInsertError;

    const { error: staffInsertError } = await supabase.from('staff').insert([
      {
        first_name: firstName,
        last_name: lastName,
        user_id: authUserId,
        venue_id: venueId,
        role: 'manager',
      },
    ]);
    if (staffInsertError) throw staffInsertError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🔥 Error inviting manager:', err);
    return res.status(500).json({ error: err.message });
  }
}
