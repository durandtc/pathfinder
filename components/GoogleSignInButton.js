import { useState } from 'react'
import { useRouter } from 'next/router'
import { signInWithGoogle } from '../lib/firebase'
import { CAREER_STAGES, STAGE_GROUPS } from '../lib/stageConfig'

export default function GoogleSignInButton({ label = 'Continue with Google' }) {
  const router  = useRouter()
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [showStageModal, setShowStageModal] = useState(false)
  const [pendingUser, setPendingUser]  = useState(null)
  const [selectedStage, setSelectedStage] = useState('')
  const [savingStage, setSavingStage]  = useState(false)

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      const firebaseUser = await signInWithGoogle()

      const res  = await fetch('/api/auth/google', {
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
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      if (!data.user) throw new Error('No user data returned from server')

      // If this Google user has no stage set yet — show the stage selector
      if (data.user.needsStage) {
        setPendingUser(data.user)
        setShowStageModal(true)
        setLoading(false)
        return
      }

      localStorage.setItem('pmp_user', JSON.stringify(data.user))
      router.push('/dashboard')

    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.')
      } else if (err.code?.startsWith('auth/')) {
        setError(`Google sign-in error: ${err.message}`)
      } else {
        setError(`Sign-in failed: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleStageSubmit() {
    if (!selectedStage) return
    setSavingStage(true)
    try {
      // Save stage to the database
      await fetch('/api/auth/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUser.id, stage: selectedStage }),
      })
      const updatedUser = { ...pendingUser, stage: selectedStage, needsStage: false }
      localStorage.setItem('pmp_user', JSON.stringify(updatedUser))
      router.push('/dashboard')
    } catch {
      // Even if save fails, let them in — stage can be set later
      localStorage.setItem('pmp_user', JSON.stringify({ ...pendingUser, needsStage: false }))
      router.push('/dashboard')
    }
  }

  const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.17z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
    </svg>
  )

  const firebaseConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )

  if (!firebaseConfigured) {
    return (
      <div style={{ width: '100%', padding: '11px 14px', background: 'var(--cream)', border: '1.5px dashed var(--border)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-light)', textAlign: 'center' }}>
        Google Sign-In not yet configured — add Firebase env vars in Vercel
      </div>
    )
  }

  return (
    <div>
      {/* Stage selector modal for new Google users */}
      {showStageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--white)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Welcome to PickMyPath!
            </h3>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6, fontWeight: 300 }}>
              Hi {pendingUser?.fullName?.split(' ')[0]} — one quick question before we continue. This helps us tailor your assessment and report to your exact situation.
            </p>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--navy)', marginBottom: 8 }}>
              What is your current grade or career stage?
            </label>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', background: 'var(--cream)', color: 'var(--text-dark)', marginBottom: '1.25rem', cursor: 'pointer' }}
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
            <button
              onClick={handleStageSubmit}
              disabled={!selectedStage || savingStage}
              style={{ width: '100%', padding: '13px', background: selectedStage ? 'var(--navy)' : 'var(--border)', color: selectedStage ? '#fff' : 'var(--text-light)', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: selectedStage ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              {savingStage ? 'Saving...' : 'Continue to Dashboard →'}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%', padding: '11px 14px',
          background: 'var(--white)', color: 'var(--text-dark)',
          border: '1.5px solid var(--border)', borderRadius: 8,
          fontSize: '0.95rem', fontWeight: 400,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'border-color 0.2s', opacity: loading ? 0.7 : 1,
        }}
        onMouseOver={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--text-mid)' }}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <GoogleLogo />
        {loading ? 'Signing in with Google...' : label}
      </button>

      {error && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: '#fff0f0', border: '1px solid #f09595', borderRadius: 8, fontSize: '0.85rem', color: '#a32d2d', lineHeight: 1.5 }}>
          {error}
          {error.includes('auth/') && (
            <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#c04040' }}>
              Tip: Make sure your Vercel URL is added to Firebase → Authentication → Settings → Authorized domains
            </div>
          )}
        </div>
      )}
    </div>
  )
}
