import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/auth.controller.js'
import { registerSchema, loginSchema, refreshSchema } from '../validators/schemas.js'

const router = Router()

// POST /api/auth/register
router.post('/register', validate(registerSchema), register)

// POST /api/auth/login
router.post('/login', validate(loginSchema), login)

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), refresh)

// POST /api/auth/logout
router.post('/logout', authenticate, logout)

// GET /api/auth/me
router.get('/me', authenticate, getMe)

export default router
