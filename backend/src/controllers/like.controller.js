import { prisma } from '../config/database.js'
import { asyncHandler, AppError } from '../utils/AppError.js'
import { successResponse } from '../utils/response.js'

/**
 * POST /api/likes/:articleId — Toggle like
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user.id

  // Verify article exists
  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) throw new AppError('Maqola topilmadi', 404)

  const existing = await prisma.like.findUnique({
    where: { articleId_userId: { articleId, userId } },
  })

  let liked
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    liked = false
  } else {
    await prisma.like.create({ data: { articleId, userId } })
    liked = true
  }

  const count = await prisma.like.count({ where: { articleId } })

  return successResponse(res, { liked, count }, liked ? 'Like qo\'shildi' : 'Like olib tashlandi')
})

/**
 * GET /api/likes/:articleId
 */
export const getLikesForArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user.id

  const [count, userLike] = await Promise.all([
    prisma.like.count({ where: { articleId } }),
    prisma.like.findUnique({
      where: { articleId_userId: { articleId, userId } },
    }),
  ])

  return successResponse(res, { count, liked: !!userLike })
})
