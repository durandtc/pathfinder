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
    * { orphans: 3; widows: 3; }
    body { margin: 0; padding: 0; background: #fff; }
    html { margin: 0; padding: 0; }
    nav, .action-buttons { display: none !important; height: 0 !important; overflow: hidden !important; }
    .report-header { page-break-after: avoid; margin: 0 0 0.8rem 0 !important; padding: 0.8rem 0.6rem !important; }
    .report-header h1 { color: #000 !important; margin-bottom: 0.08rem !important; font-size: 1.1rem !important; }
    .report-header p { color: #333 !important; margin-bottom: 0.1rem !important; font-size: 0.65rem !important; }
    .report-header hr { border-top-color: #ccc !important; margin: 0.2rem 0 !important; }
    .report-header div:first-of-type { margin-bottom: 0.4rem !important; }
    .career-card { page-break-inside: auto !important; break-inside: auto !important; margin-bottom: 0.4rem !important; }
    .career-card > div:first-child { padding: 0.6rem 0.7rem !important; page-break-inside: avoid !important; break-inside: avoid !important; }
    .career-card > div:last-child { padding: 0.6rem 0.7rem !important; }
    div[role="main"] { margin: 0 !important; padding: 0 !important; max-width: 100%; }
    @page { margin: 0.2in 0.3in; size: A4; }

    /* Tighten report content spacing */
    div[style*="background: #f0f7ff"], div[style*="background: #eeedfe"], div[style*="background: #f0fff4"] {
      margin-bottom: 0.25rem !important;
      padding: 0.6rem 0.7rem !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Compress markdown content */
    .report-md { margin: 0 !important; }
    .report-md p { margin: 0 0 0.12rem 0 !important; font-size: 0.75rem !important; line-height: 1.3 !important; }
    .report-md ul { margin: 0.08rem 0 0.08rem 0.7rem !important; padding: 0 !important; }
    .report-md ul li { margin-bottom: 0.06rem !important; font-size: 0.75rem !important; line-height: 1.25 !important; }
    .report-md table { margin: 0.15rem 0 !important; font-size: 0.65rem !important; width: 100%; }
    .report-md th { padding: 2px 3px !important; font-size: 0.65rem !important; }
    .report-md td { padding: 1px 3px !important; font-size: 0.65rem !important; }

    /* Section labels */
    h4[style*="textTransform"] { margin-bottom: 0.1rem !important; margin-top: 0.2rem !important; font-size: 0.5rem !important; }
    h3[style*="fontFamily"] { margin-bottom: 0.15rem !important; font-size: 0.75rem !important; }

    /* Subject tags and salary pills */
    span[style*="background: #e8f0f8"], span[style*="background: #e8f5e8"], div[style*="background: #e8f0f8"] {
      font-size: 0.6rem !important;
      padding: 0.5px 3px !important;
      margin-right: 2px !important;
      margin-bottom: 1px !important;
      display: inline-block !important;
    }

    /* Day in the life and exploration boxes */
    div[style*="background: #faf9f7"], div[style*="background: #f0fff4"] {
      margin-bottom: 0.3rem !important;
      padding: 0.5rem 0.6rem !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Career card sections stay together */
    .career-card div[style*="background: #faf9f7"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
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

  const [selectedRating, setSelectedRating]   = useState(0)
  const [hoveredRating, setHoveredRating]     = useState(0)
  const [ratingComment, setRatingComment]     = useState('')
  const [ratingDone, setRatingDone]           = useState(false)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratingError, setRatingError]         = useState('')

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (u) setUser(JSON.parse(u))
    if (id) fetchReport()
  }, [id])

  useEffect(() => {
    if (report?.rating) {
      setSelectedRating(report.rating)
      setRatingComment(report.rating_comment || '')
      setRatingDone(true)
    }
  }, [report])

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

  async function submitRating() {
    if (!selectedRating || !user) return
    setRatingSubmitting(true)
    setRatingError('')
    try {
      const res = await fetch('/api/assessment/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id, userId: user.id, rating: selectedRating, comment: ratingComment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setRatingDone(true)
    } catch (err) {
      setRatingError(err.message)
    }
    setRatingSubmitting(false)
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

          {/* Report headline — NEW */}
          {rd?.report_headline && (
            <p style={{ color: 'rgba(201,151,58,0.95)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 400, marginBottom: '0.75rem', fontStyle: 'italic' }}>
              "{rd.report_headline}"
            </p>
          )}

          {/* Stage context */}
          {rd?.stage_context && (
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.875rem', lineHeight: 1.6, fontWeight: 400, marginBottom: '0.75rem', fontStyle: 'italic' }}>
              {rd.stage_context}
            </p>
          )}

          {/* Career choice rationale — NEW */}
          {rd?.career_choice_rationale && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 300, marginBottom: '0.75rem' }}>
              {rd.career_choice_rationale}
            </p>
          )}

          {(rd?.stage_context || rd?.career_choice_rationale || riasec?.dominant_types?.length > 0) && riasec?.summary && (
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
          <div key={i} style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }} className="career-card">
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

              {/* Day in the Life — NEW */}
              {c.day_in_the_life && (
                <>
                  <SectionLabel>📅 A day in the life</SectionLabel>
                  <div style={{ background: '#faf9f7', borderLeft: '3px solid #c9973a', padding: '12px 14px', borderRadius: '0 8px 8px 0', marginBottom: '1rem' }}>
                    <MarkdownContent>{c.day_in_the_life}</MarkdownContent>
                  </div>
                </>
              )}

              {/* Salary & Career Progression — NEW */}
              {c.salary_range && (
                <>
                  <SectionLabel>💰 Salary & career progression</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
                    {c.salary_range.entry && (
                      <div style={{ background: '#e8f0f8', color: '#1a3260', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>ENTRY LEVEL</div>
                        <div>{c.salary_range.entry}</div>
                      </div>
                    )}
                    {c.salary_range.mid && (
                      <div style={{ background: '#e8f0f8', color: '#1a3260', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>MID-CAREER</div>
                        <div>{c.salary_range.mid}</div>
                      </div>
                    )}
                    {c.salary_range.senior && (
                      <div style={{ background: '#e8f0f8', color: '#1a3260', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>SENIOR LEVEL</div>
                        <div>{c.salary_range.senior}</div>
                      </div>
                    )}
                  </div>
                  {c.career_progression && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: '0 0 1rem 0', fontStyle: 'italic' }}>
                      {c.career_progression}
                    </p>
                  )}
                </>
              )}

              {/* Exploration Tip — NEW */}
              {c.exploration_tip && (
                <>
                  <SectionLabel>🔍 Try this this week</SectionLabel>
                  <div style={{ background: '#f0fff4', borderLeft: '3px solid #2d7a4f', padding: '12px 14px', borderRadius: '0 8px 8px 0', marginBottom: '1rem' }}>
                    <MarkdownContent>{c.exploration_tip}</MarkdownContent>
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
        {(rd?.parent_action_plan || rd?.parent_note) && (
          <div style={{ background: '#eeedfe', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid #afa9ec', pageBreakInside: 'avoid' }} className="print-no-break">
            <h3 style={{ fontFamily: 'Georgia,serif', color: '#3c3489', marginBottom: '1rem', fontSize: '1.1rem' }}>
              👨‍👩‍👧 For your parent / support person
            </h3>
            {rd?.parent_action_plan && (
              <div style={{ marginBottom: rd?.parent_note ? '1rem' : 0 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3c3489', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action items for the next 30 days</h4>
                <div style={{ color: '#534ab7' }}>
                  <MarkdownContent>{rd.parent_action_plan}</MarkdownContent>
                </div>
              </div>
            )}
            {rd?.parent_action_plan && rd?.parent_note && (
              <hr style={{ border: 'none', borderTop: '1px solid rgba(58, 41, 137, 0.2)', margin: '1rem 0' }} />
            )}
            {rd?.parent_note && (
              <div style={{ color: '#534ab7' }}>
                <MarkdownContent>{rd.parent_note}</MarkdownContent>
              </div>
            )}
          </div>
        )}

        {/* Motivational note */}
        {rd?.motivational_note && (
          <div style={{ background: '#f0fff4', borderRadius: 12, padding: '2rem', marginBottom: '2rem', border: '1px solid #d5f0dc', pageBreakInside: 'avoid', borderLeft: '4px solid var(--gold)' }} className="print-no-break">
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '1rem', fontSize: '1.15rem' }}>
              ✨ What we see in you{studentName ? `, ${studentName.split(' ')[0]}` : ''}
            </h3>
            <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              <MarkdownContent>{rd.motivational_note}</MarkdownContent>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '2rem', border: '1px solid #e0e0e0', fontSize: '0.8rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Important:</strong> This report is generated using AI and is intended as a <strong>career guidance tool for exploration only</strong>. It should not replace consultation with a professional school counselor, qualified career advisor, or psychometrist for major educational and career decisions.
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            The recommendations are based on your assessment responses and school marks, but reflect general career pathways. Your actual suitability for any career depends on many factors — aptitude, interests, personal circumstances, market conditions, and ongoing development. Always verify admission requirements directly with universities or institutions before making final decisions.
          </p>
          <p style={{ margin: 0 }}>
            For personalized career counseling, speak with your school guidance counselor or contact a registered career advisor or psychometrist in your province.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', marginTop: '2rem' }} className="action-buttons">
          <button onClick={() => window.print()} style={{ flex: 1, minWidth: 140, padding: '13px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}>
            🖨 Print / Save as PDF
          </button>
          <Link href="/dashboard" style={{ flex: 1, minWidth: 140, padding: '12px', background: 'transparent', color: 'var(--navy)', border: '1.5px solid var(--navy)', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' }}>
            ← Back to Dashboard
          </Link>
        </div>

        {/* Rating section — hidden on print */}
        <div className="action-buttons" style={{ background: '#fffbeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #fde68a' }}>
          {ratingDone ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= selectedRating ? '#d4af37' : '#ddd', marginRight: 2 }}>★</span>
                ))}
              </div>
              <p style={{ color: 'var(--navy)', fontWeight: 500, margin: '0 0 0.25rem' }}>Thank you for your feedback!</p>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.8rem', margin: 0, fontWeight: 300 }}>Your rating helps us improve PickMyPath for future students.</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.05rem', margin: '0 0 0.35rem' }}>How was your report?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', margin: '0 0 1rem', fontWeight: 300 }}>Your feedback helps us improve PickMyPath for future students.</p>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '2rem', padding: '0 2px', color: star <= (hoveredRating || selectedRating) ? '#d4af37' : '#ccc', transition: 'color 0.1s' }}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >★</button>
                ))}
              </div>
              {selectedRating > 0 && (
                <>
                  <textarea
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Any comments? (optional)"
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.75rem', color: 'var(--text-dark)', background: '#fff' }}
                  />
                  <button
                    onClick={submitRating}
                    disabled={ratingSubmitting}
                    style={{ background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: ratingSubmitting ? 'default' : 'pointer', fontSize: '0.875rem', fontWeight: 500, opacity: ratingSubmitting ? 0.7 : 1 }}
                  >
                    {ratingSubmitting ? 'Submitting…' : 'Submit Feedback'}
                  </button>
                  {ratingError && <p style={{ color: '#a32d2d', fontSize: '0.8rem', marginTop: '0.5rem', margin: '0.5rem 0 0' }}>{ratingError}</p>}
                </>
              )}
            </>
          )}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '1rem' }}>
          PickMyPath is a guidance tool based on Holland RIASEC + academic performance analysis. We recommend discussing your results with a registered career guidance professional.
        </p>
      </div>
    </>
  )
}
