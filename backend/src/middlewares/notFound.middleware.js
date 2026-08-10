import { AppError } from '../utils/AppError.js'

export const notFound = (req, res, next) => {
  next(new AppError(`Route topilmadi: ${req.method} ${req.originalUrl}`, 404))
}
