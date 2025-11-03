// /api/admin/recover-manager.js
const { createClient } = require('@supabase/supabase-js');
const { requireMasterRole } = require('../auth-helper');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await requireMasterRole(req);
    const { managerId } = req.body;

    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    // Verify the manager is soft-deleted and belongs to the same account
    const { data: manager, error: managerError } = await supabaseAdmin
      .from('users')
      .select('id, email, account_id, role, deleted_at')
      .eq('id', managerId)
      .eq('account_id', userData.account_id)
      .eq('role', 'manager')
      .not('deleted_at', 'is', null)
      .single();

    if (managerError || !manager) {
      return res.status(404).json({ error: 'Deleted manager not found' });
    }

    // Check if within 14-day recovery window
    const deletedDate = new Date(manager.deleted_at);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    if (deletedDate < fourteenDaysAgo) {
      return res.status(400).json({
        error: 'Recovery period expired. Manager was deleted more than 14 days ago.'
      });
    }

    // Recover the manager (set deleted_at and deleted_by back to NULL)
    const { error: recoverError } = await supabaseAdmin
      .from('users')
      .update({
        deleted_at: null,
        deleted_by: null
      })
      .eq('id', managerId);

    if (recoverError) {
      console.error('Error recovering manager:', recoverError);
      return res.status(500).json({ error: 'Failed to recover manager' });
    }

    console.log(`Manager ${manager.email} recovered by ${userData.id}`);

    return res.status(200).json({
      success: true,
      message: `Manager ${manager.email} has been successfully recovered.`
    });

  } catch (error) {
    console.error('Recover manager error:', error);
    return res.status(500).json({ error: error.message });
  }
};
