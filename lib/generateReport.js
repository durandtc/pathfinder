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
5. For psychology careers (Educational Psychologist, Counselling Psychologist, Clinical Psychologist):
   - Pathway is: 3-year undergrad degree → Honours degree → Master's degree (MANDATORY, not optional) → 1-year internship → Board exam → HPCSA registration
   - Master's is REQUIRED and cannot be skipped. Emphasise this is a multi-year commitment
   - For Educational Psychologist: include that they work with children, teens, and adults for assessment AND therapy/psychotherapy
   - For Counselling Psychologist: do NOT reference Clinical Psychology Society resources — stick to Counselling Psychology
6. The "subject_or_next_steps_advice" field should contain ${schoolLearner ? 'specific subject combination advice' : 'concrete next steps, upskilling recommendations, or transition plan'}

Produce ONLY a valid JSON object — no preamble, no text outside the JSON. You MAY use markdown formatting (bold **text**, bullets *, tables) inside string values to structure information clearly:

{
  "report_headline": "One powerful sentence capturing this person's unique profile and strongest combination of traits. E.g. 'A systems thinker who builds things that actually help people.' Make it personal to their RIASEC + data, not generic.",
  "riasec_profile": {
    "dominant_types": ["string", "string"],
    "summary": "3-sentence profile describing this specific person's personality, work style, and key characteristics based on ALL data sources"
  },
  "stage_context": "One sentence acknowledging the person's current stage and why this matters for their career planning",
  "career_choice_rationale": "2-3 sentences: why these 6 specific careers align with this person's profile. Reference patterns in their assessment data (e.g. 'Your investigative interests combined with strong leadership energy and social impact orientation point toward roles that combine problem-solving, innovation, and human connection').",
  ${hasMarks && validMarks.length > 0 ? `"academic_observations": "2-3 sentences noting what the marks or background reveal — strengths, gaps, and any notable mismatches between interest and performance",` : ''}
  "careers": [
    {
      "rank": 1,
      "title": "Career title",
      "match_pct": 94,
      "summary": "2-3 sentences: what this career involves AND why it suits this specific person at their current stage",
      "day_in_the_life": "2-3 sentences painting a vivid picture of a typical Tuesday. Specific activities, tools, people, environments, and sensory details. E.g. 'On a Tuesday you'd spend your morning collecting water samples from a township borehole, your afternoon running statistical analysis, your evening writing a report for the municipality.' Not generic.",
      "salary_range": {
        "entry": "R180,000 – R280,000 per year",
        "mid": "R380,000 – R550,000 per year",
        "senior": "R650,000 – R950,000+ per year"
      },
      "career_progression": "Progression timeline: Year 1–3: [junior role] → Year 4–8: [mid role] → Year 9–15: [senior role] → 15+ years: [leadership/director role]. Tailor to realistic South African career paths.",
      "subjects_required": ${schoolLearner ? '["Subject 1", "Subject 2", "First Additional Language (Compulsory)", "Life Orientation (Compulsory)"]' : '["Qualification or skill 1", "Qualification or skill 2"]'},
      "subjects_recommended": ${schoolLearner ? '["Recommended subject A", "Note: Life Orientation is compulsory but does NOT count toward your APS score"]' : '["Additional advantageous skill or cert"]'},
      "requirements": "${schoolLearner ? 'NSC grade requirements and APS scores' : 'Qualifications, experience, or certifications needed'}",
      "pathway": "${schoolLearner ? 'Degree/diploma and SA institutions' : 'Career entry or transition pathway in South Africa'}",
      "current_position_assessment": "One honest sentence: how well positioned is this person RIGHT NOW for this career given their stage and background",
      "exploration_tip": "One specific, concrete thing they can do THIS WEEK to explore this career. Not vague. Examples: 'Search for '[Organisation Name]' on YouTube', 'Contact the University of Cape Town's department of Environmental Health for a virtual tour', 'Shadow someone in the environmental health role at your local clinic', 'Watch the documentary [Title] on Netflix', 'Join [specific LinkedIn group or Discord community]'.",
      "ai_impact": "2 sentences: how AI will affect this career over 10-20 years and what it means for this person",
      "ai_resilience": "high | medium | low"
    },
    { "rank": 2, "title": "...", "match_pct": 88, "summary": "...", "day_in_the_life": "...", "salary_range": { "entry": "...", "mid": "...", "senior": "..." }, "career_progression": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "exploration_tip": "...", "ai_impact": "...", "ai_resilience": "medium" },
    { "rank": 3, "title": "...", "match_pct": 82, "summary": "...", "day_in_the_life": "...", "salary_range": { "entry": "...", "mid": "...", "senior": "..." }, "career_progression": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "exploration_tip": "...", "ai_impact": "...", "ai_resilience": "medium" },
    { "rank": 4, "title": "...", "match_pct": 78, "summary": "...", "day_in_the_life": "...", "salary_range": { "entry": "...", "mid": "...", "senior": "..." }, "career_progression": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "exploration_tip": "...", "ai_impact": "...", "ai_resilience": "medium" },
    { "rank": 5, "title": "...", "match_pct": 74, "summary": "...", "day_in_the_life": "...", "salary_range": { "entry": "...", "mid": "...", "senior": "..." }, "career_progression": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "exploration_tip": "...", "ai_impact": "...", "ai_resilience": "medium" },
    { "rank": 6, "title": "...", "match_pct": 70, "summary": "...", "day_in_the_life": "...", "salary_range": { "entry": "...", "mid": "...", "senior": "..." }, "career_progression": "...", "subjects_required": [], "subjects_recommended": [], "requirements": "...", "pathway": "...", "current_position_assessment": "...", "exploration_tip": "...", "ai_impact": "...", "ai_resilience": "medium" }
  ],
  "subject_or_next_steps_advice": "${schoolLearner ? 'Use markdown formatting to structure subject advice clearly: bold the career names for each rank (e.g. **Rank 1: [Career]**), list required subjects as bullets. IMPORTANT: Always include First Additional Language (FAL) and Life Orientation as compulsory requirements. Note: Life Orientation is mandatory for NSC but does NOT count toward APS score. Create a comparison table if helpful, referencing all six careers and current academic performance. End with ACTION ITEMS: 4 numbered items, specific and doable (e.g. 1. Arrange to shadow [role] at [specific place], 2. Talk to [teacher/parent] about [specific topic], 3. Register for [course], 4. [concrete next step]).' : 'Concrete 3-5 step action plan tailored to this person\'s stage — upskilling, applications, networking, or transition steps. Use bullets and bold for clarity. End with exactly 4 ACTION ITEMS.'}",
  "parent_action_plan": "Exactly 3 bullet points. Each bullet = one specific, doable action for the parent in the next 30 days. NOT generic encouragement. EXAMPLES of good bullets: '1. Arrange a 2-hour shadow day at [specific local organisation] — email [contact type] at [organisation]' or '1. Discuss what inspired their top-ranked career during a 15-minute chat over dinner' or '1. Attend [specific local university open day] on [date] together' or '1. Help them register for a free [specific course/platform] to explore [skill]'. Make these hyper-specific and immediately actionable.",
  "parent_note": "A warm paragraph for the parent/support person. Acknowledge their role in the assessment data (if parent section was completed) or address to their support person. Include 1-2 specific observations about this student's learning style, strengths, or growth areas discovered in this assessment.",
  "motivational_note": "Write a genuinely moving paragraph. Use 'you' throughout. Address the student by their name if you have it. Acknowledge ONE specific struggle you noticed in their assessment data (e.g., 'I noticed your maths confidence is lower than your marks', or 'Your independent learning strength shines through'). Reframe that struggle as a strength-in-progress. End with a sentence that makes them feel seen, capable, and excited about their future — not a template platitude. This should feel like it was written by someone who truly studied them.",
  "other_careers_intro": "5-6 other careers that match your RIASEC profile: List careers that share the same dominant types but may not be in the top 6. For example, if their profile is Social-Investigative-Artistic (SIA), you might suggest: Teacher (Art/Music), Museum Educator, Art Therapist, Community Development Worker, Health Journalist. Format as a simple bulleted list with brief 1-line descriptions. This gives them more options to explore beyond the top 6 recommendations."
}`

  const message = await client.messages.create({
    model:      process.env.AI_MODEL || 'claude-sonnet-4-6',
    max_tokens: 12000,
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
