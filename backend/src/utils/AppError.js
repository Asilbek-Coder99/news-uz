/**
 * Custom operational error with HTTP status
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Wrap async route handlers to catch errors
 * Eliminates try/catch boilerplate in every controller
 *
 * @param {Function} fn - async express handler
 * @returns {Function} wrapped handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
