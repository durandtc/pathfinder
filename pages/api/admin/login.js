import { signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin credentials not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment variables.' })
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials.' })
  }

  const token = signToken({ email, isAdmin: true })
  res.setHeader('Set-Cookie', `pf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${4 * 3600}`)

  return res.status(200).json({ ok: true })
}
