// /api/auth-helper.js
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function authenticateAdmin(req) {
  // Extract JWT token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing authorization token');
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify user with regular client (not service role)
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid authorization token');
  }

  // Check user permissions using RLS-protected query
  const { data: userData, error: userError } = await supabaseClient
    .from('users')
    .select('id, role, account_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  return userData;
}

export async function requireMasterRole(req) {
  const userData = await authenticateAdmin(req);
  
  if (userData.role !== 'master') {
    throw new Error('Insufficient permissions. Master role required.');
  }

  return userData;
}

export async function requireAdminRole(req) {
  const userData = await authenticateAdmin(req);
  
  if (!['admin', 'master'].includes(userData.role)) {
    throw new Error('Insufficient permissions. Admin role required.');
  }

  return userData;
}