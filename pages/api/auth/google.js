import { supabaseAdmin } from '../../../lib/supabase'
import { signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { uid, email, displayName, photoURL } = req.body
  if (!uid || !email) return res.status(400).json({ error: 'uid and email required' })

  const db = supabaseAdmin()

  let { data: user } = await db.from('users').select('*').or(`google_uid.eq.${uid},email.eq.${email}`).maybeSingle()

  if (!user) {
    const { data: newUser, error } = await db.from('users').insert({
      full_name:      displayName || email.split('@')[0],
      email,
      auth_provider:  'google',
      google_uid:     uid,
      email_verified: true,  // Google accounts are pre-verified
      last_login:     new Date().toISOString(),
    }).select().single()
    if (error) return res.status(500).json({ error: 'Could not create user account.' })
    user = newUser
  } else {
    await db.from('users').update({ google_uid: uid, last_login: new Date().toISOString() }).eq('id', user.id)
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
      email:                  user.email,
      photoURL:               photoURL || null,
      emailVerified:          true,
      hasCompletedPayment:    !!payment,
      hasCompletedAssessment: !!completedA,
      latestReportId:         report?.id || null,
    },
  })
}
