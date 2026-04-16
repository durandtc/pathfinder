import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', grade: '', school: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      localStorage.setItem('pf_user', JSON.stringify(data.user))
      router.push('/payment')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)', padding: '2.5rem', width: '100%', maxWidth: 420,
  }

  return (
    <>
      <Head><title>Register — PathFinder SA</title></Head>
      <Nav />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Create your account</h2>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 300 }}>Join thousands of Grade 9 students finding their path</p>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full name', key: 'fullName', type: 'text', placeholder: 'e.g. Thabo Nkosi', required: true },
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@email.com', required: true },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Choose a strong password (min 8 chars)', required: true },
              { label: 'Grade', key: 'grade', type: 'text', placeholder: 'e.g. Grade 9', required: false },
              { label: 'School (optional)', key: 'school', type: 'text', placeholder: 'e.g. Rondebosch Boys High', required: false },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label>{f.label}</label>
                <input
                  className="form-input"
                  type={f.type}
                  placeholder={f.placeholder}
                  required={f.required}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: 'var(--navy)', color: 'var(--white)',
              border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
              marginTop: '0.5rem', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Creating account...' : 'Create account & continue'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}
