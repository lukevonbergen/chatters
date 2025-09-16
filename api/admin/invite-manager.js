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

  console.log('📥 Invite manager request:', { email, firstName, lastName, venueId, venueIds, accountId });

  if (!email || !firstName || !lastName || !accountId || (!venueId && !venueIds)) {
    console.error('❌ Missing required fields:', { email: !!email, firstName: !!firstName, lastName: !!lastName, accountId: !!accountId, venueId: !!venueId, venueIds: !!venueIds });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Handle multiple venues if venueIds is provided
    if (venueIds && Array.isArray(venueIds)) {
      console.log('🏢 Processing multiple venues:', venueIds);
      
      // Check if user already exists
      const { data: existingUser, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('❌ Error listing users:', listError);
        throw listError;
      }
      
      const userExists = existingUser.users.some(user => user.email === email);
      console.log('👤 User exists:', userExists);
      
      let authUserId;
      
      if (!userExists) {
        console.log('➕ Creating new user');
        // Create the user only once
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email,
          user_metadata: { firstName, lastName, invited_by_admin: true },
        });
        if (createError) {
          console.error('❌ Error creating user:', createError);
          throw createError;
        }
        
        authUserId = userData.user.id;
        
        // Send invitation email with redirect to set-password page
        console.log('📧 Sending invitation email');
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: 'https://my.getchatters.com/set-password'
        });
        if (inviteError) {
          console.error('❌ Error sending invite:', inviteError);
          throw inviteError;
        }
        
        // Create user record
        console.log('👤 Creating user record');
        const { error: userInsertError } = await supabase.from('users').insert([
          {
            id: authUserId,
            email,
            role: 'manager',
            account_id: accountId,
          },
        ]);
        if (userInsertError) {
          console.error('❌ Error creating user record:', userInsertError);
          throw userInsertError;
        }
      } else {
        // Get existing user ID
        console.log('👤 Using existing user');
        const existingUserData = existingUser.users.find(user => user.email === email);
        authUserId = existingUserData.id;
        
        // Ensure user record exists in public.users table
        console.log('🔍 Checking if user record exists in public.users');
        const { data: existingPublicUser, error: publicUserError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUserId)
          .single();
          
        if (publicUserError || !existingPublicUser) {
          console.log('➕ Creating missing public.users record for existing auth user');
          const { error: userInsertError } = await supabase.from('users').insert([
            {
              id: authUserId,
              email,
              role: 'manager',
              account_id: accountId,
            },
          ]);
          if (userInsertError) {
            console.error('❌ Error creating public user record:', userInsertError);
            throw userInsertError;
          }
        }
      }
      
      // Check existing staff assignments
      console.log('🔍 Checking existing staff assignments for user:', authUserId);
      const { data: existingStaff, error: staffQueryError } = await supabase
        .from('staff')
        .select('venue_id')
        .eq('user_id', authUserId);
        
      if (staffQueryError) {
        console.error('❌ Error querying staff:', staffQueryError);
        throw staffQueryError;
      }
      
      const existingVenueIds = existingStaff ? existingStaff.map(s => s.venue_id) : [];
      console.log('📍 Existing venue assignments:', existingVenueIds);
      
      // Only insert staff records for new venues
      const newVenueIds = venueIds.filter(vId => !existingVenueIds.includes(vId));
      console.log('➕ New venue assignments needed:', newVenueIds);
      
      if (newVenueIds.length > 0) {
        const staffRecords = newVenueIds.map(vId => ({
          user_id: authUserId,
          venue_id: vId,
          role: 'manager'
        }));
        
        // Verify user record exists before creating staff assignments (with retry)
        console.log('🔍 Verifying user record exists in public.users table');
        let userCheck = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!userCheck && attempts < maxAttempts) {
          attempts++;
          console.log(`🔄 Attempt ${attempts}/${maxAttempts} to find user record`);
          
          const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', authUserId)
            .single();
            
          if (!error && data) {
            userCheck = data;
            break;
          }
          
          if (attempts < maxAttempts) {
            console.log('⏳ User record not found, waiting 1 second before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
          
        if (!userCheck) {
          console.error('❌ User record not found in public.users table after retries');
          throw new Error('User record not found. Cannot create staff assignments.');
        }
        
        console.log('✅ User record confirmed in public.users table');
        
        console.log('💼 Creating staff records:', staffRecords);
        const { error: staffInsertError } = await supabase.from('staff').insert(staffRecords);
        if (staffInsertError) {
          console.error('❌ Error creating staff records:', staffInsertError);
          throw staffInsertError;
        }
        console.log('✅ Staff records created successfully');
      } else {
        console.log('ℹ️ No new staff assignments needed');
      }
      
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

    // Send invitation email with redirect to set-password page
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://my.getchatters.com/set-password'
    });
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

    // Check if staff assignment already exists
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', authUserId)
      .eq('venue_id', venueId)
      .single();

    // Only insert if staff assignment doesn't exist
    if (!existingStaff) {
      // Verify user record exists before creating staff assignment (with retry)
      console.log('🔍 Verifying user record exists in public.users table');
      let userCheck = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!userCheck && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts} to find user record`);
        
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUserId)
          .single();
          
        if (!error && data) {
          userCheck = data;
          break;
        }
        
        if (attempts < maxAttempts) {
          console.log('⏳ User record not found, waiting 1 second before retry...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
        
      if (!userCheck) {
        console.error('❌ User record not found in public.users table after retries');
        throw new Error('User record not found. Cannot create staff assignment.');
      }
      
      console.log('✅ User record confirmed in public.users table');
      
      const { error: staffInsertError } = await supabase.from('staff').insert([
        {
          user_id: authUserId,
          venue_id: venueId,
          role: 'manager'
        },
      ]);
      if (staffInsertError) throw staffInsertError;
    }

    return res.status(200).json({ success: true, userId: authUserId });
  } catch (err) {
    console.error('🔥 Error inviting manager:', err);
    return res.status(500).json({ error: err.message });
  }
}