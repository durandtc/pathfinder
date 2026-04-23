import { supabaseAdmin } from '../../../lib/supabase'
import { generateCareerReport } from '../../../lib/generateReport'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, answers, marks } = req.body
  if (!userId || !answers) return res.status(400).json({ error: 'userId and answers required' })

  const db = supabaseAdmin()

  const { data: user } = await db.from('users').select('*').eq('id', userId).single()
  if (!user) return res.status(404).json({ error: 'User not found' })

  // The stage is stored in the grade column
  const stage = user.grade || 'grade_9'

  let { data: assessment } = await db
    .from('assessments').select('*').eq('user_id', userId)
    .eq('status', 'not_started').order('created_at', { ascending: false }).limit(1).maybeSingle()

  if (!assessment) {
    const { data: newA } = await db.from('assessments').insert({
      user_id: userId, status: 'in_progress', started_at: new Date().toISOString(),
    }).select().single()
    assessment = newA
  } else {
    await db.from('assessments').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', assessment.id)
  }

  const { QUESTIONS, SECTIONS } = require('../../../lib/questions')
  const answerRows = Object.entries(answers).map(([idx, value]) => {
    const q = QUESTIONS[parseInt(idx)]
    return { assessment_id: assessment.id, question_index: parseInt(idx), section: SECTIONS[q.section].id, answer_value: value }
  })
  await db.from('answers').delete().eq('assessment_id', assessment.id)
  await db.from('answers').insert(answerRows)

  // Generate AI report — pass stage so advice is tailored
  let reportData, rawText
  try {
    const result = await generateCareerReport(answers, marks || [], stage)
    reportData = result.reportData
    rawText    = result.rawText
  } catch (err) {
    return res.status(500).json({ error: `AI generation failed: ${err.message}` })
  }

  const { data: report } = await db.from('reports').insert({
    assessment_id:   assessment.id,
    user_id:         userId,
    top_careers:     reportData,
    riasec_scores:   reportData.riasec_profile || {},
    ai_raw_response: rawText,
    generated_at:    new Date().toISOString(),
    email_sent:      false,
  }).select().single()

  await db.from('assessments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', assessment.id)
  await db.from('audit_log').insert({
    action:       'Assessment completed',
    details:      `User ${user.email} · Stage: ${stage} · Marks: ${(marks||[]).filter(m=>m.subject).length}`,
    performed_by: 'system',
  })

  return res.status(200).json({ reportId: report.id })
}
