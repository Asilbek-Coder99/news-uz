/**
 * XAVFSIZLIK MIDDLEWARE — Kengaytirilgan versiya
 * XSS, SQL injection, brute force va boshqa hujumlardan himoya
 */
import { rateLimit } from 'express-rate-limit'
import { AppError }  from '../utils/AppError.js'

// ─── UMUMIY RATE LIMITER ──────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,  // 15 daqiqa
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi, 15 daqiqadan keyin qaytadan urinib ko'ring",
  },
})

// ─── AUTH RATE LIMITER (qattiqroq) ───────────────────────────
export const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  skipSuccessfulRequests: true, // Muvaffaqiyatli so'rovlar hisoblanmaydi
  message: {
    success: false,
    message: "Juda ko'p kirish urinishi, 15 daqiqadan keyin qaytadan urinib ko'ring",
  },
})

// ─── UPLOAD RATE LIMITER ─────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 daqiqa
  max:      10,
  message: {
    success: false,
    message: "Juda ko'p fayl yuklash urinishi",
  },
})

// ─── REQUEST SIZE TEKSHIRUVI ─────────────────────────────────
export const checkRequestSize = (maxMb = 10) => (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || 0)
  const maxBytes      = maxMb * 1024 * 1024

  if (contentLength > maxBytes) {
    return next(new AppError(`So'rov hajmi ${maxMb}MB dan oshib ketdi`, 413))
  }
  next()
}

// ─── SQL INJECTION TEKSHIRUVI (asosiy) ──────────────────────
const SQL_PATTERNS = [
  /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\s/gi,
  /--/g,
  /\/\*/g,
]

export const sqlInjectionGuard = (req, res, next) => {
  const check = (val) => {
    if (typeof val !== 'string') return false
    return SQL_PATTERNS.some(p => p.test(val))
  }

  const suspicious = Object.values(req.body  || {}).some(check) ||
                     Object.values(req.query  || {}).some(check) ||
                     Object.values(req.params || {}).some(check)

  if (suspicious) {
    return next(new AppError("Noto'g'ri so'rov", 400))
  }
  next()
}

// ─── CONTENT TYPE TEKSHIRUVI ─────────────────────────────────
export const requireJsonBody = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('application/json') &&
        !contentType.includes('multipart/form-data')) {
      return next(new AppError('Content-Type: application/json bo\'lishi kerak', 415))
    }
  }
  next()
}
