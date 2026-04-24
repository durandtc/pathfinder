// ============================================================
// PickMyPath — Career Stage Configuration
// High School Grades Only (Grade 8–12)
// ============================================================

export const CAREER_STAGES = [
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
]

// Groups for the dropdown UI
export const STAGE_GROUPS = ['High School']

// Get a stage config by value
export function getStageConfig(value) {
  return CAREER_STAGES.find(s => s.value === value) || CAREER_STAGES[1] // default to Grade 9
}

// All users are school learners (needs subject advice)
export function isSchoolLearner(stageValue) {
  return ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'].includes(stageValue)
}

// All high school students provide academic marks
export function showAcademicMarks(stageValue) {
  return ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'].includes(stageValue)
}
