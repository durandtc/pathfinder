import Anthropic from '@anthropic-ai/sdk'
import { QUESTIONS, SECTIONS } from './questions'
import { getStageConfig, isSchoolLearner, showAcademicMarks } from './stageConfig'

export async function generateCareerReport(answers, marks = [], stage = 'grade_9') {
  const client      = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const stageConfig = getStageConfig(stage)
  const schoolLearner = isSchoolLearner(stage)
  const hasMarks    = showAcademicMarks(stage)

  // Build answer summaries separated by source
  const studentAnswers = []
  const parentAnswers  = []

  QUESTIONS.forEach((q, i) => {
    const ans = answers[i]
    if (ans === undefined) return
    const section = SECTIONS[q.section]
    const text = q.type === 'scale'
      ? `"${q.text}" → ${ans}/5`
      : `"${q.text}" → "${q.options[ans]}"`
    if (section.who === 'parent') {
      parentAnswers.push(`  • ${text}`)
    } else {
      studentAnswers.push(`  • [${section.id.toUpperCase()}] ${text}`)
    }
  })

  // Academic marks summary
  const validMarks = (marks || []).filter(m => m.subject)
  const marksSummary = validMarks.length > 0
    ? validMarks.map(m => {
        const termStr = ['term1','term2','term3','term4']
          .filter(t => m[t])
          .map(t => `${t.replace('term','T')}:${m[t]}%`)
          .join(', ')
        const vals = ['term1','term2','term3','term4'].map(t => parseFloat(m[t])).filter(v => !isNaN(v))
        const avg  = vals.length ? Math.round(vals.reduce((a,b) => a+b,0) / vals.length) : null
        return `  • ${m.subject}: ${termStr}${avg ? ` (avg ${avg}%)` : ''}`
      }).join('\n')
    : '  • No academic marks provided'

  // Build a stage-aware prompt
  const prompt = `You are an expert South African career guidance counsellor and registered psychometrist. You have deep knowledge of the CAPS curriculum, NSC requirements, university APS entry requirements, TVET colleges, and adult career development.

You are analysing a comprehensive career assessment for ${stageConfig.aiContext}.

STAGE-SPECIFIC FOCUS: ${stageConfig.subjectAdviceContext}
PRIMARY REPORT FOCUS: ${stageConfig.reportFocus}

═══════════════════════════════════════════
SOURCE 1 — SELF-ASSESSMENT (RIASEC + Values + Aptitude)
═══════════════════════════════════════════
${studentAnswers.join('\n')}

═══════════════════════════════════════════
SOURCE 2 — PARENT / GUARDIAN OBSERVATIONS
═══════════════════════════════════════════
${parentAnswers.length > 0 ? parentAnswers.join('\n') : '  • Parent section not completed'}

═══════════════════════════════════════════
SOURCE 3 — ACADEMIC / PROFESSIONAL BACKGROUND
═══════════════════════════════════════════
${hasMarks && validMarks.length > 0 ? marksSummary : '  • No academic or professional background provided'}

═══════════════════════════════════════════

CRITICAL ANALYSIS INSTRUCTIONS:
1. This person is ${stageConfig.aiContext} — ALL advice must be appropriate for their specific stage
2. ${schoolLearner ? 'Academic marks are objective data — weight them heavily and flag any mismatches between interest and performance' : 'Focus on transferable skills, experience, and realistic career transition pathways'}
3. Career recommendations must be realistic and achievable from their current position
4. All South African institutions, qualifications, and requirements must be accurate
5. The "subject_or_next_steps_advice" field should contain ${schoolLearner ? 'specific subject combination advice' : 'concrete next steps, upskilling recommendations, or transition plan'}

Produce ONLY a valid JSON object — no preamble, no text outside the JSON. You MAY use markdown formatting (bold **text**, bullets *, tables) inside string values to structure information clearly:

{
  "riasec_profile": {
    "dominant_types": ["string", "string"],
    "summary": "3-sentence profile describing this specific person's personality, work style, and key characteristics based on ALL data sources"
  },
  "stage_context": "One sentence acknowledging the person's current stage and why this matters for their career planning",
  ${hasMarks && validMarks.length > 0 ? `"academic_observations": "2-3 sentences noting what the marks or background reveal — strengths, gaps, and any notable mismatches between interest and performance",` : ''}
  "careers": [
    {
      "rank": 1,
      "title": "Career title",
      "match_pct": 94,
      "summary": "2-3 sentences: what this career involves AND why it suits this specific person at their current stage",
      "subjects_required": ${schoolLearner ? '["Subject 1", "Subject 2"]' : '["Qualification or skill 1", "Qualification or skill 2"]'},
      "subjects_recommended": ${schoolLearner ? '["Recommended subject A"]' : '["Additional advantageous skill or cert"]'},
      "requirements": "${schoolLearner ? 'NSC grade requirements and APS scores' : 'Qualifications, experience, or certifications needed'}",
      "pathway": "${schoolLearner ? 'Degree/diploma and SA institutions' : 'Career entry or transition pathway in South Africa'}",
      "current_position_assessment": "One honest sentence: how well positioned is this person RIGHT NOW for this career given their stage and background",
      "ai_impact": "2 sentences: how AI will affect this career over 10-20 years and what it means for this person",
      "ai_resilience": "high | medium | low"
    },
    { "rank": 2, "title": "...", "match_pct": 88, "summary": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "ai_impact": "...", "ai_resilience": "medium" },
    { "rank": 3, "title": "...", "match_pct": 82, "summary": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "ai_impact": "...", "ai_resilience": "medium" }
  ],
  "subject_or_next_steps_advice": "${schoolLearner ? 'Use markdown formatting to structure subject advice clearly: bold the career names (e.g. **Rank 1: [Career]**), list required subjects as bullets, and create a comparison table if helpful. Reference all three careers and current academic performance.' : 'Concrete 3-5 step action plan tailored to this person\'s stage — upskilling, applications, networking, or transition steps. Use bullets and bold for clarity.'}",
  "parent_note": "A short paragraph for the parent or support person with 2-3 practical things they can do to support this person's development. If no parent section was completed, address this to any support person in their life.",
  "motivational_note": "A warm, encouraging paragraph addressed directly to the person (use 'you'). Acknowledge their specific strengths and be honest but positive about areas to work on."
}`

  const message = await client.messages.create({
    model:      process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    messages:   [{ role: 'user', content: prompt }],
  })

  if (message.stop_reason === 'max_tokens') {
    throw new Error('AI response was truncated (hit max_tokens). Try regenerating the report.')
  }

  const rawText = message.content[0].text.trim()

  // Strip optional ```json ... ``` fences, then fall back to slicing between the first { and last }
  let jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  const firstBrace = jsonText.indexOf('{')
  const lastBrace  = jsonText.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1)
  }

  let reportData
  try {
    reportData = JSON.parse(jsonText)
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + rawText.substring(0, 300))
  }

  return { reportData, rawText, usage: message.usage }
}
