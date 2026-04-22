import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Login() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      // Always save user to localStorage
      localStorage.setItem('pmp_user', JSON.stringify(data.user))

      // Always go to dashboard — dashboard handles all routing logic
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Sign In — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '2.5rem', width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 300 }}>Sign in to view your dashboard and reports</p>

          <GoogleSignInButton label="Sign in with Google" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            or sign in with email
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input className="form-input" type="email" placeholder="you@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Password</span>
                <Link href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 300 }}>Forgot password?</Link>
              </label>
              <input className="form-input" type="password" placeholder="Your password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
            Don&apos;t have an account? <Link href="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  )
}
