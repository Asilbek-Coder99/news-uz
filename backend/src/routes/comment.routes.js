import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js'
import {
  getComments,
  createComment,
  approveComment,
  deleteComment,
  getAllComments,
} from '../controllers/comment.controller.js'
import { createCommentSchema } from '../validators/schemas.js'

const router = Router()

// GET /api/comments/:articleId — Approved comments for article
router.get('/:articleId', getComments)

// POST /api/comments — Create comment (auth required)
router.post('/', authenticate, validate(createCommentSchema), createComment)

// GET /api/comments — All comments (admin)
router.get('/', authenticate, requireAdmin, getAllComments)

// PATCH /api/comments/:id/approve (admin)
router.patch('/:id/approve', authenticate, requireAdmin, approveComment)

// DELETE /api/comments/:id (admin or own)
router.delete('/:id', authenticate, deleteComment)

export default router
