import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function getTokenFromRequest(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/pf_token=([^;]+)/)
  return match ? match[1] : null
}

export function getUserFromRequest(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

// Admin check
export function getAdminFromRequest(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || !payload.isAdmin) return null
  return payload
}
