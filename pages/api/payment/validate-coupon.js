import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'code required' })

  const db = supabaseAdmin()

  // Fetch the coupon
  const { data: coupon } = await db
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) {
    return res.status(400).json({ error: 'The coupon code you entered is no longer valid or has expired' })
  }

  // Check if coupon has available uses
  if (coupon.code_number > 0) {
    // code_number is the max uses; we need to count how many times it's been used
    const { count: usedCount } = await db
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_code', code.toUpperCase())
      .eq('status', 'completed')

    if (usedCount >= coupon.code_number) {
      return res.status(400).json({ error: 'This coupon code has reached its maximum number of uses. Please try another code.' })
    }
  }

  // Return the coupon details
  return res.status(200).json({
    valid: true,
    discountAmount: coupon.discount_amount,
    school: coupon.school,
  })
}
