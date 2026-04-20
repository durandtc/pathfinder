import { supabaseAdmin } from '../../../lib/supabase'
import { hashPassword, signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { fullName, email, password, grade, school } = req.body
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  const db = supabaseAdmin()

  // Check if email already registered
  const { data: existing } = await db.from('users').select('id').eq('email', email).single()
  if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' })

  const passwordHash = hashPassword(password)

  const { data: user, error } = await db.from('users').insert({
    full_name: fullName,
    email,
    password_hash: passwordHash,
    auth_provider: 'email',
    grade: grade || null,
    school: school || null,
  }).select().single()

  if (error) return res.status(500).json({ error: 'Could not create account. Please try again.' })

  const token = signToken({ userId: user.id, email: user.email, isAdmin: false })

  res.setHeader('Set-Cookie', `pf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`)

  return res.status(201).json({
    user: { id: user.id, fullName: user.full_name, email: user.email, hasCompletedPayment: false },
  })
}
