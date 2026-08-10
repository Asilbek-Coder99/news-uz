/**
 * NEWS.UZ — Shared Types (JSDoc)
 * Since we use plain JS, types are documented here for IDE support.
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} fullName
 * @property {string|null} avatarUrl
 * @property {'USER'|'EDITOR'|'ADMIN'|'SUPER_ADMIN'} role
 * @property {boolean} isActive
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} nameUz
 * @property {string} slug
 * @property {string} color
 * @property {string|null} icon
 * @property {string|null} parentId
 * @property {Category[]} children
 */

/**
 * @typedef {Object} Article
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} excerpt
 * @property {string} content
 * @property {string|null} coverImage
 * @property {'DRAFT'|'PUBLISHED'|'ARCHIVED'} status
 * @property {boolean} isFeatured
 * @property {boolean} isBreaking
 * @property {boolean} isTrending
 * @property {number} viewCount
 * @property {number} readTimeMin
 * @property {string} publishedAt
 * @property {Category} category
 * @property {string} authorName
 * @property {Tag[]} tags
 * @property {number} _count
 */

/**
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} content
 * @property {'PENDING'|'APPROVED'|'REJECTED'} status
 * @property {string} createdAt
 * @property {User} user
 * @property {Comment[]} replies
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} data
 * @property {string} [message]
 * @property {string} [error]
 */

export {}
