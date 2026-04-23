// ============================================================
// PickMyPath — Career Stage Configuration
// Defines all supported grades and life stages,
// and what the AI should focus on for each one.
// ============================================================

export const CAREER_STAGES = [
  // ── SCHOOL GRADES ────────────────────────────────────────
  {
    value: 'grade_8',
    label: 'Grade 8',
    group: 'High School',
    shortLabel: 'Gr 8',
    description: 'Early high school — start building self-awareness early',
    aiContext: 'a Grade 8 student in early high school',
    subjectAdviceContext: 'While subject specialisation happens in Grade 10, this is a great time to identify strengths and interests. Focus advice on which subjects to prioritise and enjoy in Grades 8–9 to prepare for Grade 10 choices.',
    reportFocus: 'early interest discovery and subject enjoyment',
  },
  {
    value: 'grade_9',
    label: 'Grade 9',
    group: 'High School',
    shortLabel: 'Gr 9',
    description: 'Critical year — choose Grade 10 subjects',
    aiContext: 'a Grade 9 student about to choose their Grade 10 subjects',
    subjectAdviceContext: 'This is the most critical subject choice year. Provide specific, actionable Grade 10 subject combination advice aligned to all three career paths. Be very clear about which subjects are compulsory vs optional.',
    reportFocus: 'Grade 10 subject selection — this is the primary output',
  },
  {
    value: 'grade_10',
    label: 'Grade 10',
    group: 'High School',
    shortLabel: 'Gr 10',
    description: 'Confirm subject choices are right for your goals',
    aiContext: 'a Grade 10 student who has recently chosen their subjects',
    subjectAdviceContext: 'The student has already chosen subjects. Confirm whether current subjects align with career interests. If there is a mismatch, advise on whether a subject change is still possible and realistic, or how to work with current subjects.',
    reportFocus: 'validating subject choices and setting academic targets',
  },
  {
    value: 'grade_11',
    label: 'Grade 11',
    group: 'High School',
    shortLabel: 'Gr 11',
    description: 'Prepare university and college applications',
    aiContext: 'a Grade 11 student preparing for matric and university/college applications',
    subjectAdviceContext: 'Focus on specific NSC grade targets needed for university admission, APS score requirements, and which institutions to target. The student cannot change subjects but can still choose their post-school direction.',
    reportFocus: 'university/college selection and NSC grade targets',
  },
  {
    value: 'grade_12',
    label: 'Grade 12 / Matric',
    group: 'High School',
    shortLabel: 'Gr 12',
    description: 'Final year — finalise your post-school plan',
    aiContext: 'a Grade 12 matric student finalising their post-school plans',
    subjectAdviceContext: 'Focus on specific post-school pathways: which universities to apply to, which courses to apply for, what APS scores are needed, and alternative routes (TVET colleges, learnerships, gap year options) if university is not the right fit.',
    reportFocus: 'post-school pathway planning and application strategy',
  },
  // ── POST-SCHOOL ───────────────────────────────────────────
  {
    value: 'gap_year',
    label: 'Gap Year / Between Studies',
    group: 'Post-School',
    shortLabel: 'Gap Year',
    description: 'Taking time to decide your direction',
    aiContext: 'a person in a gap year or between studies who is deciding their next direction',
    subjectAdviceContext: 'Focus on practical next steps: which courses or programmes to apply for, whether to consider bridging courses, and how to use the gap year productively to strengthen applications.',
    reportFocus: 'deciding on the right study direction and making productive use of time',
  },
  {
    value: 'university_student',
    label: 'University / College Student',
    group: 'Post-School',
    shortLabel: 'University',
    description: 'Currently studying — confirm you are on the right path',
    aiContext: 'a current university or college student who wants to confirm they are studying in the right direction',
    subjectAdviceContext: 'Focus on whether the current field of study aligns with their profile. If it does, advise on specialisations and career paths within the field. If it does not, advise on whether switching or adding a second qualification makes sense.',
    reportFocus: 'confirming study direction and identifying specialisation options',
  },
  {
    value: 'recent_graduate',
    label: 'Recent Graduate',
    group: 'Post-School',
    shortLabel: 'Graduate',
    description: 'Graduated and choosing your career direction',
    aiContext: 'a recent graduate entering the job market and choosing their career direction',
    subjectAdviceContext: 'Focus on entry-level career paths, which industries to target, what additional certifications or skills would strengthen their profile, and realistic salary expectations in South Africa.',
    reportFocus: 'entering the job market and identifying the right career starting point',
  },
  // ── WORKING ADULTS ────────────────────────────────────────
  {
    value: 'early_career',
    label: 'Early Career (1–5 years working)',
    group: 'Working Adults',
    shortLabel: 'Early Career',
    description: 'Building your career — are you in the right field?',
    aiContext: 'an early-career professional with 1–5 years of work experience who is evaluating their career direction',
    subjectAdviceContext: 'Focus on whether current career trajectory aligns with their profile, what lateral moves or specialisations make sense, and what upskilling (short courses, certifications, postgrad study) would accelerate their growth.',
    reportFocus: 'career direction confirmation and growth planning',
  },
  {
    value: 'career_change',
    label: 'Career Change / Pivot',
    group: 'Working Adults',
    shortLabel: 'Career Change',
    description: 'Considering a significant career change',
    aiContext: 'a working professional considering a significant career change or pivot',
    subjectAdviceContext: 'Focus on realistic career pivot options given their existing experience and qualifications, what retraining or bridging qualifications are needed, how long the transition would take, and how to leverage existing skills in a new direction.',
    reportFocus: 'identifying viable career pivot options and transition planning',
  },
  {
    value: 'adult_returner',
    label: 'Returning to Work',
    group: 'Working Adults',
    shortLabel: 'Returning',
    description: 'Returning after a career break',
    aiContext: 'a professional returning to work after a career break',
    subjectAdviceContext: 'Focus on re-entry strategies, industries that value diverse experience, what refresher training might be needed, and how to position career break experience positively.',
    reportFocus: 're-entry strategy and identifying supportive industries',
  },
]

// Groups for the dropdown UI
export const STAGE_GROUPS = ['High School', 'Post-School', 'Working Adults']

// Get a stage config by value
export function getStageConfig(value) {
  return CAREER_STAGES.find(s => s.value === value) || CAREER_STAGES[1] // default to Grade 9
}

// Is this person a school learner (needs subject advice)?
export function isSchoolLearner(stageValue) {
  return ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'].includes(stageValue)
}

// Should we show academic marks input?
export function showAcademicMarks(stageValue) {
  return ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'recent_graduate'].includes(stageValue)
}
