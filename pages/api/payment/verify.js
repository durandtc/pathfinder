import { supabaseAdmin } from '../../../lib/supabase'

// Called when Yoco redirects back after a live payment
// Also handles Yoco webhook notifications
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end()

  const db = supabaseAdmin()

  // GET: called from payment/success page to verify a specific payment_id
  if (req.method === 'GET') {
    const { payment_id } = req.query
    if (!payment_id) return res.status(400).json({ error: 'payment_id required' })

    const { data: payment } = await db.from('payments').select('*').eq('id', payment_id).single()
    if (!payment) return res.status(404).json({ error: 'Payment not found' })

    if (payment.status === 'completed') {
      return res.status(200).json({ verified: true, userId: payment.user_id })
    }

    // Try to verify with Yoco using the stored checkout ID
    const checkoutId = payment.payfast_payment_id
    if (!checkoutId || checkoutId.startsWith('SANDBOX')) {
      return res.status(200).json({ verified: payment.status === 'completed' })
    }

    const yocoRes = await fetch(`https://payments.yoco.com/api/checkouts/${checkoutId}`, {
      headers: { 'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}` },
    })

    if (!yocoRes.ok) return res.status(200).json({ verified: false })

    const yocoData = await yocoRes.json()

    if (yocoData.status === 'successful') {
      await db.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() }).eq('id', payment_id)
      await db.from('assessments').insert({ user_id: payment.user_id, payment_id, status: 'not_started' })
      await db.from('audit_log').insert({ action: 'Yoco payment verified', details: `Payment ${payment_id}`, performed_by: 'system' })
      return res.status(200).json({ verified: true, userId: payment.user_id })
    }

    return res.status(200).json({ verified: false, status: yocoData.status })
  }

  // POST: Yoco webhook
  const { id: checkoutId, status, metadata } = req.body
  if (status !== 'successful' || !metadata?.payment_id) return res.status(200).end()

  await db.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() }).eq('id', metadata.payment_id)
  await db.from('assessments').insert({ user_id: metadata.user_id, payment_id: metadata.payment_id, status: 'not_started' })
  await db.from('audit_log').insert({ action: 'Yoco webhook received', details: `Payment ${metadata.payment_id}`, performed_by: 'system' })

  return res.status(200).end()
}
