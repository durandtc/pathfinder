import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../../components/Nav'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [form, setForm]       = useState({ password: '', confirm: '' })
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Reset failed.'); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  return (
    <>
      <Head><title>Reset Password — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '2.5rem', width: '100%', maxWidth: 420 }}>
          {!done ? (
            <>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Choose a new password</h2>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 300 }}>Make it strong — at least 8 characters.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New password</label>
                  <input className="form-input" type="password" required placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Confirm new password</label>
                  <input className="form-input" type="password" required placeholder="Repeat your password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                </div>
                {error && <p style={{ color: '#a32d2d', fontSize: '0.875rem', marginBottom: 8 }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving...' : 'Set New Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#e8f5e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem' }}>✓</div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Password updated!</h2>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.9rem' }}>Your password has been changed. You can now sign in with your new password.</p>
              <Link href="/login" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '11px 24px', textDecoration: 'none', fontWeight: 500 }}>
                Sign In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
