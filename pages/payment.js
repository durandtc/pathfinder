import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'

export default function Payment() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = parseInt(process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399')
  const vat = parseInt(process.env.NEXT_PUBLIC_VAT_RATE || '15')
  const total = Math.round(price * (1 + vat / 100))

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (!u) { router.push('/register'); return }
    setUser(JSON.parse(u))
  }, [])

  async function handlePayment() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed')

      // In sandbox mode, skip PayFast and go straight to assessment
      if (data.sandbox) {
        router.push('/assessment')
        return
      }

      // In live mode, redirect to PayFast
      window.location.href = data.paymentUrl
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <Head><title>Payment — PickMyPath</title></Head>
      <Nav />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '2.5rem', width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Complete your purchase</h2>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: 0, fontWeight: 300 }}>Hi {user.fullName} — one step away from your career report</p>

          <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '1.25rem', margin: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-mid)', padding: '4px 0' }}>
              <span>PickMyPath — Full Assessment</span><span>R{price}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-mid)', padding: '4px 0' }}>
              <span>VAT ({vat}%)</span><span>R{(price * vat / 100).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
              <span>Total</span><span>R{total}.00</span>
            </div>
          </div>

          <div style={{ background: '#fff8ec', border: '1px solid #e8b856', borderRadius: 8, padding: '12px 14px', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#5a4010', margin: 0 }}>
              <strong>🧪 Testing mode:</strong> PayFast sandbox is active. Click below to skip payment and go straight to your assessment. No real payment will be taken.
            </p>
          </div>

          {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button onClick={handlePayment} disabled={loading} style={{
            width: '100%', padding: '14px', background: 'var(--gold)', color: 'var(--navy)',
            border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Processing...' : `Pay R${total} & Start Assessment`}
          </button>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '1rem' }}>
            🔒 Secured by PayFast · SSL encrypted
          </p>
        </div>
      </div>
    </>
  )
}
