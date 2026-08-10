import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { toggleLike, getLikesForArticle } from '../controllers/like.controller.js'

const router = Router()

// POST /api/likes/:articleId — Toggle like
router.post('/:articleId', authenticate, toggleLike)

// GET /api/likes/:articleId — Get like count and user's like status
router.get('/:articleId', authenticate, getLikesForArticle)

export default router
