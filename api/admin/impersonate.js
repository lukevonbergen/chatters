const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  try {
    // Verify the requesting user is a Chatters admin
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.email?.endsWith('@getchatters.com')) {
      return res.status(403).json({ error: 'Only Chatters admins can impersonate' });
    }

    // Get venues for the impersonated account using service role (bypasses RLS)
    const { data: venues, error: venueError } = await supabase
      .from('venues')
      .select('id, name')
      .eq('account_id', accountId)
      .order('name');

    if (venueError) {
      console.error('Error fetching venues:', venueError);
      return res.status(500).json({ error: 'Failed to fetch venues' });
    }

    return res.status(200).json({ venues });
  } catch (error) {
    console.error('Impersonation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
