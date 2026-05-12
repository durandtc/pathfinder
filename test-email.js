 // pages/api/test-email.js
  import nodemailer from 'nodemailer'

  export default async function handler(req, res) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    try {
      await transport.verify()
      res.status(200).json({ success: true, message: 'SMTP connection OK' })
    } catch (err) {
      res.status(500).json({ success: false, error: err.message })
    }
  }