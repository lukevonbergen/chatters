// Updated /api/admin/invite-manager.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, venueId, venueIds, accountId, isFirstVenue } = req.body;

  if (!email || !firstName || !lastName || !accountId || (!venueId && !venueIds)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Handle multiple venues if venueIds is provided
    if (venueIds && Array.isArray(venueIds)) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser.users.some(user => user.email === email);
      
      let authUserId;
      
      if (!userExists) {
        // Create the user only once
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email,
          user_metadata: { firstName, lastName, invited_by_admin: true },
        });
        if (createError) throw createError;
        
        authUserId = userData.user.id;
        
        // Send invitation email
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
        if (inviteError) throw inviteError;
        
        // Create user record
        const { error: userInsertError } = await supabase.from('users').insert([
          {
            id: authUserId,
            email,
            role: 'manager',
            account_id: accountId,
          },
        ]);
        if (userInsertError) throw userInsertError;
      } else {
        // Get existing user ID
        const existingUserData = existingUser.users.find(user => user.email === email);
        authUserId = existingUserData.id;
      }
      
      // Create staff records for all venues
      const staffRecords = venueIds.map(vId => ({
        first_name: firstName,
        last_name: lastName,
        user_id: authUserId,
        venue_id: vId,
        role: 'manager',
        email: email
      }));
      
      const { error: staffInsertError } = await supabase.from('staff').insert(staffRecords);
      if (staffInsertError) throw staffInsertError;
      
      return res.status(200).json({ success: true, userId: authUserId });
    }
    
    // Original single venue logic (backward compatibility)
    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required for single venue assignment' });
    }

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
        email: email
      },
    ]);
    if (staffInsertError) throw staffInsertError;

    return res.status(200).json({ success: true, userId: authUserId });
  } catch (err) {
    console.error('🔥 Error inviting manager:', err);
    return res.status(500).json({ error: err.message });
  }
}