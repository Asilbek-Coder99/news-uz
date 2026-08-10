import { AppError } from '../utils/AppError.js'

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint failed
      const field = error.meta?.target?.[0] || 'field'
      return new AppError(`Bu ${field} allaqachon mavjud`, 409)

    case 'P2025':
      // Record not found
      return new AppError('Resurs topilmadi', 404)

    case 'P2003':
      // Foreign key constraint
      return new AppError("Bog'liq resurs topilmadi", 400)

    case 'P2014':
      // Relation violation
      return new AppError('Munosabat xatosi', 400)

    default:
      return new AppError('Database xatosi', 500)
  }
}

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Noto\'g\'ri token. Iltimos qayta kiring', 401)
const handleJWTExpiredError = () => new AppError('Token muddati tugagan. Iltimos qayta kiring', 401)

/**
 * Development error — full stack trace
 */
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success:    false,
    message:    err.message,
    statusCode: err.statusCode,
    error:      err,
    stack:      err.stack,
  })
}

/**
 * Production error — safe message only
 */
const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  } else {
    // Programming error — don't leak details
    console.error('💥 UNEXPECTED ERROR:', err)
    res.status(500).json({
      success: false,
      message: 'Ichki server xatosi',
    })
  }
}

/**
 * Global error handler middleware
 * Must have 4 params for Express to recognize it as error handler
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  // Log all errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [${req.method}] ${req.path}:`, err.message)
  }

  let error = { ...err, message: err.message }

  // Transform known error types
  if (err.name === 'JsonWebTokenError')  error = handleJWTError()
  if (err.name === 'TokenExpiredError')  error = handleJWTExpiredError()
  if (err.code?.startsWith('P'))         error = handlePrismaError(err)
  if (err.name === 'ValidationError')    error = new AppError(err.message, 400)
  if (err.name === 'CastError')          error = new AppError('Noto\'g\'ri ID formati', 400)
  if (err.type === 'entity.too.large')   error = new AppError('Fayl juda katta', 413)

  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, res)
  } else {
    sendProdError(error, res)
  }
}
