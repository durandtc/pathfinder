import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]         = useState(null)
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [resendSent, setResendSent] = useState(false)

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

  async function handleResendVerification() {
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
    setResendSent(true)
  }

  async function handleRetake() {
    const confirmed = window.confirm(
      'Taking a new assessment requires a new payment of R399 + VAT.\n\nYour previous reports will remain saved and viewable.\n\nContinue to payment?'
    )
    if (confirmed) router.push('/payment')
  }

  // Check if there is saved progress in localStorage
  const hasSavedProgress = typeof window !== 'undefined' && !!localStorage.getItem('pmp_answers')
  const savedAnswerCount  = hasSavedProgress
    ? Object.keys(JSON.parse(localStorage.getItem('pmp_answers') || '{}')).length
    : 0

  if (!user) return null

  const hasReports = reports.length > 0
  const hasPaid    = user.hasCompletedPayment

  return (
    <>
      <Head><title>My Dashboard — PickMyPath</title></Head>
      <Nav />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Email verification banner */}
        {!user.emailVerified && (
          <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#92400e' }}>Please verify your email address</span>
              <span style={{ fontSize: '0.8rem', color: '#b45309', marginLeft: 8 }}>Check your inbox for a verification link</span>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resendSent}
              style={{ fontSize: '0.8rem', padding: '5px 14px', border: '1px solid #f59e0b', borderRadius: 6, background: '#fff', color: '#92400e', cursor: 'pointer' }}
            >
              {resendSent ? 'Sent ✓' : 'Resend email'}
            </button>
          </div>
        )}

        {/* Welcome banner */}
        <div style={{ background: 'var(--navy)', borderRadius: 14, padding: '2rem 2.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', color: '#fff', fontSize: '1.6rem', marginBottom: 4 }}>
              Welcome back, {user.fullName?.split(' ')[0]}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: 300 }}>
              {hasReports
                ? `${reports.length} completed report${reports.length > 1 ? 's' : ''} on file`
                : 'Ready to discover your career path?'}
            </p>
          </div>
          {hasReports && (
            <button onClick={handleRetake} style={{ background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>
              Retake Assessment
            </button>
          )}
        </div>

        {/* ── SAVED PROGRESS BANNER ── */}
        {hasSavedProgress && !hasReports && (
          <div style={{ background: '#eeedfe', border: '1px solid #afa9ec', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ color: '#3c3489', fontSize: '1rem', margin: '0 0 4px' }}>You have an assessment in progress</h3>
              <p style={{ color: '#534ab7', fontSize: '0.875rem', margin: 0 }}>
                {savedAnswerCount} of 49 questions answered — pick up exactly where you left off.
              </p>
            </div>
            <Link href="/assessment" style={{ background: '#3c3489', color: '#fff', borderRadius: 8, padding: '10px 20px', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem', flexShrink: 0 }}>
              Continue Assessment →
            </Link>
          </div>
        )}

        {/* ── NO PAYMENT YET ── */}
        {!hasPaid && !hasSavedProgress && !hasReports && !loading && (
          <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
              Ready to discover your career path?
            </h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 1.5rem', lineHeight: 1.7, fontWeight: 300 }}>
              Your 45-question AI-powered assessment maps your interests, values, and strengths — plus your academic marks — to real South African careers and the Grade 10 subjects you need.
            </p>
            <Link href="/payment" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '13px 28px', textDecoration: 'none', fontWeight: 500 }}>
              Start My Assessment — R399
            </Link>
          </div>
        )}

        {/* ── PAID BUT NOT STARTED ── */}
        {hasPaid && !hasSavedProgress && !hasReports && !loading && (
          <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>Payment confirmed — you're ready to start</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.7, fontWeight: 300 }}>
              Your assessment is unlocked. The questions take about 20 minutes. Hand the device to your parent when you reach the parent section.
            </p>
            <Link href="/assessment" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '13px 28px', textDecoration: 'none', fontWeight: 500 }}>
              Begin Assessment →
            </Link>
          </div>
        )}

        {/* ── PREVIOUS REPORTS ── */}
        {hasReports && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '1rem' }}>Your assessment reports</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {reports.map((r, i) => (
                <div key={r.id} style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ width: 28, height: 28, background: 'var(--navy)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                        {i === 0 ? '★' : i + 1}
                      </div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--navy)', margin: 0 }}>
                        {i === 0 ? 'Latest: ' : ''}{r.top_career}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', paddingLeft: 38 }}>
                      {r.dominant_types?.length > 0 && `RIASEC: ${r.dominant_types.join(' · ')} · `}
                      {new Date(r.generated_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <Link href={`/report/${r.id}`} style={{ background: 'var(--navy)', color: '#fff', borderRadius: 8, padding: '9px 20px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, flexShrink: 0 }}>
                    View Report →
                  </Link>
                </div>
              ))}
            </div>

            {/* Retake info */}
            <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '1.25rem 1.5rem', marginTop: '1.25rem', border: '1px solid #b5d4f4' }}>
              <h4 style={{ color: 'var(--navy)', fontSize: '0.95rem', margin: '0 0 0.35rem' }}>Want a fresh perspective?</h4>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.875rem', margin: '0 0 0.75rem', lineHeight: 1.6, fontWeight: 300 }}>
                Your interests evolve over time. A retake generates a completely new report. All previous reports are always kept and viewable.
              </p>
              <button onClick={handleRetake} style={{ background: 'transparent', color: 'var(--navy)', border: '1.5px solid var(--navy)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                Retake for R399 + VAT
              </button>
            </div>
          </div>
        )}

        {loading && <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '3rem' }}>Loading your dashboard...</p>}
      </div>
    </>
  )
}
