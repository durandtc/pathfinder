import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'

export default function Home() {
  const price = process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399'

  return (
    <>
      <Head>
        <title>PickMyPath — AI Career Guidance for High School Students</title>
        <meta name="description" content="AI-powered career assessment for South African high school students. Discover the right career path and choose the perfect Grade 10 subjects." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3260 60%, #2a4a80 100%)', minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 740, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(201,151,58,0.2)', color: '#e8b856', border: '1px solid rgba(201,151,58,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.5px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            AI-Powered Career Guidance · South Africa
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Discover your <span style={{ color: '#c9973a' }}>perfect career path</span> in high school
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300, maxWidth: 580, margin: '0 auto 2.5rem' }}>
            From Grade 8 early exploration to Grade 12 post-school planning — our scientifically validated assessment gives you clarity, direction, and a personalised action plan that guides your subject choices and career decisions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '14px 32px', fontSize: '1rem', fontWeight: 500, textDecoration: 'none' }}>
              Start My Assessment — R{price}
            </Link>
            <a href="#how" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '14px 32px', fontSize: '1rem', textDecoration: 'none' }}>
              See how it works
            </a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            {[['Grade 8–12', 'High school focused'], ['3', 'Validated frameworks'], ['49', 'Assessment questions'], ['SA', 'CAPS aligned']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: '#c9973a', fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Who it's for</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Every year of high school, a clear path</h2>
        <p style={{ color: 'var(--text-mid)', maxWidth: 560, fontWeight: 300, marginBottom: '3rem', lineHeight: 1.7 }}>One assessment, tailored to your grade. The AI adapts its guidance based on where you are in your high school journey right now.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            ['🏫', 'Grade 8 & 9', 'Discover your strengths early and prepare for the most important subject choice of your school career — the Grade 10 decision.'],
            ['📚', 'Grade 10–12', 'Confirm your subjects are right, set your NSC targets, identify top career matches, and plan your post-school direction with a clear action plan.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: 'var(--cream-mid)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>The process</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Four steps to clarity</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 540, fontWeight: 300, marginBottom: '3rem', lineHeight: 1.7 }}>From payment to personalised report — the whole process takes under 40 minutes.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem' }}>
            {[
              ['1', 'Register & pay', 'Create your profile, tell us your current stage, and pay R' + price + ' once-off.'],
              ['2', 'Complete the assessment', '45+ validated questions across interest, values, and aptitude — plus academic marks.'],
              ['3', 'AI analyses your profile', 'Claude cross-references your answers with careers, qualifications, and requirements relevant to your stage.'],
              ['4', 'View your report', 'A personalised report with your top 3 careers and a clear action plan — shown instantly on screen.'],
            ].map(([n, t, d]) => (
              <div key={n} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ width: 36, height: 36, background: 'var(--navy)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, marginBottom: '1rem' }}>{n}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '0.5rem' }}>{t}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRAMEWORKS */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>The science behind it</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Our validated frameworks</h2>
        <p style={{ color: 'var(--text-mid)', maxWidth: 560, fontWeight: 300, marginBottom: '3rem', lineHeight: 1.7 }}>PickMyPath uses three scientifically validated career assessment frameworks to give you a complete picture of your strengths, interests, and fit for different careers.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            ['🎯', 'Holland RIASEC', 'The world\'s most widely used career interest framework. We assess your natural preferences across six career interest types: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional — then match you with careers that align.'],
            ['💼', 'Career Values', 'What matters most in your ideal career? We explore your work preferences, the type of environment you thrive in, subject interests, and personal values — ensuring your path aligns with what genuinely motivates you.'],
            ['🧠', 'Aptitude Assessment', 'Based on proven aptitude frameworks (SDS, SII, MBTI, Kuder, CareerDirect), we evaluate your academic strengths, problem-solving abilities, and practical skills to identify careers where you\'ll naturally excel.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.75rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: 'var(--navy)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#e8b856', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pricing</div>
        <h2 style={{ fontFamily: 'Georgia,serif', color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.4rem)', marginBottom: '1rem' }}>Simple, once-off pricing</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 3rem', fontWeight: 300, lineHeight: 1.7 }}>One payment. One comprehensive report. For every high school student, every grade.</p>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 400, margin: '0 auto', border: '1px solid var(--gold)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '1rem' }}>Complete Assessment Package</h3>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)' }}>R{price}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-mid)', marginBottom: '1.5rem' }}>+ VAT · once-off · includes everything</div>
          <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem' }}>
            {[
              'Grade-tailored assessment',
              'Top 3 personalised career matches',
              'Grade 10 subject recommendations',
              'NSC targets & university guidance',
              'AI impact analysis per career',
              'Parent or guardian note',
              'Printable PDF report',
              'Save and revisit anytime',
            ].map(item => (
              <li key={item} style={{ color: 'var(--text-mid)', fontSize: '0.9rem', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <Link href="/register" style={{ display: 'block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '13px', textAlign: 'center', textDecoration: 'none', fontWeight: 500 }}>
            Get started now
          </Link>
        </div>
      </section>

      <footer style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} PickMyPath · All rights reserved ·{' '}
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Admin</Link>
        </p>
      </footer>
    </>
  )
}
