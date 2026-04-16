import { supabaseAdmin } from '../../../lib/supabase'
import { sendPaymentConfirmationEmail } from '../../../lib/sendEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { payment_status, m_payment_id, custom_str1: userId, amount_gross } = req.body

  if (payment_status !== 'COMPLETE') return res.status(200).end()

  const db = supabaseAdmin()

  // Update payment record
  await db.from('payments').update({
    status: 'completed',
    paid_at: new Date().toISOString(),
    payfast_payment_id: req.body.pf_payment_id || m_payment_id,
  }).eq('id', m_payment_id)

  // Create assessment record
  await db.from('assessments').insert({ user_id: userId, payment_id: m_payment_id, status: 'not_started' })

  // Send confirmation email
  const { data: user } = await db.from('users').select('*').eq('id', userId).single()
  if (user) {
    try {
      await sendPaymentConfirmationEmail({ toEmail: user.email, toName: user.full_name, amount: amount_gross })
    } catch {}
  }

  await db.from('audit_log').insert({ action: 'PayFast payment received', details: `User ${user?.email} · R${amount_gross}`, performed_by: 'system' })

  return res.status(200).end()
}
