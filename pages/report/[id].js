import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../../components/Nav'
import Link from 'next/link'
import { getStageConfig, isSchoolLearner } from '../../lib/stageConfig'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PRINT_STYLES = `
  @media print {
    body { margin: 0; padding: 0; background: #fff; }
    html { margin: 0; padding: 0; }
    nav, .action-buttons { display: none !important; }
    .print-no-break { page-break-inside: avoid; }
    .report-header { page-break-after: avoid; margin-bottom: 0.8rem !important; padding: 1.5rem !important; }
    .report-header h1 { color: #000 !important; margin-bottom: 0.25rem !important; font-size: 1.4rem !important; }
    .report-header p { color: #333 !important; margin-bottom: 0.4rem !important; font-size: 0.75rem !important; }
    .report-header hr { border-top-color: #ccc !important; margin: 0.4rem 0 !important; }
    .career-card { page-break-inside: avoid; margin-bottom: 0.8rem !important; }
    .career-card > div:first-child { padding: 0.9rem 1rem !important; }
    .career-card > div:last-child { padding: 0.9rem 1rem !important; }
    div[role="main"] { margin: 0; padding: 0.75rem !important; max-width: 100%; }
    @page { margin: 0.5in; size: A4; }

    /* Tighten report content spacing */
    div[style*="background: #f0f7ff"], div[style*="background: #eeedfe"], div[style*="background: #f0fff4"] {
      margin-bottom: 0.6rem !important;
      padding: 0.9rem 1rem !important;
    }

    /* Compress markdown content */
    .report-md p { margin-bottom: 0.25rem !important; font-size: 0.85rem !important; line-height: 1.4 !important; }
    .report-md ul { margin: 0 0 0.25rem 1rem !important; padding: 0 !important; }
    .report-md ul li { margin-bottom: 0.15rem !important; font-size: 0.85rem !important; line-height: 1.4 !important; }
    .report-md table { margin: 0.4rem 0 !important; font-size: 0.75rem !important; }
    .report-md th { padding: 5px 8px !important; font-size: 0.75rem !important; }
    .report-md td { padding: 4px 8px !important; font-size: 0.75rem !important; }

    /* Section labels */
    h4[style*="textTransform"] { margin-bottom: 0.3rem !important; margin-top: 0.6rem !important; font-size: 0.6rem !important; }
    h3[style*="fontFamily"] { margin-bottom: 0.35rem !important; font-size: 0.95rem !important; }

    /* Subject tags */
    span[style*="background: #e8f0f8"], span[style*="background: #e8f5e8"] {
      font-size: 0.7rem !important;
      padding: 2px 6px !important;
      margin-bottom: 3px !important;
    }
  }
`

function MarkdownContent({ children, className = '' }) {
  return (
    <div className={`report-md ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  )
}

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
  const [studentName, setStudentName] = useState(null)
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
      setStudentName(data.studentName)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  if (loading) return (<><Nav /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-mid)' }}>Loading your report...</p></div></>)
  if (error)   return (<><Nav /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}><p style={{ color: 'var(--text-mid)' }}>{error}</p><Link href="/dashboard">← Back to Dashboard</Link></div></>)
  if (!report) return null

  const rd      = report.top_careers
  const careers = rd?.careers || []
  const riasec  = rd?.riasec_profile
  const date    = new Date(report.generated_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })

  // Get stage config from user if available
  const stage        = user?.stage || 'grade_9'
  const stageConfig  = getStageConfig(stage)
  const schoolLearner = isSchoolLearner(stage)

  return (
    <>
      <Head>
        <title>Your Career Report — PickMyPath</title>
        <style>{PRINT_STYLES}</style>
      </Head>
      <Nav />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }} role="main">

        {/* Report header */}
        <div style={{ background: 'var(--navy)', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem', pageBreakAfter: 'avoid' }} className="report-header print-no-break">
          <div style={{ display: 'inline-block', background: 'rgba(201,151,58,0.2)', color: '#e8b856', border: '1px solid rgba(201,151,58,0.35)', borderRadius: 20, padding: '3px 14px', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {stageConfig.label}
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>
            {studentName ? `${studentName}'s` : user?.studentName ? `${user.studentName}'s` : 'Your'} Career Report
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', marginBottom: '1rem' }}>Generated {date} · PickMyPath</p>

          {/* Stage context */}
          {rd?.stage_context && (
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.875rem', lineHeight: 1.6, fontWeight: 400, marginBottom: '0.75rem', fontStyle: 'italic' }}>
              {rd.stage_context}
            </p>
          )}

          {(rd?.stage_context || riasec?.dominant_types?.length > 0) && riasec?.summary && (
            <hr style={{ border: 'none', borderTop: '1px solid rgba(201,151,58,0.3)', margin: '0.75rem 0' }} />
          )}

          {riasec?.dominant_types?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
              <span style={{ background: 'rgba(201,151,58,0.25)', color: '#e8b856', border: '1px solid rgba(201,151,58,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 500 }}>
                RIASEC: {riasec.dominant_types.join(' · ')}
              </span>
            </div>
          )}
          {riasec?.summary && <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 400, margin: 0 }}>{riasec.summary}</p>}
        </div>

        {/* Academic / background observations */}
        {rd?.academic_observations && (
          <div style={{ background: '#f0f7ff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', border: '1px solid #b5d4f4', pageBreakInside: 'avoid' }} className="print-no-break">
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1rem', marginBottom: '0.5rem' }}>
              {schoolLearner ? '📊 What your marks tell us' : '📊 What your background tells us'}
            </h3>
            <MarkdownContent>{rd.academic_observations}</MarkdownContent>
          </div>
        )}

        {/* Career cards */}
        {careers.map((c, i) => (
          <div key={i} style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'var(--shadow)', pageBreakInside: 'avoid' }} className="career-card print-no-break">
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
              <MarkdownContent>{c.summary}</MarkdownContent>

              {c.current_position_assessment && (
                <>
                  <SectionLabel>Your current position</SectionLabel>
                  <div style={{ background: '#faf9f7', borderLeft: '3px solid var(--gold)', padding: '10px 12px', borderRadius: '0 6px 6px 0', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>{c.current_position_assessment}</p>
                  </div>
                </>
              )}

              <SectionLabel>{schoolLearner ? 'Required subjects' : 'Required qualifications & skills'}</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                {(c.subjects_required || []).map(s => <span key={s} style={{ background: '#e8f0f8', color: '#1a3260', borderRadius: 6, padding: '3px 9px', fontSize: '0.8rem', fontWeight: 500 }}>{s}</span>)}
              </div>
              {c.subjects_recommended?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {c.subjects_recommended.map(s => <span key={s} style={{ background: '#e8f5e8', color: '#1a4d1a', borderRadius: 6, padding: '3px 9px', fontSize: '0.8rem', fontWeight: 500 }}>✓ {s}</span>)}
                </div>
              )}

              <SectionLabel>{schoolLearner ? 'NSC grades & APS requirements' : 'Requirements & pathway'}</SectionLabel>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', margin: '0 0 2px', fontWeight: 500 }}>{c.requirements || c.nsc_grades}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', fontStyle: 'italic', margin: 0 }}>{c.pathway || c.study_path}</p>

              <SectionLabel>AI impact on this career</SectionLabel>
              <div style={{ background: AI_BG[c.ai_resilience] || '#fff8ec', borderLeft: `3px solid ${AI_COLOR[c.ai_resilience] || 'var(--gold)'}`, borderRadius: '0 8px 8px 0', padding: '10px 12px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>{c.ai_impact}</p>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: 6, color: AI_COLOR[c.ai_resilience] || 'var(--gold)' }}>
                  AI resilience: {(c.ai_resilience || 'medium').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Subject / next steps advice — label changes by stage */}
        {rd?.subject_or_next_steps_advice && (
          <div style={{ background: '#f0f7ff', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid #b5d4f4', pageBreakInside: 'avoid' }} className="print-no-break">
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
              {schoolLearner ? '📚 Subject selection advice' : '🗺 Your next steps'}
            </h3>
            <MarkdownContent>{rd.subject_or_next_steps_advice}</MarkdownContent>
          </div>
        )}

        {/* Parent / support person note */}
        {rd?.parent_note && (
          <div style={{ background: '#eeedfe', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid #afa9ec', pageBreakInside: 'avoid' }} className="print-no-break">
            <h3 style={{ fontFamily: 'Georgia,serif', color: '#3c3489', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
              👨‍👩‍👧 A note for your support person
            </h3>
            <div style={{ color: '#534ab7' }}>
              <MarkdownContent>{rd.parent_note}</MarkdownContent>
            </div>
          </div>
        )}

        {/* Motivational note */}
        {rd?.motivational_note && (
          <div style={{ background: '#f0fff4', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', border: '1px solid #d5f0dc', pageBreakInside: 'avoid' }} className="print-no-break">
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>💡 A note for you</h3>
            <MarkdownContent>{rd.motivational_note}</MarkdownContent>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', marginTop: '2rem' }} className="action-buttons">
          <button onClick={() => window.print()} style={{ flex: 1, minWidth: 140, padding: '13px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}>
            🖨 Print / Save as PDF
          </button>
          <Link href="/dashboard" style={{ flex: 1, minWidth: 140, padding: '12px', background: 'transparent', color: 'var(--navy)', border: '1.5px solid var(--navy)', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '1rem' }}>
          PickMyPath is a guidance tool based on Holland RIASEC + academic performance analysis. We recommend discussing your results with a registered career guidance professional.
        </p>
      </div>
    </>
  )
}
