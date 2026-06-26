import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'

export default function Payment() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSandbox, setIsSandbox] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponSchool, setCouponSchool] = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponError, setCouponError] = useState('')

  const price = parseInt(process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399')
  const discountedPrice = Math.max(0, price - couponDiscount)
  const total = discountedPrice

  useEffect(() => {
    const u = localStorage.getItem('pmp_user')
    if (!u) { router.push('/register'); return }
    setUser(JSON.parse(u))
  }, [])

  async function validateCoupon() {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    setCouponValidating(true)
    setCouponError('')
    try {
      const res = await fetch(`/api/payment/validate-coupon?code=${encodeURIComponent(couponCode)}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid coupon code')

      setCouponDiscount(parseFloat(data.discountAmount))
      setCouponSchool(data.school)
      setCouponApplied(true)
      setCouponError('')
    } catch (err) {
      setCouponError(err.message)
      setCouponApplied(false)
      setCouponDiscount(0)
    } finally {
      setCouponValidating(false)
    }
  }

  function clearCoupon() {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponApplied(false)
    setCouponSchool('')
    setCouponError('')
  }

  async function handlePayment() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          couponCode: couponApplied ? couponCode.toUpperCase() : null,
          finalAmount: total,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed')

      if (data.sandbox) setIsSandbox(true)

      // In sandbox mode, skip PayFast and go straight to assessment
      if (data.sandbox) {
        router.push('/assessment')
        return
      }

      // In live mode, submit form to PayFast
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.paymentUrl
      Object.entries(data.paymentData || {}).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
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
              <span>PickMyPath — Full Assessment</span><span>R{discountedPrice}.00</span>
            </div>
            {couponApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#22863a', padding: '4px 0' }}>
                <span>School Discount ({couponSchool})</span><span>-R{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
              <span>Total</span><span>R{total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ background: '#fafbfc', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              Have a school coupon code? (Optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={couponApplied}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  backgroundColor: couponApplied ? '#f0f0f0' : 'white',
                  cursor: couponApplied ? 'not-allowed' : 'text',
                }}
              />
              {!couponApplied ? (
                <button
                  onClick={validateCoupon}
                  disabled={couponValidating || !couponCode.trim()}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: couponValidating || !couponCode.trim() ? 'not-allowed' : 'pointer',
                    opacity: couponValidating || !couponCode.trim() ? 0.6 : 1,
                  }}
                >
                  {couponValidating ? 'Checking...' : 'Apply'}
                </button>
              ) : (
                <button
                  onClick={clearCoupon}
                  style={{
                    padding: '8px 16px',
                    background: '#e0e0e0',
                    color: 'var(--navy)',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {couponApplied && (
              <div style={{ fontSize: '0.85rem', color: '#22863a', marginTop: '0.5rem' }}>
                ✓ Coupon applied for {couponSchool}
              </div>
            )}
            {couponError && (
              <div style={{ fontSize: '0.85rem', color: '#cb2431', marginTop: '0.5rem' }}>
                {couponError}
              </div>
            )}
          </div>

          {isSandbox && (
            <div style={{ background: '#fff8ec', border: '1px solid #e8b856', borderRadius: 8, padding: '12px 14px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#5a4010', margin: 0 }}>
                <strong>🧪 Testing mode:</strong> PayFast sandbox is active. Click below to skip payment and go straight to your assessment. No real payment will be taken.
              </p>
            </div>
          )}

          {error &&<p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button onClick={handlePayment} disabled={loading} style={{
            width: '100%', padding: '14px', background: 'var(--gold)', color: 'var(--navy)',
            border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Processing...' : `Pay R${total.toFixed(2)} & Start Assessment`}
          </button>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '1rem' }}>
            🔒 Secured by PayFast · SSL encrypted
          </p>
        </div>
      </div>
    </>
  )
}
