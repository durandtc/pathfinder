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
            AI-Powered Career Clarity · South Africa
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Your child's next big school decision <span style={{ color: '#c9973a' }}>doesn't have to be a guess</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300, maxWidth: 620, margin: '0 auto 2.5rem' }}>
            In 45 minutes, discover what your child is actually good at, what they love, and what subjects lead where. Get clarity before the decision is made — not after.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '14px 32px', fontSize: '1rem', fontWeight: 500, textDecoration: 'none' }}>
              Start Now — R{price}
            </Link>
            <a href="#how" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '14px 32px', fontSize: '1rem', textDecoration: 'none' }}>
              How it works
            </a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            {[['45 mins', 'To clarity'], ['3', 'Career matches'], ['100%', 'Your unique profile'], ['CAPS', 'SA aligned']].map(([n, l]) => (
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
        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Built for every stage</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Grade 9 is where the action is. But every year matters.</h2>
        <p style={{ color: 'var(--text-mid)', maxWidth: 620, fontWeight: 300, marginBottom: '3rem', lineHeight: 1.7 }}>Subject choices at Grade 9 are irreversible. But Grade 8 is the time to discover yourself. And Grades 10–12 need confirmation you're still on the right path.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            ['🔍', 'Grade 8', 'Get ahead. Discover your strengths before the pressure hits. Know what you\'re good at before you have to choose.'],
            ['⭐', 'Grade 9', 'Make it count. You\'re about to lock in two years of subjects. Get this right — not lucky.'],
            ['✓', 'Grade 10–12', 'Stay on track. Confirm your subjects still fit. Set realistic NSC targets. Plan your post-school move with confidence.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: title === 'Grade 9' ? '2px solid var(--gold)' : '1px solid var(--border)', boxShadow: 'var(--shadow)', position: 'relative' }}>
              {title === 'Grade 9' && <div style={{ position: 'absolute', top: -12, left: 16, background: 'var(--gold)', color: 'var(--navy)', padding: '4px 12px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Where the action is</div>}
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT MAKES THIS DIFFERENT */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Why PickMyPath works</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Not a personality test. Not a guess.</h2>
        <p style={{ color: 'var(--text-mid)', maxWidth: 620, fontWeight: 300, marginBottom: '3rem', lineHeight: 1.7 }}>We combine three data sources — what your child loves, what they're actually good at, and what they value — with their real school marks to create a complete picture.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            ['❤️', 'What they love', 'Interest-based matching (Holland RIASEC). Over 60 years of research shows: people excel in careers they\'re passionate about.'],
            ['📊', 'What they\'re good at', 'Real school marks tell the true story. We see the gap between self-confidence and actual performance — and surface hidden potential.'],
            ['💭', 'What matters to them', 'Career values matter for long-term happiness. We explore what kind of work environment, pace, and impact they need.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.75rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--cream-mid)', borderRadius: 12, borderLeft: '4px solid var(--gold)' }}>
          <p style={{ color: 'var(--navy)', fontSize: '0.9rem', fontWeight: 300, margin: 0 }}>
            <strong>Validated frameworks.</strong> PickMyPath is built on the same assessment models used by professional career counselors worldwide.
            Coming soon: Expert review by a registered psychometrist.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: 'var(--cream-mid)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>How it works</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--navy)', marginBottom: '1rem' }}>Four steps to a real answer</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 580, fontWeight: 300, marginBottom: '3rem', lineHeight: 1.7 }}>45 minutes total. Your child answers questions. You add the marks. AI does the thinking. You get the clarity.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {[
              ['1️⃣', 'Student takes the assessment', '20 minutes. 45+ honest questions about what they love, what they\'re good at, what matters to them.'],
              ['2️⃣', 'Parent adds the marks', '10 minutes. You enter their term marks across subjects. This is the data that reveals their real potential.'],
              ['3️⃣', 'AI connects the dots', 'Instant. Claude analyzes interests + aptitude + values + actual performance. Finds real career matches.'],
              ['4️⃣', 'You get the report', 'Personalized, printable, actionable. Top 3 careers. The subjects that lead there. What to do next.'],
            ].map(([icon, t, d]) => (
              <div key={t} style={{ background: 'var(--white)', borderRadius: 12, padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', marginBottom: '0.5rem' }}>{t}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: 'var(--navy)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#e8b856', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Investment</div>
        <h2 style={{ fontFamily: 'Georgia,serif', color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.4rem)', marginBottom: '1rem' }}>One payment. Peace of mind.</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto 3rem', fontWeight: 300, lineHeight: 1.7 }}>Your child's subject choice is one of the most important decisions they'll make. For less than a pair of school shoes, get the clarity you both need.</p>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 420, margin: '0 auto', border: '2px solid var(--gold)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complete Career Clarity Package</h3>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: '3.2rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.5rem' }}>R{price}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-mid)', marginBottom: '2rem', fontWeight: 500 }}>Once-off payment (including VAT)</div>
          <div style={{ background: 'var(--cream-mid)', padding: '1rem', borderRadius: 8, marginBottom: '2rem' }}>
            <p style={{ color: 'var(--navy)', fontSize: '0.85rem', margin: 0, fontWeight: 300 }}>
              <strong>What you're paying for:</strong> Clarity, not guessing. Confidence, not anxiety. A roadmap for the next two years.
            </p>
          </div>
          <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem' }}>
            {[
              'Your child\'s top 3 career matches',
              'Exact subjects to choose (and why)',
              'What their school marks reveal',
              'Realistic NSC targets',
              'University options aligned to their fit',
              'Parent summary for conversations',
              'Printable forever',
              'View anytime (log back in)',
            ].map(item => (
              <li key={item} style={{ color: 'var(--text-mid)', fontSize: '0.9rem', padding: '8px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 2 }}>✓</span> <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/register" style={{ display: 'block', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, padding: '14px', textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
            Start Their Assessment
          </Link>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-mid)', margin: 0 }}>45 minutes from payment to clarity</p>
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
