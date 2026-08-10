import { prisma } from '../config/database.js'
import { asyncHandler, AppError } from '../utils/AppError.js'
import { successResponse } from '../utils/response.js'
import { paginatedResponse } from '../utils/response.js'

/**
 * POST /api/bookmarks/:articleId — Toggle bookmark
 */
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user.id

  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) throw new AppError('Maqola topilmadi', 404)

  const existing = await prisma.bookmark.findUnique({
    where: { articleId_userId: { articleId, userId } },
  })

  let bookmarked
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    bookmarked = false
  } else {
    await prisma.bookmark.create({ data: { articleId, userId } })
    bookmarked = true
  }

  return successResponse(
    res,
    { bookmarked },
    bookmarked ? 'Saqlandi' : 'Saqlashdan olib tashlandi'
  )
})

/**
 * GET /api/bookmarks — User's saved articles
 */
export const getUserBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const page   = Math.max(1, parseInt(req.query.page) || 1)
  const limit  = Math.min(20, parseInt(req.query.limit) || 10)
  const skip   = (page - 1) * limit

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          include: {
            category: { select: { name: true, slug: true, color: true } },
          },
        },
      },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ])

  const articles = bookmarks.map((b) => b.article)

  return res.json({
    success: true,
    data: articles,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
})
