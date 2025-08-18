// /api/admin/get-pending-invitations.js
import { createClient } from '@supabase/supabase-js';
import { requireMasterRole } from '../auth-helper';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate and authorize user
    const userData = await requireMasterRole(req);
  } catch (authError) {
    const status = authError.message.includes('Missing authorization') ? 401 :
                   authError.message.includes('Invalid authorization') ? 401 :
                   authError.message.includes('Insufficient permissions') ? 403 : 500;
    return res.status(status).json({ error: authError.message });
  }

  try {

    // Now use service role for admin operations, but scoped to user's account
    // Get all users from Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    // Get users from our database - only managers in same account
    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, created_at')
      .eq('role', 'manager')
      .eq('account_id', userData.account_id); // Scope to user's account
    
    if (dbError) throw dbError;

    // Get staff records to get names and venue assignments - only for user's account venues
    const { data: staffRecords, error: staffError } = await supabaseAdmin
      .from('staff')
      .select(`
        user_id, 
        first_name, 
        last_name, 
        email, 
        venue_id, 
        created_at,
        venues:venue_id (
          id,
          name,
          account_id
        )
      `)
      .eq('venues.account_id', userData.account_id); // Filter to user's account venues
    
    if (staffError) throw staffError;

    const pendingInvitations = [];
    const activeManagers = [];

    // Process each database user
    dbUsers.forEach(dbUser => {
      const authUser = users.find(u => u.id === dbUser.id);
      const userStaffRecords = staffRecords.filter(s => s.user_id === dbUser.id);
      
      if (!authUser || userStaffRecords.length === 0) return;

      const managerData = {
        id: dbUser.id,
        email: dbUser.email,
        first_name: userStaffRecords[0]?.first_name || '',
        last_name: userStaffRecords[0]?.last_name || '',
        created_at: dbUser.created_at,
        venues: userStaffRecords.map(s => s.venues?.name).filter(Boolean),
        venue_ids: userStaffRecords.map(s => s.venue_id),
        invited_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at
      };

      // Check if user has confirmed their email (accepted invitation)
      if (authUser.email_confirmed_at) {
        activeManagers.push({
          ...managerData,
          status: 'active',
          confirmed_at: authUser.email_confirmed_at
        });
      } else {
        pendingInvitations.push({
          ...managerData,
          status: 'pending',
          expires_at: null // Supabase invitations don't have visible expiry
        });
      }
    });

    return res.status(200).json({
      success: true,
      pendingInvitations,
      activeManagers
    });

  } catch (err) {
    console.error('🔥 Error fetching invitations:', err);
    return res.status(500).json({ error: err.message });
  }
}