// ============================================================
// PickMyPath — Assessment Question Bank
// Frameworks: Holland RIASEC + Career Values + Self-Reported
//             Aptitude + Parent Observations + Academic Marks
// ============================================================

export const SECTIONS = [
  {
    id: 'interests',
    title: 'Career Interest Inventory',
    subtitle: "Answer honestly about what you genuinely enjoy — not what you think sounds impressive. There are no right or wrong answers here.",
    who: 'student',
  },
  {
    id: 'values',
    title: 'Career Values & Work Environment',
    subtitle: 'Tell us about the kind of work you find meaningful and the environment where you would thrive.',
    who: 'student',
  },
  {
    id: 'aptitude',
    title: 'Your Strengths & Abilities',
    subtitle: 'Reflect honestly on your own strengths — this helps us weight your career matches accurately.',
    who: 'student',
  },
  {
    id: 'parent',
    title: 'Parent / Guardian Observations',
    subtitle: 'Parents — please take over here. Answer based on what you observe about your child at home and in everyday life. Your outside perspective adds important context.',
    who: 'parent',
  },
  {
    id: 'marks',
    title: 'Academic & Professional Background',
    subtitle: 'Enter your child\'s subject marks using the most recent school report available. This is the most objective data in the entire assessment and significantly improves accuracy.',
    who: 'parent',
  },
]

export const QUESTIONS = [
  // ── SECTION 1: INTERESTS (RIASEC) ── 15 questions ──────────
  { section: 0, type: 'scale', riasec: 'R', text: 'I enjoy working with my hands — building, fixing, or making things.' },
  { section: 0, type: 'scale', riasec: 'R', text: 'I prefer working with tools, machines, or physical equipment rather than paperwork.' },
  { section: 0, type: 'scale', riasec: 'R', text: 'I enjoy outdoor activities or working in a physical environment.' },
  { section: 0, type: 'scale', riasec: 'I', text: 'I enjoy investigating problems and figuring out how and why things work.' },
  { section: 0, type: 'scale', riasec: 'I', text: 'I like science subjects and understanding how the natural world works.' },
  { section: 0, type: 'scale', riasec: 'I', text: 'I ask a lot of questions and enjoy researching topics in depth.' },
  { section: 0, type: 'scale', riasec: 'A', text: 'I enjoy creative activities like art, music, writing, or design.' },
  { section: 0, type: 'scale', riasec: 'A', text: 'I often come up with new and original ideas.' },
  { section: 0, type: 'scale', riasec: 'A', text: 'I like expressing myself through creative projects.' },
  { section: 0, type: 'scale', riasec: 'S', text: 'I enjoy helping, teaching, or caring for other people.' },
  { section: 0, type: 'scale', riasec: 'S', text: 'Making a positive difference in other people\'s lives is very important to me.' },
  { section: 0, type: 'scale', riasec: 'S', text: 'I find it easy to understand and empathise with how others feel.' },
  { section: 0, type: 'scale', riasec: 'E', text: 'I enjoy leading projects and persuading or motivating others.' },
  { section: 0, type: 'scale', riasec: 'E', text: 'I feel energised when I am in charge of a project or team.' },
  { section: 0, type: 'scale', riasec: 'C', text: 'I prefer tasks with clear rules, structure, and measurable outcomes.' },

  // ── SECTION 2: VALUES ── 7 questions ───────────────────────
  { section: 1, type: 'choice', text: 'Which type of task sounds most appealing to you?', options: ['Designing or building something physical (a structure, product, or machine)', 'Diagnosing a problem or doing scientific research', 'Writing, illustrating, or creating original content', 'Coaching, mentoring, or supporting another person'] },
  { section: 1, type: 'choice', text: 'What kind of workplace would you most prefer?', options: ['A workshop, construction site, lab, or outdoors', 'A research institution, hospital, or technical office', 'A creative studio, agency, or media company', 'A school, clinic, NGO, or community setting'] },
  { section: 1, type: 'choice', text: 'Which school subject do you enjoy the most right now?', options: ['Mathematics or Physical Science', 'Life Sciences or Geography', 'Art, Design, Dramatic Arts, or Languages', 'History, Economics, Life Orientation, or Business Studies'] },
  { section: 1, type: 'choice', text: 'What matters most to you in a future career?', options: ['Building something tangible and lasting', 'Discovering new knowledge or solving complex problems', 'Expressing creativity and original thinking', 'Helping people grow, heal, or succeed'] },
  { section: 1, type: 'choice', text: 'How do you prefer to solve problems?', options: ['Using tools, prototypes, experiments, or hands-on trial and error', 'Research, data analysis, and logical reasoning', 'Brainstorming creative or unconventional ideas', 'Talking it through with others and reaching consensus'] },
  { section: 1, type: 'choice', text: 'Pick the statement that best describes you:', options: ['I like to see concrete, physical results from my work', 'I enjoy complex intellectual challenges above everything else', 'I value self-expression and originality most', 'I am most fulfilled when I have genuinely helped someone'] },
  { section: 1, type: 'choice', text: 'How do you feel about working with technology in your career?', options: ['I want to build or engineer the technology itself', 'I want to use technology to research and discover', 'I want to use technology as a creative tool', 'Technology is secondary — people and relationships are my focus'] },

  // ── SECTION 3: APTITUDE ── 15 questions ────────────────────
  { section: 2, type: 'scale', text: 'I consider myself strong at maths and logical reasoning.' },
  { section: 2, type: 'scale', text: 'I communicate clearly and confidently, both in writing and speaking.' },
  { section: 2, type: 'scale', text: 'I pick up new computer and technology skills quickly.' },
  { section: 2, type: 'scale', text: 'I am well-organised, detail-oriented, and seldom miss deadlines.' },
  { section: 2, type: 'scale', text: 'I stay calm and focused when working under pressure.' },
  { section: 2, type: 'scale', text: 'I am naturally empathetic and good at reading people\'s emotions.' },
  { section: 2, type: 'scale', text: 'I enjoy taking on leadership roles and feel comfortable with responsibility.' },
  { section: 2, type: 'scale', text: 'I pick up creative or artistic skills (drawing, writing, music) easily.' },
  { section: 2, type: 'scale', text: 'I prefer working independently and am self-motivated without supervision.' },
  { section: 2, type: 'scale', text: 'I am confident presenting my ideas to a group or audience.' },
  { section: 2, type: 'choice', text: 'What best describes your academic strengths?', options: ['Numbers, formulas, and logical thinking', 'Writing, reading, and verbal communication', 'Visual thinking, spatial reasoning, and creativity', 'Understanding people, social dynamics, and human behaviour'] },
  { section: 2, type: 'choice', text: 'Which task would you find least difficult?', options: ['Solving a complex maths or physics problem', 'Writing a well-structured persuasive essay', 'Designing a logo, layout, or illustration', 'Giving a confident presentation to your class'] },
  { section: 2, type: 'choice', text: 'How would your close friends most likely describe you?', options: ['Analytical, rational, and logical', 'Creative, expressive, and imaginative', 'Caring, supportive, and empathetic', 'Driven, ambitious, and goal-oriented'] },
  { section: 2, type: 'choice', text: 'What is your biggest current academic challenge?', options: ['Maths or science concepts', 'Writing or expressing ideas clearly', 'Staying organised and managing deadlines', 'Group projects and working with others'] },
  { section: 2, type: 'choice', text: 'Looking ahead, what do you value most in a future career?', options: ['Financial security and a strong, stable salary', 'Work-life balance, flexibility, and freedom', 'Making a meaningful social impact', 'Status, recognition, and professional achievement'] },

  // ── SECTION 4: PARENT OBSERVATIONS ── 12 questions ─────────
  { section: 3, type: 'scale', who: 'parent', text: 'My child loses track of time when doing creative activities (drawing, writing, music, building).' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child naturally takes the lead when playing or working in groups.' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child asks a lot of questions about how things work and why.' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child shows genuine care and concern when others are struggling.' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child prefers structured tasks with clear rules over open-ended ones.' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child enjoys taking things apart, building, or working with their hands.' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child persists through difficult problems rather than giving up quickly.' },
  { section: 3, type: 'scale', who: 'parent', text: 'My child is highly organised and manages their own time well.' },
  { section: 3, type: 'choice', who: 'parent', text: 'When your child has free time with no obligations, they most often:', options: ['Build, make, fix, or create something physical', 'Read, research, watch documentaries, or explore ideas', 'Draw, write stories, play music, or do something creative', 'Spend time with friends or help someone with something'] },
  { section: 3, type: 'choice', who: 'parent', text: 'Which statement best describes your child\'s social style?', options: ['Prefers working alone and is highly self-sufficient', 'Works best in small, focused groups', 'Thrives in social situations and loves group activities', 'Leads naturally — others tend to follow their ideas'] },
  { section: 3, type: 'choice', who: 'parent', text: 'How does your child typically respond to a difficult challenge?', options: ['Analyses the problem carefully before acting', 'Jumps in hands-on and figures it out by doing', 'Looks for a creative or unconventional solution', 'Asks for input from others before deciding'] },
  { section: 3, type: 'choice', who: 'parent', text: 'Which area do you believe your child is naturally strongest in?', options: ['Mathematics, science, and logical thinking', 'Language, writing, and communication', 'Art, design, music, or creative expression', 'People skills, empathy, and emotional intelligence'] },
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
  // For students (grade 8-12), show all questions
  const isStudent = stage && stage.startsWith('grade_')

  if (isStudent) {
    return { questions: QUESTIONS, sections: SECTIONS }
  }

  // For post-school (gap_year, university_student, career_change, working_adult)
  // Only show sections where who='student': interests, values, aptitude
  const filteredSections = SECTIONS.filter(s => s.who === 'student')
  const sectionIndices = SECTIONS
    .map((s, i) => s.who === 'student' ? i : -1)
    .filter(i => i !== -1)

  const filteredQuestions = QUESTIONS.filter(q => sectionIndices.includes(q.section))

  // Remap section indices to new filtered sections
  const sectionMap = {}
  let newIdx = 0
  sectionIndices.forEach((oldIdx, newIndex) => {
    sectionMap[oldIdx] = newIndex
  })

  const remappedQuestions = filteredQuestions.map(q => ({
    ...q,
    section: sectionMap[q.section]
  }))

  return { questions: remappedQuestions, sections: filteredSections }
}
