import bcrypt from 'bcryptjs'
import { prisma } from '../config/database.js'
import { asyncHandler, AppError } from '../utils/AppError.js'
import { successResponse, noContentResponse, paginatedResponse } from '../utils/response.js'

const USER_SELECT = {
  id:          true,
  email:       true,
  username:    true,
  fullName:    true,
  avatarUrl:   true,
  bio:         true,
  role:        true,
  isActive:    true,
  isVerified:  true,
  createdAt:   true,
  lastLoginAt: true,
}

/**
 * GET /api/users — All users (admin)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1)
  const limit  = Math.min(50, parseInt(req.query.limit) || 20)
  const skip   = (page - 1) * limit
  const search = req.query.search

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email:    { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take:    limit,
      select:  USER_SELECT,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return paginatedResponse(res, users, total, page, limit)
})

/**
 * GET /api/users/stats — Dashboard stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalArticles,
    publishedArticles,
    totalUsers,
    totalComments,
    pendingComments,
    totalViews,
    recentArticles,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: 'PENDING' } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.findMany({
      where:   { status: 'PUBLISHED' },
      take:    5,
      orderBy: { viewCount: 'desc' },
      select:  { id: true, title: true, slug: true, viewCount: true, publishedAt: true,
                 category: { select: { name: true, color: true } } },
    }),
  ])

  return successResponse(res, {
    articles: { total: totalArticles, published: publishedArticles, draft: totalArticles - publishedArticles },
    users:    { total: totalUsers },
    comments: { total: totalComments, pending: pendingComments },
    views:    { total: totalViews._sum.viewCount || 0 },
    popularArticles: recentArticles,
  })
})

/**
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.params.id },
    select: USER_SELECT,
  })
  if (!user) throw new AppError('Foydalanuvchi topilmadi', 404)
  return successResponse(res, user)
})

/**
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, username } = req.body
  const userId = req.user.id

  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, id: { not: userId } },
    })
    if (taken) throw new AppError('Bu username band', 409)
  }

  const updated = await prisma.user.update({
    where:  { id: userId },
    data:   { fullName, bio, username },
    select: USER_SELECT,
  })

  return successResponse(res, updated, 'Profil yangilandi')
})

/**
 * PUT /api/users/password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) throw new AppError('Joriy parol noto\'g\'ri', 400)

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } })

  // Revoke all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } })

  return successResponse(res, null, 'Parol muvaffaqiyatli o\'zgartirildi')
})

/**
 * PATCH /api/users/:id/block (admin)
 */
export const blockUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) throw new AppError('Foydalanuvchi topilmadi', 404)
  if (user.role === 'SUPER_ADMIN') throw new AppError('Super adminni bloklab bo\'lmaydi', 403)

  const updated = await prisma.user.update({
    where:  { id: req.params.id },
    data:   { isActive: !user.isActive },
    select: USER_SELECT,
  })

  return successResponse(res, updated, updated.isActive ? 'Blokdan chiqarildi' : 'Bloklandi')
})

/**
 * PATCH /api/users/:id/role (admin)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const allowed  = ['USER', 'EDITOR', 'ADMIN']

  if (!allowed.includes(role)) throw new AppError('Noto\'g\'ri role', 400)

  const updated = await prisma.user.update({
    where:  { id: req.params.id },
    data:   { role },
    select: USER_SELECT,
  })

  return successResponse(res, updated, `Role ${role} ga o'zgartirildi`)
})

/**
 * DELETE /api/users/:id (admin)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) throw new AppError('Foydalanuvchi topilmadi', 404)
  if (user.role === 'SUPER_ADMIN') throw new AppError('Super adminni o\'chirib bo\'lmaydi', 403)

  await prisma.user.delete({ where: { id: req.params.id } })
  return noContentResponse(res)
})
