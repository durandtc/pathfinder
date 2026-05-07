// PickMyPath — Email delivery via domains.co.za SMTP
// Requires nodemailer: npm install nodemailer
// Add SMTP credentials to .env.local:
//   SMTP_HOST=mail.pickmypath.co.za
//   SMTP_PORT=465
//   SMTP_SECURE=true
//   SMTP_USER=noreply@pickmypath.co.za
//   SMTP_PASS=your_password

import nodemailer from 'nodemailer'

const FROM_NAME  = process.env.EMAIL_FROM_NAME  || 'PickMyPath'
const FROM_EMAIL = process.env.SMTP_USER || 'noreply@pickmypath.co.za'
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

let transporter

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

async function sendViaSMTP({ to, subject, html }) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  })
}

// ── VERIFY EMAIL ─────────────────────────────────────────────
export async function sendVerificationEmail({ toEmail, toName, token }) {
  const verifyUrl = `${APP_URL}/auth/verify?token=${token}`
  await sendViaSMTP({
    to: toEmail,
    subject: 'Verify your PickMyPath email address',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#0f1f3d;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#c9973a;font-family:Georgia,serif;margin:0 0 6px;font-size:24px">PickMyPath</h1>
          <p style="color:rgba(255,255,255,0.65);margin:0;font-size:14px">Verify your email address</p>
        </div>
        <p style="font-size:15px;color:#1a1a2e">Hi <strong>${toName}</strong>,</p>
        <p style="font-size:14px;color:#4a4a6a;line-height:1.7">
          Thanks for registering. Please verify your email address to ensure you receive important updates about your assessment.
        </p>
        <div style="text-align:center;margin:28px 0">
          <a href="${verifyUrl}" style="background:#c9973a;color:#0f1f3d;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:15px;display:inline-block">
            Verify Email Address
          </a>
        </div>
        <p style="font-size:13px;color:#7a7a9a">This link expires in 24 hours. If you did not create a PickMyPath account, you can safely ignore this email.</p>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#aaa;text-align:center">
          PickMyPath · AI-powered career guidance for South African students
        </div>
      </div>
    `,
  })
}

// ── PASSWORD RESET ────────────────────────────────────────────
export async function sendPasswordResetEmail({ toEmail, toName, token }) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`
  await sendViaSMTP({
    to: toEmail,
    subject: 'Reset your PickMyPath password',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#0f1f3d;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#c9973a;font-family:Georgia,serif;margin:0 0 6px;font-size:24px">PickMyPath</h1>
          <p style="color:rgba(255,255,255,0.65);margin:0;font-size:14px">Password reset request</p>
        </div>
        <p style="font-size:15px;color:#1a1a2e">Hi <strong>${toName}</strong>,</p>
        <p style="font-size:14px;color:#4a4a6a;line-height:1.7">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <div style="text-align:center;margin:28px 0">
          <a href="${resetUrl}" style="background:#c9973a;color:#0f1f3d;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:15px;display:inline-block">
            Reset My Password
          </a>
        </div>
        <p style="font-size:13px;color:#7a7a9a">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#aaa;text-align:center">
          PickMyPath · AI-powered career guidance for South African students
        </div>
      </div>
    `,
  })
}
