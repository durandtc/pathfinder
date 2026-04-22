import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../../components/Nav'
import Link from 'next/link'

const AI_COLOR = { high: '#2d7a4f', medium: '#854f0b', low: '#a32d2d' }
const AI_BG    = { high: '#f0fff4', medium: '#fff8ec', low: '#fff0f0' }

function SectionLabel({ children }) {
  return <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold)', fontWeight: 500, marginBottom: '0.5rem', marginTop: '1.1rem' }}>{children}</h4>
}

export default function ReportPage() {
  const router = useRouter()
  const { id } = router.query
  const [report, setReport] = useState(null)
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (u) setUser(JSON.parse(u))
    if (id) fetchReport()
  }, [id])

  async function fetchReport() {
    try {
      const res  = await fetch(`/api/assessment/report?id=${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Report not found')
      setReport(data.report)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  if (loading) return (<><Nav /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-mid)' }}>Loading your report...</p></div></>)
  if (error)   return (<><Nav /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-mid)' }}>{error}</p></div></>)
  if (!report) return null

  const rd      = report.top_careers
  const careers = rd?.careers || []
  const riasec  = rd?.riasec_profile
  const date    = new Date(report.generated_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <Head><title>Your Career Report — PickMyPath</title></Head>
      <Nav />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Report header */}
        <div style={{ background: 'var(--navy)', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>
            {user?.fullName ? `${user.fullName}'s` : 'Your'} Career Report
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginBottom: '1rem' }}>Generated on {date} · PickMyPath</p>
          {riasec?.dominant_types?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
              <span style={{ background: 'rgba(201,151,58,0.25)', color: '#e8b856', border: '1px solid rgba(201,151,58,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 500 }}>
                RIASEC: {riasec.dominant_types.join(' · ')}
              </span>
            </div>
          )}
          {riasec?.summary && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 300 }}>{riasec.summary}</p>}
        </div>

        {/* Academic observations — only show if present */}
        {rd?.academic_observations && (
          <div style={{ background: '#f0f7ff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', border: '1px solid #b5d4f4' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1rem', marginBottom: '0.5rem' }}>📊 What your marks tell us</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{rd.academic_observations}</p>
          </div>
        )}

        {/* Career cards */}
        {careers.map((c, i) => (
          <div key={i} style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
            <div style={{ background: 'var(--cream)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 34, height: 34, background: 'var(--navy)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, flexShrink: 0 }}>{c.rank}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', color: 'var(--navy)', margin: 0 }}>{c.title}</h2>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>{c.match_pct}%</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Match</div>
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <SectionLabel>About this career</SectionLabel>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{c.summary}</p>

              {c.academic_fit && (
                <>
                  <SectionLabel>Your academic position</SectionLabel>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>{c.academic_fit}</p>
                </>
              )}

              <SectionLabel>Required Grade 10–12 subjects</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                {(c.subjects_required || []).map(s => <span key={s} style={{ background: '#e8f0f8', color: '#1a3260', borderRadius: 6, padding: '3px 9px', fontSize: '0.8rem', fontWeight: 500 }}>{s}</span>)}
              </div>
              {c.subjects_recommended?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {c.subjects_recommended.map(s => <span key={s} style={{ background: '#e8f5e8', color: '#1a4d1a', borderRadius: 6, padding: '3px 9px', fontSize: '0.8rem', fontWeight: 500 }}>✓ {s}</span>)}
                </div>
              )}

              <SectionLabel>NSC grades & APS requirements</SectionLabel>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', margin: '0 0 2px', fontWeight: 500 }}>{c.nsc_grades}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', margin: '0 0 2px' }}>{c.aps_score}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', fontStyle: 'italic', margin: 0 }}>{c.study_path}</p>

              <SectionLabel>AI impact on this career</SectionLabel>
              <div style={{ background: AI_BG[c.ai_resilience] || '#fff8ec', borderLeft: `3px solid ${AI_COLOR[c.ai_resilience] || 'var(--gold)'}`, borderRadius: '0 8px 8px 0', padding: '10px 12px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>{c.ai_impact}</p>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: 6, color: AI_COLOR[c.ai_resilience] || 'var(--gold)', margin: '6px 0 0' }}>
                  AI resilience: {(c.ai_resilience || 'medium').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Subject advice */}
        {rd?.subject_advice && (
          <div style={{ background: '#f0f7ff', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Subject selection advice</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{rd.subject_advice}</p>
          </div>
        )}

        {/* Parent note */}
        {rd?.parent_note && (
          <div style={{ background: '#eeedfe', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid #afa9ec' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', color: '#3c3489', marginBottom: '0.75rem', fontSize: '1.1rem' }}>👨‍👩‍👧 A note for the parent</h3>
            <p style={{ fontSize: '0.9rem', color: '#534ab7', lineHeight: 1.7, margin: 0 }}>{rd.parent_note}</p>
          </div>
        )}

        {/* Motivational note */}
        {rd?.motivational_note && (
          <div style={{ background: '#f0fff4', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>A note for you</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{rd.motivational_note}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button onClick={() => window.print()} style={{ flex: 1, minWidth: 140, padding: '13px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}>
            🖨 Print / Save as PDF
          </button>
          <Link href="/dashboard" style={{ flex: 1, minWidth: 140, padding: '12px', background: 'transparent', color: 'var(--navy)', border: '1.5px solid var(--navy)', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
          PickMyPath is a guidance tool based on Holland RIASEC + academic performance. We recommend discussing your results with a registered school counsellor or career guidance professional.
        </p>
      </div>
    </>
  )
}
