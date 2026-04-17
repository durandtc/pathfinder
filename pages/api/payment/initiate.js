import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const db = supabaseAdmin()

  const { data: cfgRows } = await db.from('system_config').select('key_name, plain_value')
  const cfg = {}
  cfgRows?.forEach(r => { cfg[r.key_name] = r.plain_value })

  const sandbox     = cfg.payfast_sandbox !== 'false'
  const priceExVat  = parseFloat(cfg.assessment_price_zar || process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399')
  const vatRate     = parseFloat(cfg.vat_rate_pct || process.env.NEXT_PUBLIC_VAT_RATE || '15')
  const totalAmount = (priceExVat * (1 + vatRate / 100)).toFixed(2)

  const { data: user } = await db.from('users').select('*').eq('id', userId).single()
  if (!user) return res.status(404).json({ error: 'User not found' })

  const { data: payment } = await db.from('payments').insert({
    user_id: userId, amount_zar: totalAmount, status: 'pending',
  }).select().single()

  if (sandbox) {
    await db.from('payments').update({
      status: 'completed', paid_at: new Date().toISOString(),
      payfast_payment_id: 'SANDBOX-' + payment.id,
    }).eq('id', payment.id)

    await db.from('assessments').insert({ user_id: userId, payment_id: payment.id, status: 'not_started' })
    await db.from('audit_log').insert({ action: 'Sandbox payment completed', details: `User ${user.email} · R${totalAmount}`, performed_by: 'system' })
    return res.status(200).json({ sandbox: true })
  }

  // Live Yoco payment
  const yocoSecretKey = process.env.YOCO_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.co.za'

  if (!yocoSecretKey) {
    return res.status(500).json({ error: 'YOCO_SECRET_KEY not configured in environment variables.' })
  }

  const yocoRes = await fetch('https://payments.yoco.com/api/checkouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${yocoSecretKey}` },
    body: JSON.stringify({
      amount: Math.round(parseFloat(totalAmount) * 100),
      currency: 'ZAR',
      cancelUrl:  `${appUrl}/payment`,
      successUrl: `${appUrl}/payment/success?payment_id=${payment.id}`,
      metadata: { payment_id: payment.id, user_id: userId, user_email: user.email },
    }),
  })

  const yocoData = await yocoRes.json()
  if (!yocoRes.ok) return res.status(500).json({ error: `Yoco error: ${yocoData.message || 'Unknown'}` })

  await db.from('payments').update({ payfast_payment_id: yocoData.id }).eq('id', payment.id)
  return res.status(200).json({ sandbox: false, paymentUrl: yocoData.redirectUrl })
}
