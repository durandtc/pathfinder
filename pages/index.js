import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'

export default function Home() {
  const price = process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399'
  const vat = process.env.NEXT_PUBLIC_VAT_RATE || '15'
  const total = Math.round(parseInt(price) * (1 + parseInt(vat) / 100))

  return (
    <>
      <Head>
        <title>PathFinder SA — Grade 9 Career Guidance</title>
        <meta name="description" content="AI-powered career assessment for Grade 9 students. Discover the right subjects and career path for your future." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3260 60%, #2a4a80 100%)',
        minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(201,151,58,0.2)', color: '#e8b856',
            border: '1px solid rgba(201,151,58,0.4)', borderRadius: 20, padding: '6px 16px',
            fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.5px', marginBottom: '1.5rem',
            textTransform: 'uppercase',
          }}>
            Grade 9 Career Guidance · South Africa
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif', color: '#fff',
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 700, lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Discover your <span style={{ color: '#c9973a' }}>future career</span> with confidence
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300, maxWidth: 560, margin: '0 auto 2.5rem' }}>
            A scientifically validated assessment that analyses your interests, personality and aptitudes — then maps them to the right Grade 10 subjects and real career paths.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8,
              padding: '14px 32px', fontSize: '1rem', fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              Start My Assessment — R{price}
            </Link>
            <a href="#how" style={{
              background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 8, padding: '14px 32px', fontSize: '1rem', textDecoration: 'none',
            }}>
              See how it works
            </a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            {[['3', 'Validated frameworks'], ['45', 'Questions'], ['100+', 'Career matches'], ['SA', 'CAPS aligned']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: '#c9973a', fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase' }}>The process</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Four steps to clarity</h2>
        <p style={{ color: 'var(--text-mid)', maxWidth: 540, fontWeight: 300, marginBottom: '3rem' }}>From payment to personalised report — the whole process takes under 40 minutes.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem' }}>
          {[
            ['1', 'Register & pay securely', 'Create your profile and pay via PayFast. R' + price + ' once-off, full access unlocked immediately.'],
            ['2', 'Complete the assessment', '45 validated questions across three proven frameworks — interests, values, and self-reported aptitude.'],
            ['3', 'AI analyses your profile', 'Our AI cross-references your answers against 100+ SA careers, CAPS subject requirements, and APS scores.'],
            ['4', 'Receive your report', 'A full report with your top 3 careers, required subjects, grades needed — and AI impact analysis.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--navy)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>{n}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '0.5rem' }}>{t}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: 'var(--navy)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#e8b856', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pricing</div>
        <h2 style={{ fontFamily: 'Georgia,serif', color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.4rem)', marginBottom: '1rem' }}>Simple, once-off pricing</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 3rem', fontWeight: 300 }}>No subscriptions. No hidden costs. One payment, one report that could shape your entire future.</p>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 380, margin: '0 auto', border: '1px solid var(--gold)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '1rem' }}>Complete Assessment Package</h3>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)' }}>R{price}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-mid)', marginBottom: '1.5rem' }}>+ VAT · once-off · includes everything</div>
          <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem' }}>
            {['45-question validated assessment', 'Top 3 career matches with % fit score', 'CAPS subject recommendations', 'NSC grade & APS requirements', 'AI impact analysis for each career', 'Full report emailed to you', 'University & college pathway guidance'].map(item => (
              <li key={item} style={{ color: 'var(--text-mid)', fontSize: '0.9rem', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <Link href="/register" style={{
            display: 'block', background: 'var(--gold)', color: 'var(--navy)',
            borderRadius: 8, padding: '13px', textAlign: 'center', textDecoration: 'none',
            fontWeight: 500, fontSize: '1rem',
          }}>
            Get started now
          </Link>
        </div>
      </section>

      <footer style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} PathFinder SA · All rights reserved ·{' '}
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Admin</Link>
        </p>
      </footer>
    </>
  )
}
