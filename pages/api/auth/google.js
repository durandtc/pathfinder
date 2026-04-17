import { supabaseAdmin } from '../../../lib/supabase'
import { signToken } from '../../../lib/auth'

// Called after Firebase Google sign-in succeeds on the frontend.
// We receive the Firebase user details, upsert the user in our own DB,
// and return our own JWT cookie — same session system as email/password.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { uid, email, displayName, photoURL } = req.body
  if (!uid || !email) return res.status(400).json({ error: 'uid and email required' })

  const db = supabaseAdmin()

  // Check if user already exists (by google_uid or email)
  let { data: user } = await db
    .from('users')
    .select('*')
    .or(`google_uid.eq.${uid},email.eq.${email}`)
    .maybeSingle()

  if (!user) {
    // First time — create a new user record
    const { data: newUser, error } = await db.from('users').insert({
      full_name:     displayName || email.split('@')[0],
      email,
      auth_provider: 'google',
      google_uid:    uid,
      last_login:    new Date().toISOString(),
    }).select().single()

    if (error) return res.status(500).json({ error: 'Could not create user account.' })
    user = newUser
  } else {
    // Returning user — update last login and link google_uid if not set
    await db.from('users').update({
      google_uid: uid,
      auth_provider: user.auth_provider || 'google',
      last_login: new Date().toISOString(),
    }).eq('id', user.id)
  }

  // Check payment status
  const { data: payment } = await db
    .from('payments')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .maybeSingle()

  // Issue our own JWT (same as email login)
  const token = signToken({ userId: user.id, email: user.email, isAdmin: false })
  res.setHeader('Set-Cookie', `pf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`)

  return res.status(200).json({
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      photoURL: photoURL || null,
      hasCompletedPayment: !!payment,
    },
  })
}
