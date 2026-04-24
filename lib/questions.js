// ============================================================
// PickMyPath — Assessment Question Bank
// Frameworks: Holland RIASEC + Career Values + Aptitude
// Stage-specific questions for students and working adults
// ============================================================

export const SECTIONS = [
  {
    id: 'interests',
    title: 'Career Interest Inventory',
    subtitle: "Answer honestly about what you genuinely enjoy — not what you think sounds impressive. There are no right or wrong answers here.",
    stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'],
  },
  {
    id: 'values',
    title: 'Career Values & Work Environment',
    subtitle: 'Tell us about the kind of work you find meaningful and the environment where you would thrive.',
    stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'],
  },
  {
    id: 'aptitude',
    title: 'Your Strengths & Abilities',
    subtitle: 'Reflect honestly on your own strengths — this helps us weight your career matches accurately.',
    stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'],
  },
  {
    id: 'parent',
    title: 'Parent / Guardian Observations',
    subtitle: 'Parents — please take over here. Answer based on what you observe about your child at home and in everyday life. Your outside perspective adds important context.',
    stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'],
  },
  {
    id: 'marks',
    title: 'Academic & Professional Background',
    subtitle: 'Enter your child\'s subject marks using the most recent school report available. This is the most objective data in the entire assessment and significantly improves accuracy.',
    stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'],
  },
]

export const QUESTIONS = [
  // ── SECTION 1: INTERESTS (RIASEC) ── 15 questions ──────────
  // Universal questions (all stages)
  { section: 0, type: 'scale', riasec: 'R', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy working with my hands — building, fixing, or making things.' },
  { section: 0, type: 'scale', riasec: 'R', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I prefer working with tools, machines, or physical equipment rather than paperwork.' },
  { section: 0, type: 'scale', riasec: 'R', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy outdoor activities or working in a physical environment.' },
  { section: 0, type: 'scale', riasec: 'I', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy investigating problems and figuring out how and why things work.' },
  { section: 0, type: 'scale', riasec: 'I', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy in-depth research, discovery, and understanding how systems and the natural world work.' },
  { section: 0, type: 'scale', riasec: 'I', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I ask a lot of questions and enjoy researching topics in depth.' },
  { section: 0, type: 'scale', riasec: 'A', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy creative activities like art, music, writing, or design.' },
  { section: 0, type: 'scale', riasec: 'A', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I often come up with new and original ideas.' },
  { section: 0, type: 'scale', riasec: 'A', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I like expressing myself through creative projects.' },
  { section: 0, type: 'scale', riasec: 'S', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy helping, teaching, or caring for other people.' },
  { section: 0, type: 'scale', riasec: 'S', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'Making a positive difference in other people\'s lives is very important to me.' },
  { section: 0, type: 'scale', riasec: 'S', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I find it easy to understand and empathise with how others feel.' },
  { section: 0, type: 'scale', riasec: 'E', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy leading projects and persuading or motivating others.' },
  { section: 0, type: 'scale', riasec: 'E', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I feel energised when I am in charge of a project or team.' },
  { section: 0, type: 'scale', riasec: 'C', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I prefer tasks with clear rules, structure, and measurable outcomes.' },

  // ── SECTION 2: VALUES ── Different questions for students vs adults
  // Universal values questions
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'Which type of task sounds most appealing to you?', options: ['Designing or building something physical (a structure, product, or machine)', 'Diagnosing a problem or doing scientific research', 'Writing, illustrating, or creating original content', 'Coaching, mentoring, or supporting another person'] },
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'What kind of workplace would you most prefer?', options: ['A workshop, construction site, lab, or outdoors', 'A research institution, hospital, or technical office', 'A creative studio, agency, or media company', 'A school, clinic, NGO, or community setting'] },

  // Student-specific: school subjects
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'Which school subject do you enjoy the most right now?', options: ['Mathematics or Physical Science', 'Life Sciences or Geography', 'Art, Design, Dramatic Arts, or Languages', 'History, Economics, Life Orientation, or Business Studies'] },

  // Adult-specific: work experience and career direction
  { section: 1, type: 'choice', stages: ['gap_year', 'university_student', 'career_change', 'working_adult'], text: 'Which aspect of work energises you most?', options: ['Building or making something tangible and lasting', 'Solving complex problems and discovering new knowledge', 'Creating something original or expressing ideas', 'Helping people grow, heal, or succeed'] },

  // Universal values questions continued
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'What matters most to you in a future career?', options: ['Building something tangible and lasting', 'Discovering new knowledge or solving complex problems', 'Expressing creativity and original thinking', 'Helping people grow, heal, or succeed'] },
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'How do you prefer to solve problems?', options: ['Using tools, prototypes, experiments, or hands-on trial and error', 'Research, data analysis, and logical reasoning', 'Brainstorming creative or unconventional ideas', 'Talking it through with others and reaching consensus'] },
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'Pick the statement that best describes you:', options: ['I like to see concrete, physical results from my work', 'I enjoy complex intellectual challenges above everything else', 'I value self-expression and originality most', 'I am most fulfilled when I have genuinely helped someone'] },
  { section: 1, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'How do you feel about working with technology in your career?', options: ['I want to build or engineer the technology itself', 'I want to use technology to research and discover', 'I want to use technology as a creative tool', 'Technology is secondary — people and relationships are my focus'] },

  // ── SECTION 3: APTITUDE ── Different questions for students vs adults
  // Universal aptitude scale questions
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I consider myself strong at maths and logical reasoning.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I communicate clearly and confidently, both in writing and speaking.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I pick up new computer and technology skills quickly.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I am well-organised, detail-oriented, and seldom miss deadlines.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I stay calm and focused when working under pressure.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I am naturally empathetic and good at reading people\'s emotions.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I enjoy taking on leadership roles and feel comfortable with responsibility.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I pick up creative or artistic skills (drawing, writing, music) easily.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I prefer working independently and am self-motivated without supervision.' },
  { section: 2, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'I am confident presenting my ideas to a group or audience.' },

  // Student-specific: academic strengths
  { section: 2, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'What best describes your academic strengths?', options: ['Numbers, formulas, and logical thinking', 'Writing, reading, and verbal communication', 'Visual thinking, spatial reasoning, and creativity', 'Understanding people, social dynamics, and human behaviour'] },

  // Adult-specific: professional strengths
  { section: 2, type: 'choice', stages: ['gap_year', 'university_student', 'career_change', 'working_adult'], text: 'What best describes your professional strengths?', options: ['Numbers, analysis, and logical problem-solving', 'Communication, writing, and stakeholder management', 'Visual design, creative thinking, and innovation', 'People skills, coaching, and emotional intelligence'] },

  // Student-specific: academic task difficulty
  { section: 2, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'Which task would you find least difficult?', options: ['Solving a complex maths or physics problem', 'Writing a well-structured persuasive essay', 'Designing a logo, layout, or illustration', 'Giving a confident presentation to your class'] },

  // Adult-specific: professional task difficulty
  { section: 2, type: 'choice', stages: ['gap_year', 'university_student', 'career_change', 'working_adult'], text: 'Which task would you find least difficult?', options: ['Solving a complex analytical or technical problem', 'Writing a clear report or proposal', 'Designing a visual solution or creative concept', 'Facilitating a discussion or presenting to a group'] },

  // Universal personality question
  { section: 2, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'How would your close friends most likely describe you?', options: ['Analytical, rational, and logical', 'Creative, expressive, and imaginative', 'Caring, supportive, and empathetic', 'Driven, ambitious, and goal-oriented'] },

  // Student-specific: academic challenges
  { section: 2, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'What is your biggest current academic challenge?', options: ['Maths or science concepts', 'Writing or expressing ideas clearly', 'Staying organised and managing deadlines', 'Group projects and working with others'] },

  // Adult-specific: career development priorities
  { section: 2, type: 'choice', stages: ['gap_year', 'university_student', 'career_change', 'working_adult'], text: 'What is most important to you in your next career move?', options: ['Financial security and advancement opportunity', 'Work-life balance, flexibility, and autonomy', 'Making a meaningful social or environmental impact', 'Continuous learning and skill development'] },

  // Universal career values
  { section: 2, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'gap_year', 'university_student', 'career_change', 'working_adult'], text: 'Looking ahead, what do you value most in a future career?', options: ['Financial security and a strong, stable salary', 'Work-life balance, flexibility, and freedom', 'Making a meaningful social impact', 'Status, recognition, and professional achievement'] },

  // ── SECTION 4: PARENT OBSERVATIONS ── 12 questions (students only) ─────────
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child loses track of time when doing creative activities (drawing, writing, music, building).' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child naturally takes the lead when playing or working in groups.' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child asks a lot of questions about how things work and why.' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child shows genuine care and concern when others are struggling.' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child prefers structured tasks with clear rules over open-ended ones.' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child enjoys taking things apart, building, or working with their hands.' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child persists through difficult problems rather than giving up quickly.' },
  { section: 3, type: 'scale', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'My child is highly organised and manages their own time well.' },
  { section: 3, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'When your child has free time with no obligations, they most often:', options: ['Build, make, fix, or create something physical', 'Read, research, watch documentaries, or explore ideas', 'Draw, write stories, play music, or do something creative', 'Spend time with friends or help someone with something'] },
  { section: 3, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'Which statement best describes your child\'s social style?', options: ['Prefers working alone and is highly self-sufficient', 'Works best in small, focused groups', 'Thrives in social situations and loves group activities', 'Leads naturally — others tend to follow their ideas'] },
  { section: 3, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'How does your child typically respond to a difficult challenge?', options: ['Analyses the problem carefully before acting', 'Jumps in hands-on and figures it out by doing', 'Looks for a creative or unconventional solution', 'Asks for input from others before deciding'] },
  { section: 3, type: 'choice', stages: ['grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'], text: 'Which area do you believe your child is naturally strongest in?', options: ['Mathematics, science, and logical thinking', 'Language, writing, and communication', 'Art, design, music, or creative expression', 'People skills, empathy, and emotional intelligence'] },
]

// CAPS subjects for the marks dropdown
export const CAPS_SUBJECTS = [
  'English Home Language', 'English First Additional Language',
  'Afrikaans Home Language', 'Afrikaans First Additional Language',
  'isiZulu Home Language', 'isiXhosa Home Language',
  'Sesotho Home Language', 'Setswana Home Language', 'Other Language',
  'Mathematics', 'Mathematical Literacy', 'Life Orientation',
  'Physical Sciences', 'Life Sciences', 'Geography', 'History',
  'Business Studies', 'Economics', 'Accounting',
  'Information Technology', 'Computer Applications Technology',
  'Technical Mathematics', 'Technical Sciences',
  'Visual Arts', 'Dramatic Arts', 'Music', 'Design',
  'Agricultural Sciences', 'Consumer Studies', 'Hospitality Studies',
  'Tourism', 'Engineering Graphics and Design',
  'Civil Technology', 'Electrical Technology', 'Mechanical Technology',
]

export const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Term 4']
export const TOTAL_QUESTIONS = QUESTIONS.length  // 49

// Filter questions and sections based on career stage
export function getQuestionsForStage(stage) {
  // Filter sections that include this stage
  const filteredSections = SECTIONS.filter(s => s.stages && s.stages.includes(stage))

  // Get the indices of filtered sections
  const sectionIndices = SECTIONS
    .map((s, i) => s.stages && s.stages.includes(stage) ? i : -1)
    .filter(i => i !== -1)

  // Filter questions that (1) have this stage and (2) are in a section we're showing
  const filteredQuestions = QUESTIONS.filter(q =>
    q.stages && q.stages.includes(stage) && sectionIndices.includes(q.section)
  )

  // Remap section indices to new filtered sections
  const sectionMap = {}
  sectionIndices.forEach((oldIdx, newIndex) => {
    sectionMap[oldIdx] = newIndex
  })

  const remappedQuestions = filteredQuestions.map(q => ({
    ...q,
    section: sectionMap[q.section]
  }))

  return { questions: remappedQuestions, sections: filteredSections }
}
