import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const db = supabaseAdmin()

  const { data: users } = await db.from('users').select('id, full_name, email, grade, school, created_at, last_login').order('created_at', { ascending: false }).limit(100)

  // Enrich with payment + report status
  const enriched = await Promise.all((users || []).map(async u => {
    const { data: payment } = await db.from('payments').select('id').eq('user_id', u.id).eq('status', 'completed').maybeSingle()
    const { data: report }  = await db.from('reports').select('id').eq('user_id', u.id).maybeSingle()
    return { ...u, has_payment: !!payment, has_report: !!report }
  }))

  return res.status(200).json({ users: enriched })
}
