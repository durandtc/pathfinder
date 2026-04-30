import { supabaseAdmin } from '../../../lib/supabase'
import { signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { uid, email, displayName, photoURL, stage } = req.body
  if (!uid || !email) return res.status(400).json({ error: 'uid and email required' })

  const db = supabaseAdmin()

  let { data: user } = await db.from('users')
    .select('*')
    .or(`google_uid.eq.${uid},email.eq.${email}`)
    .maybeSingle()

  if (!user) {
    const { data: newUser, error } = await db.from('users').insert({
      full_name:      displayName || email.split('@')[0],
      student_name:   null,  // will be prompted for later
      email,
      auth_provider:  'google',
      google_uid:     uid,
      grade:          stage || null,
      email_verified: true,
      last_login:     new Date().toISOString(),
    }).select().single()
    if (error) return res.status(500).json({ error: 'Could not create user account.' })
    user = newUser
  } else {
    const updates = { google_uid: uid, last_login: new Date().toISOString() }
    if (stage && !user.grade) updates.grade = stage  // save stage if not already set
    await db.from('users').update(updates).eq('id', user.id)
    if (stage && !user.grade) user.grade = stage
  }

  const { data: payment }    = await db.from('payments').select('id').eq('user_id', user.id).eq('status', 'completed').maybeSingle()
  const { data: completedA } = await db.from('assessments').select('id').eq('user_id', user.id).eq('status', 'completed').maybeSingle()
  const { data: report }     = await db.from('reports').select('id').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).maybeSingle()

  const token = signToken({ userId: user.id, email: user.email, isAdmin: false })
  res.setHeader('Set-Cookie', `pf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`)

  return res.status(200).json({
    user: {
      id:                     user.id,
      fullName:               user.full_name,
      studentName:            user.student_name,
      email:                  user.email,
      photoURL:               photoURL || null,
      stage:                  user.grade || null,
      emailVerified:          true,
      hasCompletedPayment:    !!payment,
      hasCompletedAssessment: !!completedA,
      latestReportId:         report?.id || null,
      needsStage:             !user.grade,  // flag if stage not yet set
      needsStudentName:       !user.student_name,  // flag if student name not set
    },
  })
}
