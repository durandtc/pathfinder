import { supabaseAdmin } from '../../../lib/supabase'
import { comparePassword, signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const db = supabaseAdmin()
  const { data: user } = await db.from('users').select('*').eq('email', email).single()
  if (!user) return res.status(401).json({ error: 'No account found with that email address.' })

  const valid = comparePassword(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Incorrect password.' })

  // Update last login
  await db.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id)

  // Check if user has a completed payment
  const { data: payment } = await db.from('payments').select('id').eq('user_id', user.id).eq('status', 'completed').maybeSingle()

  const token = signToken({ userId: user.id, email: user.email, isAdmin: false })
  res.setHeader('Set-Cookie', `pf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`)

  return res.status(200).json({
    user: { id: user.id, fullName: user.full_name, email: user.email, hasCompletedPayment: !!payment },
  })
}
