import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const db = supabaseAdmin()

  const { data: reports, error } = await db
    .from('reports')
    .select('id, generated_at, riasec_scores, top_careers')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  // Return a summary list (not full data) for the dashboard
  const summaries = (reports || []).map(r => ({
    id: r.id,
    generated_at: r.generated_at,
    dominant_types: r.riasec_scores?.dominant_types || [],
    top_career: r.top_careers?.careers?.[0]?.title || 'Career Report',
  }))

  return res.status(200).json({ reports: summaries })
}
