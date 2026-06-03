import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

  const db = supabaseAdmin()

  const { data: rows } = await db
    .from('reports')
    .select('rating, rating_comment, rated_at')
    .not('rating', 'is', null)
    .order('rated_at', { ascending: false })

  if (!rows || rows.length === 0) {
    return res.status(200).json({ totalRatings: 0 })
  }

  const totalRatings = rows.length
  const avgRating = Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10) / 10

  const recentComments = rows
    .filter(r => r.rating_comment && r.rating_comment.trim().length > 10)
    .slice(0, 3)
    .map(r => ({ rating: r.rating, comment: r.rating_comment.trim() }))

  return res.status(200).json({ totalRatings, avgRating, recentComments })
}
