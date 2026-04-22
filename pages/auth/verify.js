import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../../components/Nav'

export default function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setStatus('success')
          // Update localStorage if user is logged in
          const u = localStorage.getItem('pmp_user')
          if (u) {
            const parsed = JSON.parse(u)
            localStorage.setItem('pmp_user', JSON.stringify({ ...parsed, emailVerified: true }))
          }
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed.')
        }
      })
      .catch(() => { setStatus('error'); setMessage('Something went wrong. Please try again.') })
  }, [token])

  const icons = { verifying: '⏳', success: '✓', error: '!' }
  const colours = { verifying: '#e8f0f8', success: '#e8f5e8', error: '#fff0f0' }

  return (
    <>
      <Head><title>Verify Email — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 64, height: 64, background: colours[status], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.6rem' }}>
            {icons[status]}
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
            {status === 'verifying' && 'Verifying your email...'}
            {status === 'success'   && 'Email verified!'}
            {status === 'error'     && 'Verification failed'}
          </h1>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2rem' }}>
            {status === 'verifying' && 'Please wait a moment.'}
            {status === 'success'   && 'Your email address is confirmed. You can now use all PickMyPath features.'}
            {status === 'error'     && (message || 'The link may have expired. Please request a new one.')}
          </p>
          {status === 'success' && (
            <Link href="/dashboard" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '13px 28px', textDecoration: 'none', fontWeight: 500 }}>
              Go to My Dashboard →
            </Link>
          )}
          {status === 'error' && (
            <button
              onClick={async () => {
                const u = localStorage.getItem('pmp_user')
                const email = u ? JSON.parse(u).email : ''
                if (email) {
                  await fetch('/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                  alert('A new verification email has been sent.')
                } else {
                  router.push('/login')
                }
              }}
              style={{ background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 28px', cursor: 'pointer', fontSize: '1rem' }}
            >
              Resend verification email
            </button>
          )}
        </div>
      </div>
    </>
  )
}
