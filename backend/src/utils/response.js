/**
 * NEWS.UZ — Standardized API Response Utilities
 * All responses follow: { success, data, message, meta }
 */

/**
 * Success response
 * @param {Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 * @param {Object} meta - pagination, etc.
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200, meta = null) => {
  const response = { success: true, message, data }
  if (meta) response.meta = meta
  return res.status(statusCode).json(response)
}

/**
 * Error response
 */
export const errorResponse = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = { success: false, message }
  if (errors) response.errors = errors
  return res.status(statusCode).json(response)
}

/**
 * Created response (201)
 */
export const createdResponse = (res, data, message = 'Created successfully') =>
  successResponse(res, data, message, 201)

/**
 * Paginated response
 */
export const paginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  const totalPages = Math.ceil(total / limit)
  return successResponse(res, data, message, 200, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  })
}

/**
 * No content (204)
 */
export const noContentResponse = (res) => res.status(204).send()
