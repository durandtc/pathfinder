import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, stage } = req.body
  if (!userId || !stage) return res.status(400).json({ error: 'userId and stage required' })
  const db = supabaseAdmin()
  await db.from('users').update({ grade: stage }).eq('id', userId)
  return res.status(200).json({ ok: true })
}
