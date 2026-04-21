import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function Nav() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  function logout() {
    localStorage.removeItem('pmp_user')
    document.cookie = 'pf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  return (
    <nav style={{
      background: 'var(--navy)', padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'Georgia, serif', color: '#fff', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Pick<span style={{ color: 'var(--gold)' }}>My</span>Path
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <Link href="/#how" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>How it works</Link>
        <Link href="/#pricing" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>Pricing</Link>

        {user ? (
          <>
            <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', textDecoration: 'none' }}>My Dashboard</Link>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: '0.875rem', cursor: 'pointer' }}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ padding: '8px 18px', fontSize: '0.875rem', borderRadius: 6, textDecoration: 'none', background: 'var(--gold)', color: 'var(--navy)', fontWeight: 500 }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
