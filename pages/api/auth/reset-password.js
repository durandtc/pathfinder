import { supabaseAdmin } from '../../../lib/supabase'
import { hashPassword } from '../../../lib/auth'
import { isTokenValid } from '../../../lib/tokens'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token and new password required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  const db = supabaseAdmin()
  const { data: user } = await db.from('users').select('*').eq('reset_token', token).maybeSingle()

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset link.' })
  if (!isTokenValid(user.reset_token_expiry)) return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' })

  await db.from('users').update({
    password_hash:       hashPassword(password),
    reset_token:         null,
    reset_token_expiry:  null,
  }).eq('id', user.id)

  await db.from('audit_log').insert({ action: 'Password reset completed', details: user.email, performed_by: 'system' })
  return res.status(200).json({ ok: true })
}
