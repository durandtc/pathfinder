import { useState } from 'react'
import { useRouter } from 'next/router'
import { signInWithGoogle } from '../lib/firebase'

export default function GoogleSignInButton({ label = 'Continue with Google' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      // Step 1 — Firebase opens the Google popup and returns the user
      const firebaseUser = await signInWithGoogle()

      // Step 2 — Send Google user details to our own backend
      // This creates/finds the user in Supabase and returns our JWT
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google sign-in failed')

      // Step 3 — Store user info in localStorage (same as email login)
      localStorage.setItem('pf_user', JSON.stringify(data.user))

      // Step 4 — Redirect
      router.push(data.user.hasCompletedPayment ? '/assessment' : '/payment')

    } catch (err) {
      // Firebase popup-closed error — user cancelled, not a real error
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.')
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Google "G" SVG logo
  const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.17z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
    </svg>
  )

  // Check if Firebase is configured — if not, show a helpful message
  const firebaseConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )

  if (!firebaseConfigured) {
    return (
      <div style={{
        width: '100%', padding: '11px 14px', background: 'var(--cream)',
        border: '1.5px dashed var(--border)', borderRadius: 8,
        fontSize: '0.875rem', color: 'var(--text-light)', textAlign: 'center',
      }}>
        Google Sign-In not yet configured — add Firebase env vars in Vercel
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%', padding: '11px 14px',
          background: 'var(--white)', color: 'var(--text-dark)',
          border: '1.5px solid var(--border)', borderRadius: 8,
          fontSize: '0.95rem', fontWeight: 400, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'border-color 0.2s',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-mid)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <GoogleLogo />
        {loading ? 'Opening Google...' : label}
      </button>
      {error && (
        <p style={{ color: '#a32d2d', fontSize: '0.8rem', marginTop: 6, textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
