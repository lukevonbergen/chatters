// /api/admin/revoke-invitation.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, userId, deleteAccount = false } = req.body;

  if (!email && !userId) {
    return res.status(400).json({ error: 'Email or userId is required' });
  }

  try {
    let targetUserId = userId;
    
    // If only email provided, find the user ID
    if (!targetUserId && email) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      targetUserId = user.id;
    }

    if (deleteAccount) {
      // Complete account deletion - removes everything
      
      // 1. Delete from staff table
      const { error: staffError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', targetUserId);
      
      if (staffError) throw staffError;

      // 2. Delete from users table  
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .eq('id', targetUserId);
      
      if (usersError) throw usersError;

      // 3. Delete from Supabase Auth (this invalidates any pending invitations)
      const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId);
      if (authError) throw authError;

      return res.status(200).json({ 
        success: true, 
        message: 'Account deleted completely',
        action: 'deleted'
      });

    } else {
      // Just revoke access - remove from staff table only
      const { error: staffError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', targetUserId);
      
      if (staffError) throw staffError;

      return res.status(200).json({ 
        success: true, 
        message: 'Access revoked successfully',
        action: 'revoked'
      });
    }

  } catch (err) {
    console.error('🔥 Error revoking invitation/access:', err);
    return res.status(500).json({ error: err.message });
  }
}