import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const db = supabaseAdmin()

  const [usersRes, assessmentsRes, reportsRes, revenueRes] = await Promise.all([
    db.from('users').select('id', { count: 'exact', head: true }),
    db.from('assessments').select('id', { count: 'exact', head: true }),
    db.from('reports').select('id', { count: 'exact', head: true }),
    db.from('payments').select('amount_zar').eq('status', 'completed'),
  ])

  const revenue = (revenueRes.data || []).reduce((sum, p) => sum + parseFloat(p.amount_zar || 0), 0)

  return res.status(200).json({
    stats: {
      users:       usersRes.count || 0,
      assessments: assessmentsRes.count || 0,
      reports:     reportsRes.count || 0,
      revenue:     Math.round(revenue),
    }
  })
}
