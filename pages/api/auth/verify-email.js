import { supabaseAdmin } from '../../../lib/supabase'
import { isTokenValid } from '../../../lib/tokens'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token required' })

  const db = supabaseAdmin()
  const { data: user } = await db.from('users').select('*').eq('verify_token', token).maybeSingle()

  if (!user) return res.status(400).json({ error: 'Invalid verification link.' })
  if (!isTokenValid(user.verify_token_expiry)) return res.status(400).json({ error: 'This verification link has expired. Please request a new one.' })

  await db.from('users').update({
    email_verified:      true,
    verify_token:        null,
    verify_token_expiry: null,
  }).eq('id', user.id)

  await db.from('audit_log').insert({ action: 'Email verified', details: user.email, performed_by: 'system' })

  return res.status(200).json({ ok: true })
}
