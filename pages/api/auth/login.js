import { supabaseAdmin } from '../../../lib/supabase'
import { comparePassword, signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const db = supabaseAdmin()
  const { data: user } = await db.from('users').select('*').eq('email', email).maybeSingle()
  if (!user) return res.status(401).json({ error: 'No account found with that email address.' })

  if (!user.password_hash) return res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google button to log in.' })

  const valid = comparePassword(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Incorrect password.' })

  await db.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id)

  // Check payment and assessment status
  const { data: payment } = await db.from('payments').select('id').eq('user_id', user.id).eq('status', 'completed').maybeSingle()
  const { data: completedAssessment } = await db.from('assessments').select('id').eq('user_id', user.id).eq('status', 'completed').maybeSingle()
  const { data: inProgressAssessment } = await db.from('assessments').select('id, last_question_index').eq('user_id', user.id).eq('status', 'in_progress').maybeSingle()
  const { data: report } = await db.from('reports').select('id').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).maybeSingle()

  const token = signToken({ userId: user.id, email: user.email, isAdmin: false })
  res.setHeader('Set-Cookie', `pf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`)

  return res.status(200).json({
    user: {
      id:                   user.id,
      fullName:             user.full_name,
      email:                user.email,
      emailVerified:        user.email_verified || false,
      hasCompletedPayment:  !!payment,
      hasCompletedAssessment: !!completedAssessment,
      hasInProgressAssessment: !!inProgressAssessment,
      inProgressQuestionIndex: inProgressAssessment?.last_question_index || 0,
      latestReportId:       report?.id || null,
    },
  })
}
