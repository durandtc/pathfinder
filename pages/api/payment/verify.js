import { supabaseAdmin } from '../../../lib/supabase'
import crypto from 'crypto'

function verifyPayFastSignature(data, signature) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || null
  const str = Object.entries(data)
    .filter(([k, v]) => k !== 'signature' && v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&')
  const hashStr = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : str
  const expectedSignature = crypto.createHash('md5').update(hashStr).digest('hex')
  return signature === expectedSignature
}

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

    if (payment.payfast_payment_id?.startsWith('SANDBOX')) {
      return res.status(200).json({ verified: payment.status === 'completed' })
    }

    return res.status(200).json({ verified: false })
  }

  // POST: PayFast ITN (Instant Transaction Notification) callback
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY
  const merchantId = process.env.PAYFAST_MERCHANT_ID

  if (!merchantKey || !merchantId) {
    return res.status(500).json({ error: 'PayFast credentials not configured' })
  }

  const itnData = req.body

  if (!verifyPayFastSignature(itnData, itnData.signature)) {
    // Log the computed signature vs received for diagnosis
    const passphrase = process.env.PAYFAST_PASSPHRASE || null
    const debugStr = Object.entries(itnData)
      .filter(([k, v]) => k !== 'signature' && v !== null && v !== undefined && v !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
      .join('&')
    const debugHashStr = passphrase ? `${debugStr}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : debugStr
    const crypto2 = require('crypto')
    const computedSig = crypto2.createHash('md5').update(debugHashStr).digest('hex')
    await db.from('audit_log').insert({
      action: 'PayFast ITN signature verification failed',
      details: `Payment ${itnData.m_payment_id} | received=${itnData.signature} | computed=${computedSig} | passphrase_set=${!!passphrase} | fields=${Object.keys(itnData).join(',')}`,
      performed_by: 'system',
    })
    return res.status(200).end()
  }

  if (itnData.merchant_id !== merchantId) {
    await db.from('audit_log').insert({
      action: 'PayFast ITN merchant ID mismatch',
      details: `Expected ${merchantId}, got ${itnData.merchant_id}`,
      performed_by: 'system',
    })
    return res.status(200).end()
  }

  const paymentId = itnData.m_payment_id
  const { data: payment } = await db.from('payments').select('*').eq('id', paymentId).single()

  if (!payment) {
    await db.from('audit_log').insert({
      action: 'PayFast ITN payment not found',
      details: `Payment ${paymentId} not found in database`,
      performed_by: 'system',
    })
    return res.status(200).end()
  }

  if (itnData.payment_status === 'COMPLETE') {
    await db.from('payments').update({
      status: 'completed',
      paid_at: new Date().toISOString(),
      payfast_payment_id: itnData.pf_payment_id,
    }).eq('id', paymentId)

    const { data: existingAssessment } = await db.from('assessments')
      .select('*')
      .eq('payment_id', paymentId)
      .single()

    if (!existingAssessment) {
      await db.from('assessments').insert({
        user_id: payment.user_id,
        payment_id: paymentId,
        status: 'not_started',
      })
    }

    await db.from('audit_log').insert({
      action: 'PayFast payment completed',
      details: `Payment ${paymentId} · PF ID ${itnData.pf_payment_id} · R${itnData.amount_gross}`,
      performed_by: 'system',
    })
  } else if (itnData.payment_status === 'FAILED') {
    await db.from('payments').update({ status: 'failed' }).eq('id', paymentId)
    await db.from('audit_log').insert({
      action: 'PayFast payment failed',
      details: `Payment ${paymentId}`,
      performed_by: 'system',
    })
  }

  return res.status(200).end()
}
