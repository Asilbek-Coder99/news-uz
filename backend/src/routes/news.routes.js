import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate, optionalAuth, requireEditor } from '../middlewares/auth.middleware.js'
import {
  getArticles,
  getFeaturedArticles,
  getTrendingArticles,
  getBreakingArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getRelatedArticles,
} from '../controllers/news.controller.js'
import {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
} from '../validators/schemas.js'

const router = Router()

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/news — List articles (paginated, filtered)
router.get('/', validate(articleQuerySchema, 'query'), optionalAuth, getArticles)

// GET /api/news/featured
router.get('/featured', getFeaturedArticles)

// GET /api/news/trending
router.get('/trending', getTrendingArticles)

// GET /api/news/breaking
router.get('/breaking', getBreakingArticles)

// GET /api/news/:slug — Single article (increments view count)
router.get('/:slug', optionalAuth, getArticleBySlug)

// GET /api/news/:slug/related
router.get('/:slug/related', getRelatedArticles)

// ─── PROTECTED (EDITOR+) ─────────────────────────────────────

// POST /api/news
router.post('/', authenticate, requireEditor, validate(createArticleSchema), createArticle)

// PUT /api/news/:id
router.put('/:id', authenticate, requireEditor, validate(updateArticleSchema), updateArticle)

// DELETE /api/news/:id
router.delete('/:id', authenticate, requireEditor, deleteArticle)

export default router
