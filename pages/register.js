import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { CAREER_STAGES, STAGE_GROUPS } from '../lib/stageConfig'

export default function Register() {
  const router = useRouter()
  const [form, setForm]     = useState({ fullName: '', studentName: '', email: '', password: '', stage: '', school: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.stage) { setError('Please select your current grade or career stage.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      localStorage.setItem('pmp_user', JSON.stringify(data.user))
      router.push('/payment')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Register — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '2.5rem', width: '100%', maxWidth: 440 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.4rem' }}>Create your account</h2>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 300 }}>
            Career guidance for every stage — school, university, or working life
          </p>

          <GoogleSignInButton label="Register with Google" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            or register with email
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your full name <span style={{ color: 'var(--text-light)', fontWeight: 300 }}>(account holder)</span></label>
              <input className="form-input" type="text" placeholder="e.g. John Nkosi" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Student's name <span style={{ color: '#a32d2d' }}>*</span></label>
              <input className="form-input" type="text" placeholder="e.g. Thabo Nkosi" required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>The student being assessed (may be you or your child)</p>
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input className="form-input" type="email" placeholder="you@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="Minimum 8 characters" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {/* Career stage dropdown — the key new field */}
            <div className="form-group">
              <label>Your current grade or career stage <span style={{ color: '#a32d2d' }}>*</span></label>
              <select
                className="form-input"
                required
                value={form.stage}
                onChange={e => setForm({ ...form, stage: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select your stage...</option>
                {STAGE_GROUPS.map(group => (
                  <optgroup key={group} label={group}>
                    {CAREER_STAGES.filter(s => s.group === group).map(s => (
                      <option key={s.value} value={s.value}>{s.label} — {s.description}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>School, university or employer <span style={{ color: 'var(--text-light)', fontWeight: 300 }}>(optional)</span></label>
              <input className="form-input" type="text" placeholder="e.g. Rondebosch Boys High, UCT, Standard Bank" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
            </div>

            {error && <p className="error-msg" style={{ marginBottom: 10 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
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
