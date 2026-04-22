import { supabaseAdmin } from '../../../lib/supabase'
import { generateToken, verifyTokenExpiry } from '../../../lib/tokens'
import { sendVerificationEmail } from '../../../lib/sendEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const db = supabaseAdmin()
  const { data: user } = await db.from('users').select('*').eq('email', email).maybeSingle()
  if (!user) return res.status(200).json({ ok: true }) // don't reveal if email exists

  if (user.email_verified) return res.status(200).json({ ok: true, alreadyVerified: true })

  const verifyToken = generateToken()
  await db.from('users').update({ verify_token: verifyToken, verify_token_expiry: verifyTokenExpiry() }).eq('id', user.id)

  try {
    await sendVerificationEmail({ toEmail: user.email, toName: user.full_name, token: verifyToken })
  } catch {}

  return res.status(200).json({ ok: true })
}
