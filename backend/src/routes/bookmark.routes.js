import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { toggleBookmark, getUserBookmarks } from '../controllers/bookmark.controller.js'

const router = Router()

// POST /api/bookmarks/:articleId — Toggle bookmark
router.post('/:articleId', authenticate, toggleBookmark)

// GET /api/bookmarks — Get current user's bookmarks
router.get('/', authenticate, getUserBookmarks)

export default router
