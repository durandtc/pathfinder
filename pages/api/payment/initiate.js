import { supabaseAdmin } from '../../../lib/supabase'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const db = supabaseAdmin()

  // Get config values
  const { data: cfgRows } = await db.from('system_config').select('key_name, plain_value')
  const cfg = {}
  cfgRows?.forEach(r => { cfg[r.key_name] = r.plain_value })

  const sandbox    = cfg.payfast_sandbox !== 'false'
  const priceExVat = parseFloat(cfg.assessment_price_zar || process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399')
  const vatRate    = parseFloat(cfg.vat_rate_pct || process.env.NEXT_PUBLIC_VAT_RATE || '15')
  const totalAmount = (priceExVat * (1 + vatRate / 100)).toFixed(2)

  // Get user
  const { data: user } = await db.from('users').select('*').eq('id', userId).single()
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Check if already paid
  const { data: existingPayment } = await db.from('payments').select('id').eq('user_id', userId).eq('status', 'completed').maybeSingle()
  if (existingPayment) return res.status(200).json({ sandbox: true, message: 'Already paid' })

  // Create pending payment record
  const { data: payment } = await db.from('payments').insert({
    user_id: userId,
    amount_zar: totalAmount,
    status: 'pending',
  }).select().single()

  if (sandbox) {
    // In sandbox mode: mark payment as complete immediately and create assessment
    await db.from('payments').update({ status: 'completed', paid_at: new Date().toISOString(), payfast_payment_id: 'SANDBOX-' + payment.id }).eq('id', payment.id)

    // Create assessment record
    await db.from('assessments').insert({ user_id: userId, payment_id: payment.id, status: 'not_started' })

    await db.from('audit_log').insert({ action: 'Sandbox payment completed', details: `User ${user.email} · R${totalAmount}`, performed_by: 'system' })

    return res.status(200).json({ sandbox: true })
  }

  // Live PayFast redirect
  const merchantId  = cfg.payfast_merchant_id  || process.env.PAYFAST_MERCHANT_ID
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY
  const passphrase  = cfg.payfast_passphrase   || process.env.PAYFAST_PASSPHRASE
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.co.za'

  const data = {
    merchant_id:    merchantId,
    merchant_key:   merchantKey,
    return_url:     `${appUrl}/payment/success`,
    cancel_url:     `${appUrl}/payment`,
    notify_url:     `${appUrl}/api/payment/notify`,
    name_first:     user.full_name.split(' ')[0],
    name_last:      user.full_name.split(' ').slice(1).join(' ') || 'Student',
    email_address:  user.email,
    m_payment_id:   payment.id,
    amount:         totalAmount,
    item_name:      'PathFinder SA Career Assessment',
    custom_str1:    userId,
  }

  // Generate PayFast signature
  const paramString = Object.entries(data).map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`).join('&')
  const signatureString = passphrase ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}` : paramString
  data.signature = crypto.createHash('md5').update(signatureString).digest('hex')

  const paymentUrl = `https://www.payfast.co.za/eng/process?${Object.entries(data).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}`

  return res.status(200).json({ sandbox: false, paymentUrl })
}
