import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js'
import {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  blockUser,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} from '../controllers/user.controller.js'
import { updateUserSchema, changePasswordSchema } from '../validators/schemas.js'

const router = Router()

// GET /api/users — All users (admin)
router.get('/', authenticate, requireAdmin, getUsers)

// GET /api/users/stats — Dashboard stats (admin)
router.get('/stats', authenticate, requireAdmin, getDashboardStats)

// GET /api/users/:id
router.get('/:id', authenticate, getUserById)

// PUT /api/users/profile — Update own profile
router.put('/profile', authenticate, validate(updateUserSchema), updateProfile)

// PUT /api/users/password — Change password
router.put('/password', authenticate, validate(changePasswordSchema), changePassword)

// PATCH /api/users/:id/block (admin)
router.patch('/:id/block', authenticate, requireAdmin, blockUser)

// PATCH /api/users/:id/role (admin)
router.patch('/:id/role', authenticate, requireAdmin, updateUserRole)

// DELETE /api/users/:id (admin)
router.delete('/:id', authenticate, requireAdmin, deleteUser)

export default router
