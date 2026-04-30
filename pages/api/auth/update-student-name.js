import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, studentName } = req.body
  if (!userId || !studentName) return res.status(400).json({ error: 'userId and studentName required' })

  const db = supabaseAdmin()

  const { error } = await db.from('users')
    .update({ student_name: studentName.trim() })
    .eq('id', userId)

  if (error) return res.status(500).json({ error: 'Could not update student name' })

  return res.status(200).json({ success: true })
}
