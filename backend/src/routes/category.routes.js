import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js'
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js'
import { createCategorySchema, updateCategorySchema } from '../validators/schemas.js'

const router = Router()

// GET /api/categories — All categories with children
router.get('/', getCategories)

// GET /api/categories/:slug
router.get('/:slug', getCategoryBySlug)

// POST /api/categories (admin)
router.post('/', authenticate, requireAdmin, validate(createCategorySchema), createCategory)

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), updateCategory)

// DELETE /api/categories/:id (admin)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router
