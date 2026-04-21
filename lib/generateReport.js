import Anthropic from '@anthropic-ai/sdk'
import { QUESTIONS, SECTIONS } from './questions'

export async function generateCareerReport(answers, marks = []) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Build readable answer summary separated by who answered
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

  // Build academic marks summary
  const validMarks = (marks || []).filter(m => m.subject)
  const marksSummary = validMarks.length > 0
    ? validMarks.map(m => {
        const termStr = ['term1','term2','term3','term4']
          .filter(t => m[t])
          .map(t => `${t.replace('term','T')}:${m[t]}%`)
          .join(', ')
        const vals = ['term1','term2','term3','term4'].map(t => parseFloat(m[t])).filter(v => !isNaN(v))
        const avg = vals.length ? Math.round(vals.reduce((a,b) => a+b,0) / vals.length) : null
        return `  • ${m.subject}: ${termStr}${avg ? ` (avg ${avg}%)` : ''}`
      }).join('\n')
    : '  • No academic marks provided'

  const prompt = `You are an expert South African career guidance counsellor and registered psychometrist with deep knowledge of the CAPS curriculum, NSC requirements, and university APS entry requirements across South African institutions.

You have received a comprehensive three-source career assessment for a Grade 9 student:

═══════════════════════════════════════════
SOURCE 1 — STUDENT SELF-ASSESSMENT (RIASEC + Values + Aptitude)
═══════════════════════════════════════════
${studentAnswers.join('\n')}

═══════════════════════════════════════════
SOURCE 2 — PARENT / GUARDIAN OBSERVATIONS
═══════════════════════════════════════════
${parentAnswers.length > 0 ? parentAnswers.join('\n') : '  • Parent section not completed'}

═══════════════════════════════════════════
SOURCE 3 — ACADEMIC PERFORMANCE (OBJECTIVE DATA)
═══════════════════════════════════════════
${marksSummary}

═══════════════════════════════════════════

ANALYSIS INSTRUCTIONS:
1. Weight academic marks heavily — they are objective data, not perception. A student who loves science but scores 45% in Physical Sciences needs different guidance to one who scores 85%.
2. Note any significant mismatches between self-reported strengths and actual marks — surface these honestly but constructively in your report.
3. Use parent observations to validate or challenge the student's self-assessment where they differ.
4. All career recommendations must be realistic given the academic performance shown.

Produce a valid JSON object ONLY — no markdown, no preamble, no text outside the JSON.

{
  "riasec_profile": {
    "dominant_types": ["string", "string"],
    "summary": "3-sentence profile describing this specific student's personality, work style, and key characteristics based on ALL three data sources"
  },
  "academic_observations": "2-3 sentences noting what the marks reveal — strengths, areas needing attention, and any notable gaps between interest and performance",
  "careers": [
    {
      "rank": 1,
      "title": "Career title",
      "match_pct": 94,
      "summary": "2-3 sentences: what this career involves AND why it suits this specific student based on their combined profile",
      "subjects_required": ["Subject 1", "Subject 2", "Subject 3"],
      "subjects_recommended": ["Subject A", "Subject B"],
      "nsc_grades": "Specific NSC minimum % — e.g. Maths ≥ 60%, Physical Science ≥ 50%",
      "aps_score": "Minimum APS and example SA university — e.g. APS ≥ 28 for BSc at UCT/Wits/UP",
      "study_path": "Degree or diploma and typical SA institutions offering it",
      "academic_fit": "One sentence: how the student's current marks position them for this career — honest assessment",
      "ai_impact": "2 sentences: how AI will affect this career over 10-20 years and what that means for this student",
      "ai_resilience": "high | medium | low"
    },
    { "rank": 2, "title": "...", "match_pct": 88, "summary": "...", "subjects_required": [], "subjects_recommended": [], "nsc_grades": "...", "aps_score": "...", "study_path": "...", "academic_fit": "...", "ai_impact": "...", "ai_resilience": "medium" },
    { "rank": 3, "title": "...", "match_pct": 82, "summary": "...", "subjects_required": [], "subjects_recommended": [], "nsc_grades": "...", "aps_score": "...", "study_path": "...", "academic_fit": "...", "ai_impact": "...", "ai_resilience": "medium" }
  ],
  "subject_advice": "Specific paragraph: which Grade 10 subject combination is recommended for this student, referencing all three career options AND their current academic performance. Be honest if a particular path requires significant improvement in specific subjects.",
  "parent_note": "A short paragraph addressed to the parent acknowledging their observations and giving them 2-3 practical things they can do to support their child's development toward these career paths.",
  "motivational_note": "A warm, encouraging paragraph addressed directly to the student (use 'you'). Acknowledge their specific strengths. Be honest about areas to work on but frame it positively."
}`

  const message = await client.messages.create({
    model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText  = message.content[0].text.trim()
  const jsonText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  let reportData
  try {
    reportData = JSON.parse(jsonText)
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + rawText.substring(0, 300))
  }

  return { reportData, rawText, usage: message.usage }
}
