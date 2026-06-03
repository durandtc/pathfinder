import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { reportId, userId, rating, comment } = req.body
  if (!reportId || !userId || !rating) return res.status(400).json({ error: 'reportId, userId and rating required' })
  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' })

  const db = supabaseAdmin()

  const { data: report } = await db.from('reports').select('user_id').eq('id', reportId).single()
  if (!report) return res.status(404).json({ error: 'Report not found' })
  if (report.user_id !== userId) return res.status(403).json({ error: 'Unauthorized' })

  await db.from('reports').update({
    rating: Number(rating),
    rating_comment: comment?.trim() || null,
    rated_at: new Date().toISOString(),
  }).eq('id', reportId)

  return res.status(200).json({ success: true })
}
