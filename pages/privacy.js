import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — PickMyPath</title>
      </Head>
      <Nav />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', color: 'var(--navy)', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Last updated: May 2026
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Overview</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            PickMyPath ("we," "us," or "our") operates the career guidance platform at pickmypath.co.za. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our service.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. What Information We Collect</h2>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: '#333', fontSize: '1rem', marginBottom: '0.3rem' }}>Account Information</h3>
            <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
              <li>Full name (account holder)</li>
              <li>Student's name (the person being assessed)</li>
              <li>Email address</li>
              <li>Password (hashed securely)</li>
              <li>School, university, or employer name (optional)</li>
              <li>Current grade or career stage</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: '#333', fontSize: '1rem', marginBottom: '0.3rem' }}>Assessment Data</h3>
            <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
              <li>Your responses to 45+ assessment questions (interests, values, aptitudes)</li>
              <li>School marks across subjects (Mathematics, Languages, Sciences, etc.)</li>
              <li>Parent observations (if applicable)</li>
              <li>Generated career report and AI analysis</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: '#333', fontSize: '1rem', marginBottom: '0.3rem' }}>Payment Information</h3>
            <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
              <li>Payment method and transaction ID (processed via PayFast)</li>
              <li>Payment status and date</li>
              <li>We do NOT store full credit card details — PayFast handles this securely</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. How We Use Your Information</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1rem' }}>
            We use your information for the following purposes:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li><strong>To deliver the service:</strong> Generate your personalized career report</li>
            <li><strong>To authenticate your account:</strong> Log in, password recovery, email verification</li>
            <li><strong>To process payments:</strong> Securely handle your transaction via PayFast</li>
            <li><strong>To improve the platform:</strong> Analyze (anonymized) assessment patterns and report quality</li>
            <li><strong>To contact you:</strong> Send verification emails, password reset links, or service notifications</li>
            <li><strong>To comply with law:</strong> Respond to legal requests or fulfill regulatory obligations</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Who We Share Your Data With</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1rem' }}>
            We do NOT sell, rent, or trade your personal information. However, we share data with the following trusted service providers:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li><strong>Supabase (PostgreSQL database):</strong> Stores your account, assessment data, and reports securely</li>
            <li><strong>Anthropic (Claude AI):</strong> Your assessment responses are sent to generate your personalized report (see Section 5 below)</li>
            <li><strong>PayFast (Payment processor):</strong> Handles payment transactions securely</li>
            <li><strong>Vercel (Hosting provider):</strong> Hosts our platform</li>
            <li><strong>Email provider (domains.co.za):</strong> Sends verification and transactional emails</li>
          </ul>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            All service providers are contractually bound to protect your data and use it only for the purposes we specify.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>5. AI and Assessment Data Processing</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1rem' }}>
            When you submit your assessment, your responses are sent to Anthropic's Claude AI API to generate your personalized report. Please be aware:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>Your responses are transmitted securely (HTTPS encrypted)</li>
            <li>Anthropic processes your data according to their Privacy Policy (https://www.anthropic.com/privacy)</li>
            <li>Your assessment responses may be retained temporarily to generate your report</li>
            <li>Anthropic may use this data to improve their AI models (with appropriate safeguards)</li>
            <li>We do not control Anthropic's use of data beyond generating your report</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>6. Data Retention</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            We retain your information for as long as your account is active. When you delete your account:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>Your account and assessment data are deleted from our system</li>
            <li>Your generated reports are deleted</li>
            <li>Email records and transaction logs may be retained for compliance purposes (up to 7 years for financial records)</li>
            <li>Anonymized usage patterns may be retained for platform improvement</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>7. Security</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            We take the security of your data seriously:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li>All data is transmitted using HTTPS encryption</li>
            <li>Passwords are hashed using bcryptjs (industry-standard)</li>
            <li>Authentication uses JWT tokens (secure, time-limited)</li>
            <li>Database access is restricted to authenticated API calls only</li>
            <li>We regularly monitor for security vulnerabilities</li>
          </ul>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            However, no system is 100% secure. If you suspect unauthorized access, please contact us immediately.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>8. Your Rights</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            Depending on your location, you may have the following rights:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li><strong>Right to access:</strong> Request a copy of your personal data</li>
            <li><strong>Right to rectify:</strong> Update or correct your information</li>
            <li><strong>Right to delete:</strong> Request deletion of your account and data</li>
            <li><strong>Right to data portability:</strong> Request your data in a portable format</li>
            <li><strong>Right to object:</strong> Opt out of certain data processing (where applicable)</li>
          </ul>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            To exercise any of these rights, please contact us at support@pickmypath.co.za.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>9. Cookies & Tracking</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            We use:
          </p>
          <ul style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginLeft: '1.5rem' }}>
            <li><strong>Authentication cookies:</strong> To keep you logged in (7-day expiry)</li>
            <li><strong>Local storage:</strong> To save your assessment progress temporarily (in-browser only)</li>
            <li><strong>Analytics:</strong> We do not use Google Analytics or third-party tracking (privacy-first approach)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>10. Third-Party Links</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            Our platform may link to external websites (universities, career resources, etc.). We are not responsible for their privacy practices. Always review their privacy policies before providing information.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>11. Children & Minors</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            PickMyPath is designed for high school students (Grade 8–12, typically ages 13+). Parents or guardians must provide consent before their child's data is collected. We do not knowingly collect data from children under 13 without parental consent.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>12. Changes to This Policy</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on our site. Your continued use of the service after changes constitutes your acceptance.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>13. Contact Us</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            If you have questions about this Privacy Policy or our data practices:
          </p>
          <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            <strong>Email:</strong> support@pickmypath.co.za<br />
            <strong>Hours:</strong> Monday–Friday, 9am–5pm SAST
          </p>
        </section>

        <section style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0f7ff', borderRadius: 12, borderLeft: '4px solid var(--gold)' }}>
          <p style={{ color: 'var(--navy)', lineHeight: 1.7, margin: 0 }}>
            We are committed to protecting your privacy. If you believe we have not handled your data responsibly, please reach out so we can address your concerns.
          </p>
        </section>

        <p style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: 'var(--navy)', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    </>
  )
}
