import jwt from 'jsonwebtoken'

const ACCESS_SECRET  = process.env.JWT_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ACCESS_EXPIRY  = process.env.JWT_EXPIRES_IN  || '15m'
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

/**
 * Sign an access token
 * @param {Object} payload - { id, role, username }
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY })

/**
 * Sign a refresh token
 * @param {Object} payload - { id }
 */
export const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY })

/**
 * Verify access token
 * @param {string} token
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET)

/**
 * Verify refresh token
 * @param {string} token
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET)

/**
 * Get expiry in ms from JWT string like '7d', '15m'
 */
export const getExpiryMs = (str) => {
  const unit  = str.slice(-1)
  const value = parseInt(str)
  const map   = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return value * (map[unit] || 1000)
}
