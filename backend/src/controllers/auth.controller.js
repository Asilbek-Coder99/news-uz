/**
 * AUTH CONTROLLER
 * Vazifasi: HTTP so'rovni qabul qilish → service ga uzatish → javob qaytarish
 */
import * as authService from '../services/auth.service.js'
import { asyncHandler } from '../utils/AppError.js'
import { successResponse, createdResponse } from '../utils/response.js'

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body)
  return createdResponse(res, result, "Muvaffaqiyatli ro'yxatdan o'tdingiz!")
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await authService.loginUser(email, password)
  return successResponse(res, result, 'Tizimga muvaffaqiyatli kirdingiz!')
})

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.refreshAccessToken(refreshToken)
  return successResponse(res, result, 'Token yangilandi')
})

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  await authService.logoutUser(refreshToken, req.user.id)
  return successResponse(res, null, 'Tizimdan chiqildi')
})

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, { user: req.user })
})
