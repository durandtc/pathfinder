import { randomBytes } from 'crypto'

// Generate a secure random hex token
export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString('hex')
}

// 24 hours from now
export function verifyTokenExpiry() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

// 1 hour from now
export function resetTokenExpiry() {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString()
}

// Check if a token expiry timestamp is still valid
export function isTokenValid(expiryString) {
  if (!expiryString) return false
  return new Date(expiryString) > new Date()
}
