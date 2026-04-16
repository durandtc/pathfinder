import nodemailer from 'nodemailer'

export async function sendReportEmail({ toEmail, toName, reportHtml, assessmentId }) {
  // Using SendGrid's SMTP relay (works with nodemailer, no extra SDK needed)
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  })

  const fromName = process.env.SENDGRID_FROM_NAME || 'PathFinder SA'
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'reports@pathfindersa.co.za'

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: `"${toName}" <${toEmail}>`,
    subject: `Your PathFinder SA Career Report — ${toName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:#0f1f3d;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#c9973a;font-family:Georgia,serif;margin:0 0 8px">PathFinder SA</h1>
          <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px">Your personalised career guidance report is ready</p>
        </div>
        <p style="font-size:15px;color:#1a1a2e">Hi <strong>${toName}</strong>,</p>
        <p style="font-size:14px;color:#4a4a6a;line-height:1.6">
          Thank you for completing your PathFinder SA career assessment. Your full personalised report is attached as an HTML file below — open it in any browser to view it beautifully formatted.
        </p>
        <p style="font-size:14px;color:#4a4a6a;line-height:1.6">
          Your report includes your top 3 career matches, the Grade 10 subjects you should choose, the marks you need to aim for, and an honest assessment of how AI will affect each career path.
        </p>
        <p style="font-size:13px;color:#7a7a9a;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
          PathFinder SA · This report is a guidance tool. We recommend discussing it with a school counsellor or career guidance professional.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `PathFinder-Report-${toName.replace(/\s+/g, '-')}.html`,
        content: reportHtml,
        contentType: 'text/html',
      },
    ],
  })
}

export async function sendPaymentConfirmationEmail({ toEmail, toName, amount }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
  })

  const fromName = process.env.SENDGRID_FROM_NAME || 'PathFinder SA'
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'reports@pathfindersa.co.za'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: `"${toName}" <${toEmail}>`,
    subject: 'Payment confirmed — start your PathFinder SA assessment',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:#0f1f3d;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#c9973a;font-family:Georgia,serif;margin:0 0 8px">Payment confirmed!</h1>
          <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px">R${amount} received</p>
        </div>
        <p>Hi <strong>${toName}</strong>, your payment is confirmed. Click below to start your assessment:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${appUrl}/assessment" style="background:#c9973a;color:#0f1f3d;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px">
            Start My Assessment →
          </a>
        </div>
        <p style="font-size:13px;color:#7a7a9a">The assessment takes approximately 15–20 minutes. You can complete it at any time.</p>
      </div>
    `,
  })
}
