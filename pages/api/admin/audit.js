import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const db = supabaseAdmin()
  const { data: logs } = await db.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50)
  return res.status(200).json({ logs: logs || [] })
}
