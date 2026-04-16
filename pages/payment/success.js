import Head from 'next/head'
import Link from 'next/link'
import Nav from '../../components/Nav'

export default function PaymentSuccess() {
  return (
    <>
      <Head><title>Payment Confirmed — PathFinder SA</title></Head>
      <Nav />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, background: '#e8f5e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem' }}>✓</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Payment confirmed!</h1>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Your payment was successful. A confirmation email is on its way. You can now start your career assessment.
          </p>
          <Link href="/assessment" style={{
            display: 'inline-block', background: 'var(--gold)', color: 'var(--navy)',
            borderRadius: 8, padding: '14px 32px', textDecoration: 'none', fontWeight: 500, fontSize: '1rem',
          }}>
            Start My Assessment →
          </Link>
        </div>
      </div>
    </>
  )
}
