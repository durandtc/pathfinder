import { supabaseAdmin } from '../../../lib/supabase'
import { generateToken, resetTokenExpiry } from '../../../lib/tokens'
import { sendPasswordResetEmail } from '../../../lib/sendEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const db = supabaseAdmin()
  const { data: user } = await db.from('users').select('*').eq('email', email).maybeSingle()

  // Always return success — never confirm whether an email is registered (security best practice)
  if (!user || user.auth_provider === 'google') {
    return res.status(200).json({ ok: true })
  }

  const resetToken = generateToken()
  await db.from('users').update({
    reset_token:        resetToken,
    reset_token_expiry: resetTokenExpiry(),
  }).eq('id', user.id)

  try {
    await sendPasswordResetEmail({ toEmail: user.email, toName: user.full_name, token: resetToken })
  } catch (err) {
    console.error('Reset email failed:', err.message)
  }

  await db.from('audit_log').insert({ action: 'Password reset requested', details: user.email, performed_by: 'system' })
  return res.status(200).json({ ok: true })
}
