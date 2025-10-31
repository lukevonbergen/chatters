// /api/admin/create-user.js
const { createClient } = require('@supabase/supabase-js');
const { requireAdminRole } = require('../auth-helper');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAdminRole(req);
    const { email, password, role, accountId } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email,
      role,
      account_id: accountId || null
    });

    if (userError) throw userError;

    return res.status(200).json({ success: true, user: authData.user });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: error.message });
  }
};
