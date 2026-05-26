import { supabaseAdmin } from '../../../lib/supabase'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const db = supabaseAdmin()

  const { error } = await db.from('users').update({
    terms_accepted: true,
    terms_accepted_at: new Date().toISOString(),
  }).eq('id', user.userId)

  if (error) return res.status(500).json({ error: 'Could not save terms acceptance.' })

  return res.status(200).json({ success: true })
}
