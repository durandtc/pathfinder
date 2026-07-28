// ============================================================
// PickMyPath — RIASEC Career Database
// Maps Holland RIASEC codes to realistic South African careers
// Based on O*Net, Truity, Job Cannon, and SA labour market data
// ============================================================

// Database of careers organized by three-letter RIASEC codes
// Format: { riasecCode: "ABC", title, matchPct, summary, dayInLife, salaryRange, etc. }
//
// Note: This database is designed to expand career recommendations from 3 to 6+
// All careers are original mappings, not copied from existing tests

export const CAREER_DATABASE = {
  // Investigative-Realistic-Enterprising (IRE)
  'IRE': [
    { title: 'Software Engineer / Tech Lead', description: 'Problem-solver who builds systems and leads technical teams' },
    { title: 'Engineering Manager', description: 'Technical expert managing projects and people' },
    { title: 'Product Manager (Tech)', description: 'Bridge between technical capability and market needs' },
  ],

  // Investigative-Realistic-Social (IRS)
  'IRS': [
    { title: 'Civil Engineer (Infrastructure)', description: 'Designs practical solutions for communities' },
    { title: 'Environmental Health Practitioner', description: 'Solves public health problems through investigation and action' },
    { title: 'Urban Planner', description: 'Researches and designs community spaces' },
  ],

  // Investigative-Realistic-Conventional (IRC)
  'IRC': [
    { title: 'Electrical Technician / Technologist', description: 'Investigates and maintains electrical systems' },
    { title: 'Data Analyst (Technical)', description: 'Analyzes and optimizes technical systems' },
    { title: 'Laboratory Technician', description: 'Conducts testing and analysis in structured environments' },
  ],

  // Investigative-Artistic-Social (IAS)
  'IAS': [
    { title: 'Educational Psychologist', description: 'Investigates learning, designs interventions, supports students' },
    { title: 'Graphic Designer (UX/UI)', description: 'Solves user problems through creative design' },
    { title: 'Content Strategist (Digital)', description: 'Researches audience and creates meaningful content' },
  ],

  // Investigative-Artistic-Enterprising (IAE)
  'IAE': [
    { title: 'UX/UI Designer', description: 'Researches user needs and creates innovative interfaces' },
    { title: 'Digital Marketing Strategist', description: 'Analyzes data to drive creative campaigns' },
    { title: 'Creative Technologist', description: 'Combines research, design, and business strategy' },
  ],

  // Investigative-Social-Artistic (ISA)
  'ISA': [
    { title: 'Counselling Psychologist', description: 'Investigates human experience, creates therapeutic support' },
    { title: 'Health Journalist / Science Communicator', description: 'Researches and communicates health topics creatively' },
    { title: 'Educational Content Designer', description: 'Creates learning experiences based on research' },
  ],

  // Investigative-Social-Enterprising (ISE)
  'ISE': [
    { title: 'Management Consultant (Healthcare/Education)', description: 'Analyzes organizations and leads change' },
    { title: 'Public Health Specialist', description: 'Researches health issues and advocates for communities' },
    { title: 'Researcher (Applied)', description: 'Investigates real-world problems to solve them' },
  ],

  // Investigative-Social-Conventional (ISC)
  'ISC': [
    { title: 'Clinical Data Manager', description: 'Analyzes health data in structured systems' },
    { title: 'Medical Records Specialist', description: 'Manages health information with precision' },
    { title: 'Research Coordinator', description: 'Organizes and supports research projects' },
  ],

  // Investigative-Enterprising (IE)
  'IE': [
    { title: 'Entrepreneur (Tech/Science)', description: 'Investigates markets and launches innovative ventures' },
    { title: 'Consultant (Technical)', description: 'Analyzes problems and advises organizations' },
    { title: 'Product Developer', description: 'Researches and commercializes new products' },
  ],

  // Realistic-Investigative-Enterprising (RIE)
  'RIE': [
    { title: 'Mining Engineer / Engineering Manager', description: 'Designs and manages mining operations' },
    { title: 'Project Manager (Construction/Engineering)', description: 'Leads technical projects with precision' },
    { title: 'Technical Sales Engineer', description: 'Sells complex technical solutions' },
  ],

  // Realistic-Investigative-Social (RIS)
  'RIS': [
    { title: 'Environmental Scientist', description: 'Investigates environmental problems through practical fieldwork' },
    { title: 'Agricultural Scientist', description: 'Develops practical solutions for farming' },
    { title: 'Marine Biologist', description: 'Studies ocean ecosystems hands-on' },
  ],

  // Realistic-Social-Investigative (RSI)
  'RSI': [
    { title: 'Occupational Health & Safety Officer', description: 'Investigates workplace hazards and protects workers' },
    { title: 'Skills Development Facilitator', description: 'Teaches practical skills with research-backed methods' },
    { title: 'Apprenticeship Coordinator', description: 'Manages practical training programs' },
  ],

  // Realistic-Social-Enterprising (RSE)
  'RSE': [
    { title: 'Entrepreneur (Trade/Manufacturing)', description: 'Builds a business in trades or production' },
    { title: 'Operations Manager (Manufacturing)', description: 'Leads teams and physical operations' },
    { title: 'Small Business Owner (Service)', description: 'Manages hands-on service business' },
  ],

  // Realistic-Enterprising (RE)
  'RE': [
    { title: 'Business Owner (Construction/Trades)', description: 'Builds a business around practical skills' },
    { title: 'Site Manager (Construction)', description: 'Leads construction projects and teams' },
    { title: 'Sales Manager (Physical Products)', description: 'Leads sales of tangible products' },
  ],

  // Realistic-Conventional (RC)
  'RC': [
    { title: 'Technician (Mechanical/Electrical)', description: 'Maintains and repairs systems precisely' },
    { title: 'Mechanic', description: 'Diagnoses and fixes vehicles/equipment' },
    { title: 'Quality Control Inspector', description: 'Ensures products meet standards' },
  ],

  // Artistic-Investigative-Social (AIS)
  'AIS': [
    { title: 'Graphic Designer (Healthcare/Education)', description: 'Creates visual solutions for health/education' },
    { title: 'Researcher (Creative Industries)', description: 'Studies creative practices and audiences' },
    { title: 'Content Creator (Educational)', description: 'Creates educational content creatively' },
  ],

  // Artistic-Social-Investigative (ASI)
  'ASI': [
    { title: 'Social Media Manager', description: 'Creates content that connects with audiences' },
    { title: 'Creative Director (NGO/Education)', description: 'Leads creative projects with social impact' },
    { title: 'Photographer / Videographer', description: 'Captures visual stories for communities' },
  ],

  // Artistic-Social-Enterprising (ASE)
  'ASE': [
    { title: 'Creative Entrepreneur (Art/Design)', description: 'Builds a business around creative skills' },
    { title: 'Event Planner', description: 'Creates memorable experiences and manages teams' },
    { title: 'Marketing Manager (Creative)', description: 'Leads creative marketing campaigns' },
  ],

  // Artistic-Enterprising (AE)
  'AE': [
    { title: 'Entrepreneur (Creative/Design)', description: 'Launches business in creative field' },
    { title: 'Creative Business Owner', description: 'Builds brand and leads creative team' },
    { title: 'Sales (Art/Design/Media)', description: 'Sells creative products or services' },
  ],

  // Social-Investigative-Artistic (SIA)
  'SIA': [
    { title: 'Art Therapist', description: 'Uses creative expression to support healing' },
    { title: 'Community Development Worker', description: 'Researches and supports community needs creatively' },
    { title: 'Museum Educator', description: 'Creates learning experiences through art and history' },
  ],

  // Social-Artistic-Investigative (SAI)
  'SAI': [
    { title: 'Teacher (Arts/Humanities)', description: 'Educates through creative and analytical methods' },
    { title: 'Drama/Music Therapist', description: 'Heals through creative expression' },
    { title: 'University Lecturer (Creative Field)', description: 'Teaches and researches creative disciplines' },
  ],

  // Social-Artistic-Enterprising (SAE)
  'SAE': [
    { title: 'Entrepreneur (Entertainment/Arts)', description: 'Builds business in entertainment or arts' },
    { title: 'Event Manager', description: 'Creates and manages events for audiences' },
    { title: 'Artist Manager / Producer', description: 'Manages creative talent and productions' },
  ],

  // Social-Enterprising (SE)
  'SE': [
    { title: 'Business Manager (People-Focused)', description: 'Leads organizations with focus on people' },
    { title: 'Entrepreneur (Service-Based)', description: 'Launches people-focused business' },
    { title: 'Sales Manager', description: 'Leads sales team' },
  ],

  // Social-Conventional (SC)
  'SC': [
    { title: 'Human Resources Specialist', description: 'Manages people and processes' },
    { title: 'Office Manager', description: 'Organizes team and operations' },
    { title: 'Administrator (Healthcare/Education)', description: 'Manages support services' },
  ],

  // Enterprising-Realistic (ER)
  'ER': [
    { title: 'Entrepreneur (Construction/Trades)', description: 'Launches business in practical field' },
    { title: 'Sales Manager (Physical Products)', description: 'Leads sales of tangible products' },
    { title: 'Operations Entrepreneur', description: 'Builds business around operations' },
  ],

  // Enterprising-Investigative (EI)
  'EI': [
    { title: 'Entrepreneur (Tech/Innovation)', description: 'Launches tech-based venture' },
    { title: 'Venture Capitalist / Business Angel', description: 'Invests in innovative companies' },
    { title: 'Management Consultant', description: 'Advises organizations on strategy' },
  ],

  // Enterprising-Artistic (EA)
  'EA': [
    { title: 'Entrepreneur (Creative)', description: 'Launches creative business' },
    { title: 'Marketing Director', description: 'Leads creative marketing strategy' },
    { title: 'Entertainment Producer', description: 'Produces films, music, events' },
  ],

  // Enterprising-Social (ES)
  'ES': [
    { title: 'Entrepreneur (Service)', description: 'Launches people-focused business' },
    { title: 'Non-Profit Director', description: 'Leads organization with social mission' },
    { title: 'Community Leader / Advocate', description: 'Leads community change' },
  ],

  // Conventional-Realistic (CR)
  'CR': [
    { title: 'Systems Administrator (IT)', description: 'Manages technical systems and infrastructure' },
    { title: 'Technician (Structured)', description: 'Maintains systems precisely' },
    { title: 'Quality Assurance Specialist', description: 'Ensures quality in operations' },
  ],

  // Conventional-Investigative (CI)
  'CI': [
    { title: 'Data Analyst', description: 'Analyzes data in structured ways' },
    { title: 'Actuary', description: 'Analyzes risk and statistics' },
    { title: 'Research Assistant (Quantitative)', description: 'Supports structured research' },
  ],

  // Conventional-Social (CS)
  'CS': [
    { title: 'Manager (Human Resources)', description: 'Manages HR systems and people' },
    { title: 'Administrator', description: 'Manages organizational processes' },
    { title: 'Office Manager', description: 'Organizes office and teams' },
  ],

  // Conventional (C only)
  'C': [
    { title: 'Accountant', description: 'Manages financial systems precisely' },
    { title: 'Administrator (Executive)', description: 'Supports executives and processes' },
    { title: 'Data Entry Specialist', description: 'Manages information systematically' },
  ],

  // Single types with multiple careers
  'R': [
    { title: 'Plumber', description: 'Fixes practical problems' },
    { title: 'Electrician', description: 'Installs and repairs electrical systems' },
    { title: 'Mechanic', description: 'Repairs vehicles and equipment' },
  ],

  'I': [
    { title: 'Scientist (Research)', description: 'Investigates phenomena' },
    { title: 'Researcher', description: 'Studies topics in depth' },
    { title: 'Analyst', description: 'Analyzes systems and data' },
  ],

  'A': [
    { title: 'Artist', description: 'Creates original artwork' },
    { title: 'Designer', description: 'Creates visual solutions' },
    { title: 'Writer / Journalist', description: 'Creates written content' },
  ],

  'S': [
    { title: 'Teacher', description: 'Educates and supports learners' },
    { title: 'Counselor', description: 'Supports people emotionally' },
    { title: 'Social Worker', description: 'Helps communities and individuals' },
  ],

  'E': [
    { title: 'Entrepreneur', description: 'Starts and runs business' },
    { title: 'Manager', description: 'Leads teams and organizations' },
    { title: 'Sales Director', description: 'Leads sales efforts' },
  ],
}

// Helper function: get careers for a given RIASEC code
export function getCareersForCode(riasecCode) {
  // Try exact match first
  if (CAREER_DATABASE[riasecCode]) {
    return CAREER_DATABASE[riasecCode]
  }

  // If not found, try permutations (e.g., IRE could try RI, RE, etc.)
  const chars = riasecCode.split('').sort().join('')
  if (CAREER_DATABASE[chars]) {
    return CAREER_DATABASE[chars]
  }

  // Fallback: return generic careers
  return [
    { title: 'Career Advisor', description: 'Helps people explore career paths' },
    { title: 'Generalist Professional', description: 'Works across multiple domains' },
  ]
}

// Helper function: expand a 3-letter code to get up to 6 careers
// Returns array of careers suitable for expansion to 6+ recommendations
export function expandCareersForCode(riasecCode) {
  const careers = getCareersForCode(riasecCode)
  if (careers.length >= 6) return careers.slice(0, 6)

  // If not enough careers for this exact code, try related codes
  // For example, if IRE has 3 careers, also pull from IR, RE, IE combinations
  const additionalCareers = []
  const [primary, secondary, tertiary] = riasecCode.split('')

  // Try two-letter combinations
  const combos = [
    primary + secondary,
    primary + tertiary,
    secondary + tertiary,
  ]

  for (const combo of combos) {
    if (CAREER_DATABASE[combo]) {
      const relatedCareers = CAREER_DATABASE[combo]
      for (const career of relatedCareers) {
        // Avoid duplicates
        if (!careers.find(c => c.title === career.title) && !additionalCareers.find(c => c.title === career.title)) {
          additionalCareers.push(career)
          if (careers.length + additionalCareers.length >= 6) break
        }
      }
    }
    if (careers.length + additionalCareers.length >= 6) break
  }

  return [...careers, ...additionalCareers].slice(0, 6)
}
