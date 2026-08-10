import { ZodError } from 'zod'
import { errorResponse } from '../utils/response.js'

/**
 * Validate request body/params/query with a Zod schema
 * @param {ZodSchema} schema
 * @param {'body'|'params'|'query'} source
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const data = schema.parse(req[source])
    req[source] = data   // replace with parsed+coerced data
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
      return errorResponse(res, 'Validation xatosi', 422, errors)
    }
    next(err)
  }
}
