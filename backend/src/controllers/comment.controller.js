import { prisma } from '../config/database.js'
import { asyncHandler, AppError } from '../utils/AppError.js'
import { successResponse, createdResponse, noContentResponse, paginatedResponse } from '../utils/response.js'

const COMMENT_INCLUDE = {
  user: {
    select: { id: true, username: true, fullName: true, avatarUrl: true },
  },
  replies: {
    where:   { status: 'APPROVED' },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
    },
  },
}

/**
 * GET /api/comments/:articleId — Public approved comments
 */
export const getComments = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const page  = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(20, parseInt(req.query.limit) || 10)
  const skip  = (page - 1) * limit

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where:   { articleId, status: 'APPROVED', parentId: null },
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: COMMENT_INCLUDE,
    }),
    prisma.comment.count({ where: { articleId, status: 'APPROVED', parentId: null } }),
  ])

  return paginatedResponse(res, comments, total, page, limit)
})

/**
 * POST /api/comments — Create comment (authenticated)
 */
export const createComment = asyncHandler(async (req, res) => {
  const { content, articleId, parentId } = req.body
  const userId = req.user.id

  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) throw new AppError('Maqola topilmadi', 404)

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent) throw new AppError('Asosiy izoh topilmadi', 404)
  }

  // Admin/editor comments are auto-approved
  const status = ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(req.user.role)
    ? 'APPROVED'
    : 'PENDING'

  const comment = await prisma.comment.create({
    data:    { content, articleId, userId, parentId, status },
    include: COMMENT_INCLUDE,
  })

  return createdResponse(
    res,
    comment,
    status === 'APPROVED' ? 'Izoh qo\'shildi' : 'Izohingiz moderatsiyaga yuborildi'
  )
})

/**
 * GET /api/comments — All comments for admin
 */
export const getAllComments = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1)
  const limit  = Math.min(50, parseInt(req.query.limit) || 20)
  const skip   = (page - 1) * limit
  const status = req.query.status

  const where = status ? { status } : {}

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user:    { select: { id: true, username: true, fullName: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.comment.count({ where }),
  ])

  return paginatedResponse(res, comments, total, page, limit)
})

/**
 * PATCH /api/comments/:id/approve — Admin
 */
export const approveComment = asyncHandler(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } })
  if (!comment) throw new AppError('Izoh topilmadi', 404)

  const newStatus = comment.status === 'APPROVED' ? 'PENDING' : 'APPROVED'
  const updated   = await prisma.comment.update({
    where: { id: req.params.id },
    data:  { status: newStatus },
  })

  return successResponse(res, updated, `Izoh ${newStatus === 'APPROVED' ? 'tasdiqlandi' : 'kutishga qaytarildi'}`)
})

/**
 * DELETE /api/comments/:id — Admin or own comment
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } })
  if (!comment) throw new AppError('Izoh topilmadi', 404)

  const isOwner = comment.userId === req.user.id
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)

  if (!isOwner && !isAdmin)
    throw new AppError('Bu izohni o\'chirishga ruxsatingiz yo\'q', 403)

  await prisma.comment.delete({ where: { id: req.params.id } })
  return noContentResponse(res)
})
