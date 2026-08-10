import slugifyLib from 'slugify'

/**
 * Generate URL-safe slug from title (supports Uzbek/Cyrillic)
 */
export const slugify = (text) =>
  slugifyLib(text, {
    lower:       true,
    strict:      true,
    locale:      'uz',
    replacement: '-',
    trim:        true,
  })

/**
 * Generate a unique slug by appending a timestamp if needed
 * @param {string} title
 * @param {Function} checkExists - async (slug) => boolean
 */
export const generateUniqueSlug = async (title, checkExists) => {
  let slug    = slugify(title)
  let exists  = await checkExists(slug)
  let counter = 1

  while (exists) {
    const newSlug = `${slug}-${counter}`
    exists        = await checkExists(newSlug)
    if (!exists) { slug = newSlug; break }
    counter++
  }

  return slug
}

/**
 * Calculate estimated read time in minutes
 * Based on average 200 words per minute
 */
export const calculateReadTime = (content) => {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

/**
 * Parse pagination query params with defaults and limits
 */
export const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

/**
 * Parse sort query param
 * e.g. ?sort=-createdAt  => { createdAt: 'desc' }
 *      ?sort=viewCount   => { viewCount: 'asc' }
 */
export const parseSort = (sortStr, allowed = []) => {
  if (!sortStr) return { createdAt: 'desc' }
  const desc  = sortStr.startsWith('-')
  const field = desc ? sortStr.slice(1) : sortStr
  if (allowed.length && !allowed.includes(field)) return { createdAt: 'desc' }
  return { [field]: desc ? 'desc' : 'asc' }
}

/**
 * Sanitize HTML content (strip script tags)
 */
export const sanitizeHtml = (html) => {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
}

/**
 * Truncate text to a given length
 */
export const truncate = (text, length = 150) => {
  if (!text || text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k    = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i    = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
