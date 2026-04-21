import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    setUser(parsed)
    fetchReports(parsed.id)
  }, [])

  async function fetchReports(userId) {
    try {
      const res  = await fetch(`/api/assessment/my-reports?userId=${userId}`)
      const data = await res.json()
      setReports(data.reports || [])
    } catch {}
    setLoading(false)
  }

  async function handleRetake() {
    // Retake requires a new payment
    const confirmed = window.confirm(
      'Taking a new assessment requires another payment of R399 + VAT.\n\nYour previous reports will still be saved and viewable.\n\nContinue to payment?'
    )
    if (confirmed) router.push('/payment')
  }

  if (!user) return null

  const hasReports = reports.length > 0

  return (
    <>
      <Head><title>My Dashboard — PickMyPath</title></Head>
      <Nav />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Welcome banner */}
        <div style={{ background: 'var(--navy)', borderRadius: 14, padding: '2rem 2.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', color: '#fff', fontSize: '1.6rem', marginBottom: 4 }}>
              Welcome back, {user.fullName?.split(' ')[0]}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 300 }}>
              {hasReports
                ? `You have ${reports.length} completed assessment${reports.length > 1 ? 's' : ''}`
                : 'You have no completed assessments yet'}
            </p>
          </div>
          {hasReports && (
            <button
              onClick={handleRetake}
              style={{ background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: 8, padding: '11px 22px', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Retake Assessment
            </button>
          )}
        </div>

        {/* No assessment yet */}
        {!hasReports && !loading && (
          <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
              Ready to discover your career path?
            </h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 1.5rem', lineHeight: 1.7, fontWeight: 300 }}>
              Your 45-question AI-powered assessment maps your interests, values and strengths to real South African careers and the Grade 10 subjects you need.
            </p>
            <Link href="/payment" style={{
              display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)',
              borderRadius: 8, padding: '13px 28px', textDecoration: 'none', fontWeight: 500,
            }}>
              Start My Assessment — R399
            </Link>
          </div>
        )}

        {/* Previous reports list */}
        {hasReports && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              Your assessment reports
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((r, i) => (
                <div key={r.id} style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ width: 28, height: 28, background: 'var(--navy)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                        {i === 0 ? '★' : i + 1}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', margin: 0 }}>
                        {i === 0 ? 'Latest: ' : ''}{r.top_career}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', paddingLeft: 38 }}>
                      {r.dominant_types?.length > 0 && `RIASEC: ${r.dominant_types.join(' · ')} · `}
                      {new Date(r.generated_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <Link
                    href={`/report/${r.id}`}
                    style={{ background: 'var(--navy)', color: '#fff', borderRadius: 8, padding: '9px 20px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, flexShrink: 0 }}
                  >
                    View Report →
                  </Link>
                </div>
              ))}
            </div>

            {/* Retake info box */}
            <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '1.25rem 1.5rem', marginTop: '1.5rem', border: '1px solid #b5d4f4' }}>
              <h4 style={{ color: 'var(--navy)', fontSize: '0.95rem', margin: '0 0 0.4rem' }}>Want a fresh assessment?</h4>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.875rem', margin: '0 0 0.75rem', lineHeight: 1.6, fontWeight: 300 }}>
                Your interests and strengths can change over time. A retake gives you an updated report based on who you are today. Previous reports are always kept and viewable.
              </p>
              <button
                onClick={handleRetake}
                style={{ background: 'transparent', color: 'var(--navy)', border: '1.5px solid var(--navy)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Retake for R399 + VAT
              </button>
            </div>
          </div>
        )}

        {loading && (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '3rem' }}>Loading your reports...</p>
        )}
      </div>
    </>
  )
}
