import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Report ID required' })

  const db = supabaseAdmin()
  const { data: report, error } = await db.from('reports').select('*').eq('id', id).single()

  if (error || !report) return res.status(404).json({ error: 'Report not found' })

  const { data: user } = await db.from('users').select('student_name').eq('id', report.user_id).single()

  return res.status(200).json({ report, studentName: user?.student_name })
}
