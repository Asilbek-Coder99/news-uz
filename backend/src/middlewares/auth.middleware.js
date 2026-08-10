import { verifyAccessToken } from '../config/jwt.js'
import { prisma } from '../config/database.js'
import { AppError } from '../utils/AppError.js'

/**
 * Authenticate — requires valid JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token topilmadi. Iltimos tizimga kiring', 401)
    }

    const token   = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: {
        id:        true,
        email:     true,
        username:  true,
        fullName:  true,
        avatarUrl: true,
        role:      true,
        isActive:  true,
      },
    })

    if (!user)           throw new AppError('Foydalanuvchi topilmadi', 401)
    if (!user.isActive)  throw new AppError('Hisobingiz bloklangan', 403)

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Optional authenticate — doesn't throw if no token
 * Sets req.user if valid token exists
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return next()

    const token   = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, username: true, role: true, isActive: true },
    })

    if (user?.isActive) req.user = user
    next()
  } catch {
    next()  // Ignore auth errors for optional routes
  }
}

/**
 * Require specific roles
 * @param {...string} roles
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Tizimga kirish talab etiladi', 401))
  }
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Bu amalni bajarishga ruxsatingiz yo\'q', 403))
  }
  next()
}

// Convenience shortcuts
export const requireAdmin       = requireRole('ADMIN', 'SUPER_ADMIN')
export const requireEditor      = requireRole('EDITOR', 'ADMIN', 'SUPER_ADMIN')
export const requireSuperAdmin  = requireRole('SUPER_ADMIN')
