import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, firstName, lastName, venueName, trialEndsAt } = req.body

  if (!email || !firstName || !lastName || !venueName) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  try {
    // 1. Create Supabase Auth user (sends invite)
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { firstName, lastName, invited_by_admin: true }
    })

    if (authError) throw authError
    const userId = userData.user.id

    // 2. Create venue record with trial period
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .insert([{
        id: userId,  // this will match the auth UID if you want direct linking
        name: venueName,
        email,
        first_name: firstName,
        last_name: lastName,
        is_paid: false,
        trial_ends_at: new Date(trialEndsAt)
      }])
      .select()
      .single()

    if (venueError) throw venueError

    return res.status(200).json({ success: true, user: userData.user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
