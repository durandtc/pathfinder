import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'

export default function Terms() {
  const router = useRouter()
  const returnTo = router.query.returnTo || '/'
  return (
    <>
      <Head>
        <title>Terms of Service — PickMyPath</title>
      </Head>
      <Nav />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '1rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Last updated: May 2026
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Guidance Tool, Not Professional Assessment</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            PickMyPath is an <strong>AI-powered career guidance tool</strong> designed to help high school students and their parents explore career options based on interests, aptitudes, values, and school performance.
          </p>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            <strong>The PickMyPath report is NOT:</strong>
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>A professional psychometric assessment or clinical psychological evaluation</li>
            <li>A substitute for career counseling with a school guidance counselor or registered career advisor</li>
            <li>A guarantee of university admission or career success</li>
            <li>A formal recommendation or diagnosis of any kind</li>
            <li>Verified or endorsed by any regulatory body or professional association</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. AI-Generated Content</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            Your personalized career report is generated using Anthropic's Claude AI. While we have designed the assessment and AI prompts carefully, AI systems can occasionally produce content that is:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>Inaccurate or outdated (especially salary data and market conditions)</li>
            <li>Generic despite being personalized</li>
            <li>Based on patterns in training data, not professional expertise</li>
          </ul>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            We recommend that you verify career information, salary ranges, and admission requirements directly with relevant universities, professional bodies, and industry sources.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Your Responsibility</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            You acknowledge that:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>The information you provide (answers, school marks, interests) must be accurate and honest</li>
            <li>You are responsible for verifying any information in the report before making educational decisions</li>
            <li>You understand this is a starting point for exploration, not a final career decision</li>
            <li>You will consult with qualified professionals (school counselors, career advisors, psychometrists) for major decisions affecting your future</li>
            <li>Career paths, salary data, and market conditions change — the report reflects information at the time of generation</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Limitation of Liability</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            <strong>To the maximum extent permitted by law:</strong> PickMyPath, its creators, and partners are not liable for:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>Any decisions made based on the assessment or report (including subject choices, career selection, university applications)</li>
            <li>Inaccuracies, errors, or omissions in the report or recommendations</li>
            <li>Failure to achieve any outcome implied or suggested in the report</li>
            <li>Loss of opportunity, income, educational advancement, or any other damages resulting from use of this service</li>
            <li>Changes in salary data, university admission requirements, or career market conditions</li>
            <li>Data breaches, service interruptions, or technical failures (though we take security seriously)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>5. Data Privacy & Security</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            By using PickMyPath, you consent to the collection and processing of your information as described in our <Link href="/privacy" style={{ color: '#0f1f3d', fontWeight: 500, textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            Your assessment responses and generated report are stored securely. We do not sell your personal data to third parties. Your data may be used to improve the platform (with sensitive information anonymized).
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>6. Payment & Refunds</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            Payment is processed via PayFast (South African payment gateway). Your assessment and report are non-refundable once completed. However, if you experience a technical failure that prevents you from completing the assessment, please contact us for support.
          </p>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            Refunds are considered on a case-by-case basis for technical issues only.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>7. User Conduct</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            You agree not to:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>Provide false or misleading information during registration or assessment</li>
            <li>Attempt to breach, hack, or circumvent our security systems</li>
            <li>Use the service for any unlawful purpose</li>
            <li>Harass, threaten, or abuse other users or staff</li>
            <li>Reproduce, republish, or redistribute reports without permission</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>8. Changes to These Terms</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            We may update these terms from time to time. Continued use of the service after changes constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>9. Contact & Support</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            If you have questions or concerns about these terms, or if you experience a technical issue, please reach out:
          </p>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            <strong>Email:</strong> support@pickmypath.co.za<br />
            <strong>Hours:</strong> Monday–Friday, 9am–5pm SAST
          </p>
        </section>

        <section style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0f7ff', borderRadius: 12, borderLeft: '4px solid var(--gold)' }}>
          <p style={{ color: 'var(--navy)', lineHeight: 1.7, margin: 0 }}>
            By proceeding with registration and assessment on PickMyPath, you acknowledge that you have read and understood these terms and agree to be bound by them.
          </p>
        </section>

        <p style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
          <Link href={returnTo} style={{ color: 'var(--navy)', textDecoration: 'none' }}>← Back</Link>
        </p>
      </div>
    </>
  )
}
