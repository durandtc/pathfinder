import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Nav from '../../components/Nav'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <Head><title>Forgot Password — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '2.5rem', width: '100%', maxWidth: 420 }}>
          {!sent ? (
            <>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Forgot your password?</h2>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 300 }}>
                Enter the email address you registered with and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input className="form-input" type="email" required placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
                Remember it? <Link href="/login">Sign in</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#e8f5e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem' }}>✓</div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Check your inbox</h2>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your spam folder if you don't see it within a few minutes.
              </p>
              <Link href="/login" style={{ display: 'inline-block', background: 'var(--navy)', color: '#fff', borderRadius: 8, padding: '11px 24px', textDecoration: 'none', fontWeight: 500 }}>
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
