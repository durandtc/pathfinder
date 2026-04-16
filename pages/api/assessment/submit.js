import { supabaseAdmin } from '../../../lib/supabase'
import { generateCareerReport } from '../../../lib/generateReport'
import { buildPdfBase64 } from '../../../lib/generatePdf'
import { sendReportEmail } from '../../../lib/sendEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, answers } = req.body
  if (!userId || !answers) return res.status(400).json({ error: 'userId and answers required' })

  const db = supabaseAdmin()

  // Get user
  const { data: user } = await db.from('users').select('*').eq('id', userId).single()
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Get or create assessment
  let { data: assessment } = await db.from('assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()

  if (!assessment) {
    // Allow assessment without payment (for sandbox/testing)
    const { data: newAssessment } = await db.from('assessments').insert({ user_id: userId, status: 'in_progress', started_at: new Date().toISOString() }).select().single()
    assessment = newAssessment
  } else {
    await db.from('assessments').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', assessment.id)
  }

  // Store all answers
  const answerRows = Object.entries(answers).map(([idx, value]) => {
    const { QUESTIONS, SECTIONS } = require('../../../lib/questions')
    const q = QUESTIONS[parseInt(idx)]
    return {
      assessment_id: assessment.id,
      question_index: parseInt(idx),
      section: SECTIONS[q.section].id,
      answer_value: value,
    }
  })

  await db.from('answers').delete().eq('assessment_id', assessment.id)
  await db.from('answers').insert(answerRows)

  // Generate AI report
  let reportData, rawText
  try {
    const result = await generateCareerReport(answers)
    reportData = result.reportData
    rawText = result.rawText
  } catch (err) {
    return res.status(500).json({ error: `AI generation failed: ${err.message}` })
  }

  // Store report
  const { data: report } = await db.from('reports').insert({
    assessment_id: assessment.id,
    user_id: userId,
    top_careers: reportData,
    riasec_scores: reportData.riasec_profile || {},
    ai_raw_response: rawText,
    generated_at: new Date().toISOString(),
  }).select().single()

  // Mark assessment complete
  await db.from('assessments').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', assessment.id)

  // Build and email the HTML report
  try {
    const reportHtml = buildPdfBase64(reportData, user.full_name, user.email)
    await sendReportEmail({
      toEmail: user.email,
      toName: user.full_name,
      reportHtml,
      assessmentId: assessment.id,
    })
    await db.from('reports').update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq('id', report.id)
  } catch (emailErr) {
    // Don't fail the whole request if email fails — report is still stored
    console.error('Email send failed:', emailErr.message)
  }

  await db.from('audit_log').insert({ action: 'Assessment completed + report generated', details: `User ${user.email}`, performed_by: 'system' })

  return res.status(200).json({ reportId: report.id })
}
