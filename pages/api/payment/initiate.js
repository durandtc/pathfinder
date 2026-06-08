import { supabaseAdmin } from '../../../lib/supabase'
import crypto from 'crypto'

function generatePayFastSignature(data, passphrase = null) {
  // PayFast requires fields in INSERTION ORDER — alphabetical ordering causes signature mismatch
  // See PayFast docs: "Do not use the API signature format, which uses alphabetical ordering!"
  const str = Object.entries(data)
    .filter(([k, v]) => k !== 'signature' && v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&')
  const hashStr = passphrase
    ? `${str}&passphrase=${encodeURIComponent(String(passphrase).trim()).replace(/%20/g, '+')}`
    : str
  console.log('[PayFast] Hashing string:', hashStr)
  return crypto.createHash('md5').update(hashStr).digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, couponCode, finalAmount } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const db = supabaseAdmin()

  const sandbox     = process.env.PAYFAST_SANDBOX === 'true'
  const merchantId  = process.env.PAYFAST_MERCHANT_ID
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY
  const priceExVat  = parseFloat(process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399')
  const vatRate     = parseFloat(process.env.NEXT_PUBLIC_VAT_RATE || '15')
  const defaultTotal = (priceExVat * (1 + vatRate / 100)).toFixed(2)
  const totalAmount = finalAmount ? parseFloat(finalAmount).toFixed(2) : defaultTotal
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.co.za'

  const { data: user } = await db.from('users').select('*').eq('id', userId).single()
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Validate coupon if provided
  if (couponCode) {
    const { data: coupon } = await db
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' })
    }

    // Check usage limit
    if (coupon.code_number > 0) {
      const { count: usedCount } = await db
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_code', couponCode)
        .eq('status', 'completed')

      if (usedCount >= coupon.code_number) {
        return res.status(400).json({ error: 'Coupon code usage limit reached' })
      }
    }
  }

  const { data: payment } = await db.from('payments').insert({
    user_id: userId,
    amount_zar: totalAmount,
    coupon_code: couponCode || null,
    status: 'pending',
  }).select().single()

  if (sandbox) {
    await db.from('payments').update({
      status: 'completed', paid_at: new Date().toISOString(),
      payfast_payment_id: 'SANDBOX-' + payment.id,
    }).eq('id', payment.id)

    await db.from('assessments').insert({ user_id: userId, payment_id: payment.id, status: 'not_started' })
    await db.from('audit_log').insert({ action: 'PayFast sandbox payment completed', details: `User ${user.email} · R${totalAmount}`, performed_by: 'system' })
    return res.status(200).json({ sandbox: true })
  }

  if (!merchantId || !merchantKey) {
    return res.status(500).json({ error: 'PayFast credentials not configured. Set payfast_merchant_id and payfast_merchant_key in system_config.' })
  }

  const payFastUrl = 'https://www.payfast.co.za/eng/process'
  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${appUrl}/payment/success?payment_id=${payment.id}`,
    cancel_url: `${appUrl}/payment`,
    notify_url: `${appUrl}/api/payment/verify`,
    name_first: user.full_name?.split(' ')[0] || 'Customer',
    name_last: user.full_name?.split(' ').slice(1).join(' ') || '',
    email_address: user.email,
    m_payment_id: payment.id,
    amount: totalAmount,
    item_name: 'PickMyPath Career Assessment',
    item_description: 'Grade 9 Career Guidance Assessment',
    custom_str1: user.id,
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE || null
  paymentData.signature = generatePayFastSignature(paymentData, passphrase)

  console.log('[PayFast Initiate] Signature Debug:')
  console.log('  passphrase_set:', !!passphrase)
  console.log('  passphrase_length:', passphrase?.length || 0)
  console.log('  passphrase_value:', passphrase ? `"${passphrase}"` : 'null')
  console.log('  passphrase_bytes:', passphrase ? [...passphrase].map(c => c.charCodeAt(0)) : 'null')
  console.log('  merchant_id:', merchantId)
  console.log('  generated_signature:', paymentData.signature)
  console.log('  payment_data_keys:', Object.keys(paymentData).sort())

  await db.from('payments').update({ payfast_payment_id: 'PENDING' }).eq('id', payment.id)
  return res.status(200).json({ sandbox: false, paymentUrl: payFastUrl, paymentData })
}
