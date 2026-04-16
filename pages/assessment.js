import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import { QUESTIONS, SECTIONS, TOTAL_QUESTIONS } from '../lib/questions'

export default function Assessment() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('pf_user')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    setUser(parsed)
    // Restore saved progress
    const saved = localStorage.getItem('pf_answers')
    if (saved) setAnswers(JSON.parse(saved))
  }, [])

  function selectAnswer(val) {
    const updated = { ...answers, [currentQ]: val }
    setAnswers(updated)
    localStorage.setItem('pf_answers', JSON.stringify(updated))
  }

  function goNext() {
    if (answers[currentQ] === undefined) {
      setError('Please answer this question before continuing.')
      return
    }
    setError('')
    if (currentQ === TOTAL_QUESTIONS - 1) {
      submitAssessment()
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  function goBack() {
    if (currentQ > 0) {
      setError('')
      setCurrentQ(currentQ - 1)
    }
  }

  async function submitAssessment() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      localStorage.removeItem('pf_answers')
      router.push(`/report/${data.reportId}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (!user) return null

  if (submitting) {
    return (
      <>
        <Head><title>Analysing — PathFinder SA</title></Head>
        <Nav />
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, border: '3px solid var(--cream-mid)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', marginBottom: '1.5rem' }} />
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Analysing your profile...</h2>
          <p style={{ color: 'var(--text-mid)', fontWeight: 300, maxWidth: 400 }}>Our AI is cross-referencing your answers with 100+ careers, CAPS subjects, and SA university requirements. This takes about 20 seconds.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    )
  }

  const q = QUESTIONS[currentQ]
  const section = SECTIONS[q.section]
  const pct = Math.round(((currentQ + 1) / TOTAL_QUESTIONS) * 100)
  const answeredCount = Object.keys(answers).length

  // Calculate which section we're in for display
  const sectionCounts = [0, 0, 0]
  QUESTIONS.forEach((qq, i) => { if (i <= currentQ) sectionCounts[qq.section]++ })

  return (
    <>
      <Head><title>Assessment — PathFinder SA</title></Head>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Progress */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 300 }}>
              Section {q.section + 1} of 3 · Question {currentQ + 1} of {TOTAL_QUESTIONS}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 300 }}>{pct}% complete</span>
          </div>
          <div style={{ background: 'var(--cream-mid)', borderRadius: 99, height: 6 }}>
            <div style={{ background: 'linear-gradient(90deg, var(--navy), var(--gold))', height: '100%', borderRadius: 99, width: `${pct}%`, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', color: 'var(--navy)', fontWeight: 700, marginBottom: 4 }}>{section.title}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', fontWeight: 300 }}>{section.subtitle}</p>
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 2px 12px rgba(15,31,61,0.06)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.text}</p>

          {q.type === 'scale' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => selectAnswer(v)}
                    style={{
                      flex: 1, minHeight: 48, border: `1.5px solid ${answers[currentQ] === v ? 'var(--navy)' : 'var(--border)'}`,
                      borderRadius: 8, background: answers[currentQ] === v ? 'var(--navy)' : 'var(--cream)',
                      color: answers[currentQ] === v ? '#fff' : 'var(--text-mid)',
                      fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{v}</button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px',
                    border: `1.5px solid ${answers[currentQ] === i ? 'var(--navy)' : 'var(--border)'}`,
                    borderRadius: 8,
                    background: answers[currentQ] === i ? 'var(--navy)' : 'var(--cream)',
                    color: answers[currentQ] === i ? '#fff' : 'var(--text-mid)',
                    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.4,
                  }}
                >{opt}</button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={goBack}
            style={{
              visibility: currentQ === 0 ? 'hidden' : 'visible',
              background: 'transparent', color: 'var(--text-mid)',
              border: '1.5px solid var(--border)', borderRadius: 8,
              padding: '12px 24px', cursor: 'pointer', fontSize: '0.95rem',
            }}
          >← Back</button>

          <button
            onClick={goNext}
            style={{
              background: 'var(--navy)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '12px 28px', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 500,
            }}
          >
            {currentQ === TOTAL_QUESTIONS - 1 ? 'Submit Assessment ✓' : 'Next →'}
          </button>
        </div>

        {/* Answered indicator */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-light)' }}>
          {answeredCount} of {TOTAL_QUESTIONS} questions answered · progress auto-saved
        </p>
      </div>
    </>
  )
}
