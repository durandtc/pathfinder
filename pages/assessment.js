import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import { QUESTIONS, SECTIONS, CAPS_SUBJECTS, TERMS, TOTAL_QUESTIONS, getQuestionsForStage } from '../lib/questions'

const EMPTY_MARK = { subject: '', term1: '', term2: '', term3: '', term4: '' }

export default function Assessment() {
  const router = useRouter()
  const [user, setUser]         = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers]   = useState({})
  const [marks, setMarks]       = useState([{ ...EMPTY_MARK }, { ...EMPTY_MARK }, { ...EMPTY_MARK }, { ...EMPTY_MARK }, { ...EMPTY_MARK }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const [filteredQuestions, setFilteredQuestions] = useState(QUESTIONS)
  const [filteredSections, setFilteredSections] = useState(SECTIONS)

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    setUser(parsed)

    // Get questions filtered by user's stage
    const { questions, sections } = getQuestionsForStage(parsed.grade || 'grade_9')
    setFilteredQuestions(questions)
    setFilteredSections(sections)

    const savedAnswers = localStorage.getItem('pmp_answers')
    const savedMarks   = localStorage.getItem('pmp_marks')
    const savedQuestion = localStorage.getItem('pmp_currentQ')

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers))
    if (savedMarks)   setMarks(JSON.parse(savedMarks))
    if (savedQuestion) setCurrentQ(parseInt(savedQuestion, 10))
  }, [])

  function selectAnswer(val) {
    const updated = { ...answers, [currentQ]: val }
    setAnswers(updated)
    localStorage.setItem('pmp_answers', JSON.stringify(updated))
  }

  function updateMark(rowIdx, field, val) {
    const updated = marks.map((m, i) => i === rowIdx ? { ...m, [field]: val } : m)
    setMarks(updated)
    localStorage.setItem('pmp_marks', JSON.stringify(updated))
  }

  function addMarkRow() {
    setMarks([...marks, { ...EMPTY_MARK }])
  }

  function removeMarkRow(idx) {
    if (marks.length <= 1) return
    setMarks(marks.filter((_, i) => i !== idx))
  }

  function goNext() {
    if (!isMarksScreen && answers[currentQ] === undefined) {
      setError('Please answer this question before continuing.')
      return
    }
    setError('')
    if (currentQ === MARKS_IDX) {
      submitAssessment()
    } else {
      const nextQ = currentQ + 1
      setCurrentQ(nextQ)
      localStorage.setItem('pmp_currentQ', String(nextQ))
    }
  }

  function goBack() {
    if (currentQ > 0) {
      setError('')
      const prevQ = currentQ - 1
      setCurrentQ(prevQ)
      localStorage.setItem('pmp_currentQ', String(prevQ))
    }
  }

  async function submitAssessment() {
    setSubmitting(true)
    const validMarks = marks.filter(m => m.subject && (m.term1 || m.term2 || m.term3 || m.term4))
    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers, marks: validMarks }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      localStorage.removeItem('pmp_answers')
      localStorage.removeItem('pmp_marks')
      localStorage.removeItem('pmp_currentQ')
      router.push(`/report/${data.reportId}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (!user || filteredQuestions.length === 0) return null

  const TOTAL_FILTERED_QUESTIONS = filteredQuestions.length
  const MARKS_IDX = TOTAL_FILTERED_QUESTIONS
  const isMarksScreen = currentQ === MARKS_IDX

  if (submitting) return (
    <>
      <Head><title>Analysing — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, border: '3px solid var(--cream-mid)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', marginBottom: '1.5rem' }} />
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Analysing your profile...</h2>
        <p style={{ color: 'var(--text-mid)', fontWeight: 300, maxWidth: 440, lineHeight: 1.7 }}>
          Our AI is processing your answers, your parent's observations, and your academic marks together. This gives you a much more accurate result. Please wait — this takes about 30 seconds.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  )

  // Calculate progress — marks screen counts as the last step (only for students)
  const hasMarksSection = filteredSections.some(s => s.id === 'marks')
  const totalSteps = TOTAL_FILTERED_QUESTIONS + (hasMarksSection ? 1 : 0)
  const pct = Math.round(((currentQ + 1) / totalSteps) * 100)

  // Current section info
  const q = !isMarksScreen ? filteredQuestions[currentQ] : null
  const currentSection = isMarksScreen
    ? filteredSections.find(s => s.id === 'marks')
    : filteredSections[q?.section]
  const isParentSection = isMarksScreen || q?.section === filteredSections.findIndex(s => s.id === 'parent')

  return (
    <>
      <Head><title>Assessment — PickMyPath</title></Head>
      <Nav />
      {/* Parent Alert Banner - Sticky */}
      {isParentSection && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(90deg, #c9973a 0%, #e8b856 50%, #c9973a 100%)',
          padding: '1rem 2rem',
          boxShadow: '0 4px 12px rgba(201, 151, 58, 0.3)',
          zIndex: 50,
          textAlign: 'center',
          animation: 'slideDown 0.4s ease'
        }}>
          <style>{`@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }`}</style>
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👨‍👩‍👧‍👦</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#0f1f3d', fontSize: '1rem', lineHeight: 1.2 }}>Parent / Guardian — It's Your Turn Now</div>
              <div style={{ fontWeight: 300, color: 'rgba(15,31,61,0.8)', fontSize: '0.875rem', marginTop: '2px' }}>Your observations and their school marks are crucial for an accurate career match.</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 700, margin: '0 auto', padding: isParentSection ? '7.5rem 1.5rem 2.5rem 1.5rem' : '2.5rem 1.5rem' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 6 }}>
            <span>{isMarksScreen ? 'Final step' : `Question ${currentQ + 1} of ${TOTAL_FILTERED_QUESTIONS}${hasMarksSection ? ' + marks' : ''}`}</span>
            <span>{pct}% complete</span>
          </div>
          <div style={{ background: 'var(--cream-mid)', borderRadius: 99, height: 6 }}>
            <div style={{ background: isParentSection ? 'linear-gradient(90deg, #3c3489, #c9973a)' : 'linear-gradient(90deg, var(--navy), var(--gold))', height: '100%', borderRadius: 99, width: `${pct}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Section header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.35rem', color: 'var(--navy)', marginBottom: 4 }}>{currentSection.title}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.6 }}>{currentSection.subtitle}</p>
        </div>

        {/* ── MARKS SCREEN ── */}
        {isMarksScreen && (
          <div>
            <div style={{ background: '#e8f0f8', border: '1px solid #b5d4f4', borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#1a3260' }}>
              Add as many subjects as you have marks for. You don't need all four terms — just fill in what you have. Leave blank subjects empty.
            </div>
            {marks.map((row, i) => (
              <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem', boxShadow: '0 1px 4px rgba(15,31,61,0.05)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <select
                    value={row.subject}
                    onChange={e => updateMark(i, 'subject', e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: '0.875rem', background: 'var(--cream)', color: 'var(--text-dark)' }}
                  >
                    <option value="">Select subject...</option>
                    {CAPS_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {marks.length > 1 && (
                    <button onClick={() => removeMarkRow(i)} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}>✕</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {TERMS.map((term, ti) => (
                    <div key={term}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{term}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number" min="0" max="100"
                          placeholder="—"
                          value={row[`term${ti + 1}`]}
                          onChange={e => updateMark(i, `term${ti + 1}`, e.target.value)}
                          style={{ width: '100%', padding: '7px 24px 7px 8px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: '0.875rem', background: 'var(--cream)', color: 'var(--text-dark)' }}
                        />
                        <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-light)' }}>%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={addMarkRow} style={{ background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: 8, padding: '10px', width: '100%', color: 'var(--text-mid)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              + Add another subject
            </button>
          </div>
        )}

        {/* ── QUESTION CARD ── */}
        {!isMarksScreen && (
          <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '1.75rem', marginBottom: '1rem', boxShadow: '0 2px 12px rgba(15,31,61,0.06)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.text}</p>

            {q.type === 'scale' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                  <span>Strongly disagree</span><span>Strongly agree</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => selectAnswer(v)} style={{
                      flex: 1, minHeight: 48,
                      border: `1.5px solid ${answers[currentQ] === v ? 'var(--navy)' : 'var(--border)'}`,
                      borderRadius: 8,
                      background: answers[currentQ] === v ? 'var(--navy)' : 'var(--cream)',
                      color: answers[currentQ] === v ? '#fff' : 'var(--text-mid)',
                      fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    }}>{v}</button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(i)} style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px',
                    border: `1.5px solid ${answers[currentQ] === i ? 'var(--navy)' : 'var(--border)'}`,
                    borderRadius: 8,
                    background: answers[currentQ] === i ? 'var(--navy)' : 'var(--cream)',
                    color: answers[currentQ] === i ? '#fff' : 'var(--text-mid)',
                    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.4,
                  }}>{opt}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p style={{ color: '#a32d2d', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button onClick={goBack} style={{ visibility: currentQ === 0 ? 'hidden' : 'visible', background: 'transparent', color: 'var(--text-mid)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '11px 22px', cursor: 'pointer', fontSize: '0.9rem' }}>← Back</button>
          <button onClick={goNext} style={{ background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
            {isMarksScreen ? 'Submit & Generate Report ✓' : 'Next →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
          {Object.keys(answers).length} of {TOTAL_FILTERED_QUESTIONS} questions answered · progress auto-saved
        </p>
      </div>
    </>
  )
}
