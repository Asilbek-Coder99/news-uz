import { prisma } from '../config/database.js'
import { asyncHandler, AppError } from '../utils/AppError.js'
import { successResponse, createdResponse, noContentResponse } from '../utils/response.js'
import { slugify } from '../utils/helpers.js'

/**
 * GET /api/categories
 * Returns all parent categories with their children
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where:   { parentId: null, isActive: true },
    orderBy: { order: 'asc' },
    include: {
      children: {
        where:   { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { articles: { where: { status: 'PUBLISHED' } } } },
        },
      },
      _count: { select: { articles: { where: { status: 'PUBLISHED' } } } },
    },
  })

  return successResponse(res, categories)
})

/**
 * GET /api/categories/:slug
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where:   { slug: req.params.slug },
    include: {
      children: { where: { isActive: true }, orderBy: { order: 'asc' } },
      parent:   true,
      _count:   { select: { articles: { where: { status: 'PUBLISHED' } } } },
    },
  })

  if (!category) throw new AppError('Kategoriya topilmadi', 404)

  return successResponse(res, category)
})

/**
 * POST /api/categories (admin)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, nameUz, description, color, icon, parentId, order } = req.body

  const slug = slugify(name)

  // Check slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) throw new AppError('Bu kategoriya slug allaqachon mavjud', 409)

  const category = await prisma.category.create({
    data: { name, nameUz: nameUz || name, description, color, icon, parentId, order, slug },
  })

  return createdResponse(res, category, 'Kategoriya yaratildi')
})

/**
 * PUT /api/categories/:id (admin)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw new AppError('Kategoriya topilmadi', 404)

  const data = { ...req.body }
  if (data.name && data.name !== existing.name) {
    data.slug = slugify(data.name)
    const slugTaken = await prisma.category.findFirst({
      where: { slug: data.slug, id: { not: id } },
    })
    if (slugTaken) throw new AppError('Bu slug allaqachon ishlatilmoqda', 409)
  }

  const updated = await prisma.category.update({ where: { id }, data })
  return successResponse(res, updated, 'Kategoriya yangilandi')
})

/**
 * DELETE /api/categories/:id (admin)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const category = await prisma.category.findUnique({
    where:   { id },
    include: { _count: { select: { articles: true, children: true } } },
  })

  if (!category) throw new AppError('Kategoriya topilmadi', 404)
  if (category._count.articles > 0)
    throw new AppError('Bu kategoriyada maqolalar mavjud, avval ularni o\'chiring', 400)
  if (category._count.children > 0)
    throw new AppError('Bu kategoriyaning ichki kategoriyalari bor', 400)

  await prisma.category.delete({ where: { id } })
  return noContentResponse(res)
})
