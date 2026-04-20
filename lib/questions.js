// ============================================================
// PathFinder SA — Assessment Question Bank
// Based on Holland RIASEC + Career Values + Self-Reported Aptitude
// ============================================================

export const SECTIONS = [
  {
    id: 'interests',
    title: 'Career Interest Inventory',
    subtitle: "Based on Holland's RIASEC model — there are no right or wrong answers, just be honest about what you genuinely enjoy.",
    color: '#1a3260',
  },
  {
    id: 'values',
    title: 'Career Values & Work Environment',
    subtitle: 'Tell us about the kind of work you find meaningful and the environment where you would thrive.',
    color: '#0f6e56',
  },
  {
    id: 'aptitude',
    title: 'Self-Reported Strengths & Aptitude',
    subtitle: 'Reflect honestly on your own strengths — this helps weight your career matches accurately.',
    color: '#854f0b',
  },
]

export const QUESTIONS = [
  // ── SECTION 1: INTERESTS (RIASEC) ─────────────────────── //
  // Realistic
  { section: 0, type: 'scale', text: 'I enjoy working with my hands — building, fixing, or making things.' },
  { section: 0, type: 'scale', text: 'I prefer working with tools, machines, or physical equipment rather than paperwork.' },
  { section: 0, type: 'scale', text: 'I enjoy outdoor activities or working in a physical environment.' },
  // Investigative
  { section: 0, type: 'scale', text: 'I enjoy investigating problems and figuring out how and why things work.' },
  { section: 0, type: 'scale', text: 'I like science subjects and understanding how the natural world works.' },
  { section: 0, type: 'scale', text: 'I ask a lot of questions and enjoy researching topics in depth.' },
  // Artistic
  { section: 0, type: 'scale', text: 'I enjoy creative activities like art, music, writing, or design.' },
  { section: 0, type: 'scale', text: 'I often come up with new and original ideas.' },
  { section: 0, type: 'scale', text: 'I like expressing myself through creative projects.' },
  // Social
  { section: 0, type: 'scale', text: 'I enjoy helping, teaching, or caring for other people.' },
  { section: 0, type: 'scale', text: 'Making a positive difference in other people\'s lives is very important to me.' },
  { section: 0, type: 'scale', text: 'I find it easy to understand and empathise with how others feel.' },
  // Enterprising
  { section: 0, type: 'scale', text: 'I enjoy leading projects and persuading or motivating others.' },
  { section: 0, type: 'scale', text: 'I feel energised when I am in charge of a project or team.' },
  // Conventional
  { section: 0, type: 'scale', text: 'I prefer tasks with clear rules, structure, and measurable outcomes.' },

  // ── SECTION 2: VALUES ─────────────────────────────────── //
  {
    section: 1, type: 'choice',
    text: 'Which type of task sounds most appealing to you?',
    options: [
      'Designing or building something physical (a structure, product, machine)',
      'Diagnosing a problem or doing scientific research',
      'Writing, illustrating, or creating original content',
      'Coaching, mentoring, or supporting another person',
    ],
  },
  {
    section: 1, type: 'choice',
    text: 'What kind of workplace would you most prefer?',
    options: [
      'A workshop, site, lab, or outdoors environment',
      'A research institution, hospital, or technical office',
      'A creative studio, agency, or media company',
      'A school, clinic, NGO, or community setting',
    ],
  },
  {
    section: 1, type: 'choice',
    text: 'Which school subject do you enjoy the most right now?',
    options: [
      'Mathematics or Physical Science',
      'Life Sciences or Geography',
      'Art, Design, Dramatic Arts, or Languages',
      'History, Economics, Life Orientation, or Business Studies',
    ],
  },
  {
    section: 1, type: 'choice',
    text: 'What matters most to you in a future career?',
    options: [
      'Building something tangible and lasting',
      'Discovering new knowledge or solving complex problems',
      'Expressing creativity and original thinking',
      'Helping people grow, heal, or succeed',
    ],
  },
  {
    section: 1, type: 'choice',
    text: 'How do you prefer to solve problems?',
    options: [
      'Using tools, prototypes, experiments, or hands-on trial and error',
      'Research, data analysis, and logical step-by-step reasoning',
      'Brainstorming creative or unconventional ideas',
      'Talking it through with others and building consensus',
    ],
  },
  {
    section: 1, type: 'choice',
    text: 'Pick the statement that best describes you:',
    options: [
      'I like to see concrete, physical results from my work',
      'I enjoy complex intellectual challenges above everything else',
      'I value self-expression and originality most',
      'I am most fulfilled when I have genuinely helped someone',
    ],
  },
  {
    section: 1, type: 'choice',
    text: 'How do you feel about working with technology in your career?',
    options: [
      'I want to build or engineer the technology itself',
      'I want to use technology to research and discover',
      'I want to use technology as a creative tool',
      'Technology is secondary — people and relationships are my focus',
    ],
  },

  // ── SECTION 3: APTITUDE ───────────────────────────────── //
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
  {
    section: 2, type: 'choice',
    text: 'What best describes your academic strengths?',
    options: [
      'Numbers, formulas, and logical thinking',
      'Writing, reading, and verbal communication',
      'Visual thinking, spatial reasoning, and creativity',
      'Understanding people, social dynamics, and human behaviour',
    ],
  },
  {
    section: 2, type: 'choice',
    text: 'Which task would you find least difficult?',
    options: [
      'Solving a complex maths or physics problem',
      'Writing a well-structured persuasive essay',
      'Designing a logo, layout, or illustration',
      'Giving a confident presentation to your class',
    ],
  },
  {
    section: 2, type: 'choice',
    text: 'How would your close friends most likely describe you?',
    options: [
      'Analytical, rational, and logical',
      'Creative, expressive, and imaginative',
      'Caring, supportive, and empathetic',
      'Driven, ambitious, and goal-oriented',
    ],
  },
  {
    section: 2, type: 'choice',
    text: 'What is your biggest current academic challenge?',
    options: [
      'Maths or science concepts',
      'Writing or expressing ideas clearly',
      'Staying organised and managing deadlines',
      'Group projects and working with others',
    ],
  },
  {
    section: 2, type: 'choice',
    text: 'Looking ahead to your future career, what do you value most?',
    options: [
      'Financial security and a strong, stable salary',
      'Work-life balance, flexibility, and freedom',
      'Making a meaningful social impact',
      'Status, recognition, and professional achievement',
    ],
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length  // 45
