import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../../components/Nav'

export default function PaymentSuccess() {
  const router = useRouter()
  const { payment_id } = router.query
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified]   = useState(false)

  useEffect(() => {
    if (!payment_id) { setVerifying(false); setVerified(true); return } // sandbox
    fetch(`/api/payment/verify?payment_id=${payment_id}`)
      .then(r => r.json())
      .then(d => { setVerified(d.verified); setVerifying(false) })
      .catch(() => { setVerified(false); setVerifying(false) })
  }, [payment_id])

  return (
    <>
      <Head><title>Payment Confirmed — PathFinder SA</title></Head>
      <Nav />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {verifying ? (
            <p style={{ color: 'var(--text-mid)' }}>Verifying your payment...</p>
          ) : verified ? (
            <>
              <div style={{ width: 64, height: 64, background: '#e8f5e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem' }}>✓</div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Payment confirmed!</h1>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Your assessment is unlocked. Complete the 45 questions and your AI career report will appear instantly on screen — no waiting for an email.
              </p>
              <Link href="/assessment" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '14px 32px', textDecoration: 'none', fontWeight: 500, fontSize: '1rem' }}>
                Start My Assessment →
              </Link>
            </>
          ) : (
            <>
              <div style={{ width: 64, height: 64, background: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem' }}>!</div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Payment not yet confirmed</h1>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2rem' }}>
                This can take a moment. Please wait 30 seconds and refresh, or contact us if the problem persists.
              </p>
              <button onClick={() => window.location.reload()} style={{ background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 28px', cursor: 'pointer', fontSize: '1rem' }}>Refresh</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
