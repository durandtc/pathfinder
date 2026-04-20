import Anthropic from '@anthropic-ai/sdk'
import { QUESTIONS, SECTIONS } from './questions'

export async function generateCareerReport(answers) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Build a readable summary of answers
  const answerSummary = QUESTIONS.map((q, i) => {
    const ans = answers[i]
    if (ans === undefined) return null
    if (q.type === 'scale') {
      return `Q${i + 1} [${SECTIONS[q.section].id}] "${q.text}" → ${ans}/5`
    } else {
      return `Q${i + 1} [${SECTIONS[q.section].id}] "${q.text}" → "${q.options[ans]}"`
    }
  }).filter(Boolean).join('\n')

  const prompt = `You are an expert South African career guidance counsellor and psychometrist with deep knowledge of the CAPS (Curriculum Assessment Policy Statements) school curriculum, NSC (National Senior Certificate) requirements, and university APS (Admission Point Score) entry requirements.

A Grade 9 student has completed a 45-question career assessment based on the Holland RIASEC model, career values inventory, and self-reported aptitude screening. Analyse their answers and produce a structured career guidance report.

STUDENT ANSWERS:
${answerSummary}

Produce your response as a valid JSON object ONLY — no markdown, no preamble, no explanation outside the JSON.

The JSON must follow this exact structure:
{
  "riasec_profile": {
    "dominant_types": ["string", "string"],
    "summary": "2-3 sentence profile summary describing this student's personality and work style"
  },
  "careers": [
    {
      "rank": 1,
      "title": "Career title",
      "match_pct": 94,
      "summary": "2-3 sentence description of what this career involves and why it suits this student specifically",
      "subjects_required": ["Subject 1", "Subject 2", "Subject 3", "Subject 4"],
      "subjects_recommended": ["Subject A", "Subject B"],
      "nsc_grades": "Specific NSC minimum % requirements, e.g. Maths ≥ 60%, Physical Science ≥ 50%",
      "aps_score": "Minimum APS score and example SA university, e.g. APS ≥ 28 for BSc at UCT/Wits/UP",
      "study_path": "Degree or diploma name and typical SA institutions offering it",
      "ai_impact": "2-3 sentences: how AI will specifically affect this occupation over next 10-20 years, what parts are safe, what parts are at risk",
      "ai_resilience": "high | medium | low"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ],
  "subject_advice": "A paragraph of honest, specific advice about which Grade 10 subject combination this student should choose, referencing all three career options",
  "motivational_note": "A warm, encouraging paragraph addressed directly to the student (use 'you') about their unique strengths and the exciting future ahead"
}

Rules:
- Careers must be realistic matches for a South African student
- APS scores must reference real SA university requirements
- NSC subject requirements must align with actual CAPS subjects
- ai_resilience must be one of: high, medium, low
- match_pct must be between 70 and 98
- All three careers should be meaningfully different from each other`

  const message = await client.messages.create({
    model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = message.content[0].text.trim()

  // Strip markdown code fences if present
  const jsonText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  let reportData
  try {
    reportData = JSON.parse(jsonText)
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + rawText.substring(0, 200))
  }

  return { reportData, rawText, usage: message.usage }
}
