/**
 * NEWS SERVICE — Maqolalar biznes logikasi
 *
 * Barcha DB so'rovlar, filtrlar, qidiruv va pagination shu yerda.
 */
import { prisma }    from '../config/database.js'
import { AppError }  from '../utils/AppError.js'
import { generateUniqueSlug, calculateReadTime, sanitizeHtml } from '../utils/helpers.js'

// ─── SELECT FIELDS (har doim bir xil qaytariladigan maydonlar) ─
const ARTICLE_SELECT = {
  id:           true,
  title:        true,
  slug:         true,
  excerpt:      true,
  coverImage:   true,
  coverImageAlt:true,
  status:       true,
  isFeatured:   true,
  isBreaking:   true,
  isTrending:   true,
  viewCount:    true,
  readTimeMin:  true,
  publishedAt:  true,
  createdAt:    true,
  authorName:   true,
  category: {
    select: { id: true, name: true, slug: true, color: true, icon: true }
  },
  tags: {
    select: { tag: { select: { id: true, name: true, slug: true } } }
  },
  _count: {
    select: { likes: true, comments: { where: { status: 'APPROVED' } } }
  },
}

const ARTICLE_FULL = {
  ...ARTICLE_SELECT,
  content:      true,
  updatedAt:    true,
}

// ─── WHERE FILTER YARATUVCHI ──────────────────────────────────
const buildWhereClause = (query) => {
  const {
    category, tag, status = 'PUBLISHED',
    featured, breaking, trending, search, authorId
  } = query

  const where = {}

  // Holat filtri
  if (status) where.status = status

  // Kategoriya (slug bo'yicha)
  if (category) {
    where.category = { slug: category }
  }

  // Tag (slug bo'yicha)
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } }
  }

  // Boolean filtrlar
  if (featured  === true || featured  === 'true') where.isFeatured = true
  if (breaking  === true || breaking  === 'true') where.isBreaking = true
  if (trending  === true || trending  === 'true') where.isTrending = true

  // Muallif
  if (authorId) where.authorId = authorId

  // Matn qidiruvi (title va excerpt bo'yicha)
  if (search && search.trim()) {
    where.OR = [
      { title:   { contains: search.trim(), mode: 'insensitive' } },
      { excerpt: { contains: search.trim(), mode: 'insensitive' } },
      { content: { contains: search.trim(), mode: 'insensitive' } },
    ]
  }

  return where
}

// ─── SORT YARATUVCHI ─────────────────────────────────────────
const buildOrderBy = (sort = '-publishedAt') => {
  const desc  = sort.startsWith('-')
  const field = desc ? sort.slice(1) : sort
  const allowed = ['publishedAt', 'viewCount', 'createdAt', 'title']
  const safeField = allowed.includes(field) ? field : 'publishedAt'
  return [{ [safeField]: desc ? 'desc' : 'asc' }]
}

// ─── ASOSIY FUNKSIYALAR ──────────────────────────────────────

/**
 * Maqolalar ro'yxati (paginated + filtered)
 */
export const getArticles = async (query) => {
  const { page = 1, limit = 10, sort } = query
  const skip  = (page - 1) * limit
  const where = buildWhereClause(query)
  const orderBy = buildOrderBy(sort)

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take:    Number(limit),
      orderBy,
      select:  ARTICLE_SELECT,
    }),
    prisma.article.count({ where }),
  ])

  // Tag'larni yassi formatga o'tkazish
  const formatted = articles.map(formatArticle)

  return { articles: formatted, total }
}

/**
 * Slug bo'yicha bitta maqola + ko'rishlar sonini oshirish
 */
export const getArticleBySlug = async (slug, userId = null) => {
  const article = await prisma.article.findUnique({
    where:  { slug },
    select: {
      ...ARTICLE_FULL,
      // Foydalanuvchi like/bookmark qilganmi?
      likes:     userId ? { where: { userId }, select: { id: true } } : false,
      bookmarks: userId ? { where: { userId }, select: { id: true } } : false,
    },
  })

  if (!article) throw new AppError('Maqola topilmadi', 404)
  if (article.status !== 'PUBLISHED') throw new AppError('Maqola mavjud emas', 404)

  // Ko'rishlar sonini oshirish (async — javobni kutmasdan)
  prisma.article.update({
    where: { id: article.id },
    data:  { viewCount: { increment: 1 } },
  }).catch(() => {})

  return {
    ...formatArticle(article),
    isLiked:      userId ? article.likes?.length > 0      : false,
    isBookmarked: userId ? article.bookmarks?.length > 0  : false,
  }
}

/**
 * Featured (tanlangan) maqolalar
 */
export const getFeaturedArticles = async (limit = 5) => {
  const articles = await prisma.article.findMany({
    where:   { status: 'PUBLISHED', isFeatured: true },
    take:    limit,
    orderBy: { publishedAt: 'desc' },
    select:  ARTICLE_SELECT,
  })
  return articles.map(formatArticle)
}

/**
 * Trending maqolalar
 */
export const getTrendingArticles = async (limit = 10) => {
  const articles = await prisma.article.findMany({
    where:   { status: 'PUBLISHED' },
    take:    limit,
    orderBy: [{ isTrending: 'desc' }, { viewCount: 'desc' }],
    select:  ARTICLE_SELECT,
  })
  return articles.map(formatArticle)
}

/**
 * Breaking news
 */
export const getBreakingArticles = async (limit = 5) => {
  const articles = await prisma.article.findMany({
    where:   { status: 'PUBLISHED', isBreaking: true },
    take:    limit,
    orderBy: { publishedAt: 'desc' },
    select:  ARTICLE_SELECT,
  })
  return articles.map(formatArticle)
}

/**
 * O'xshash maqolalar (bir xil kategoriya, o'zi bundan tashqari)
 */
export const getRelatedArticles = async (slug, limit = 4) => {
  const current = await prisma.article.findUnique({
    where:  { slug },
    select: { id: true, categoryId: true },
  })
  if (!current) return []

  const articles = await prisma.article.findMany({
    where: {
      status:     'PUBLISHED',
      categoryId: current.categoryId,
      id:         { not: current.id },
    },
    take:    limit,
    orderBy: { publishedAt: 'desc' },
    select:  ARTICLE_SELECT,
  })
  return articles.map(formatArticle)
}

/**
 * Yangi maqola yaratish
 */
export const createArticle = async (data, authorId, authorName) => {
  const {
    title, excerpt, content, categoryId,
    tagIds = [], status, isFeatured,
    isBreaking, isTrending, coverImage, coverImageAlt
  } = data

  // Kategoriya mavjudligini tekshirish
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) throw new AppError('Kategoriya topilmadi', 404)

  // Unique slug yaratish
  const slug = await generateUniqueSlug(
    title,
    (s) => prisma.article.findUnique({ where: { slug: s } }).then(Boolean)
  )

  // O'qish vaqtini hisoblash
  const readTimeMin = calculateReadTime(content)

  // Maqolani yaratish (tag'lar bilan birgalikda)
  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content:    sanitizeHtml(content),
      coverImage,
      coverImageAlt,
      categoryId,
      authorId,
      authorName,
      status,
      isFeatured:  isFeatured  || false,
      isBreaking:  isBreaking  || false,
      isTrending:  isTrending  || false,
      readTimeMin,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      tags: {
        create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
      },
    },
    select: ARTICLE_SELECT,
  })

  return formatArticle(article)
}

/**
 * Maqolani tahrirlash
 */
export const updateArticle = async (id, data) => {
  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) throw new AppError('Maqola topilmadi', 404)

  const { tagIds, content, ...rest } = data

  // Status PUBLISHED ga o'zgarsa publishedAt ni o'rnatish
  if (rest.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
    rest.publishedAt = new Date()
  }

  if (content) {
    rest.content    = sanitizeHtml(content)
    rest.readTimeMin = calculateReadTime(content)
  }

  // Tag'larni yangilash
  const tagUpdate = tagIds !== undefined
    ? {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
      }
    : undefined

  const updated = await prisma.article.update({
    where: { id },
    data:  { ...rest, ...(tagUpdate ? { tags: tagUpdate } : {}) },
    select: ARTICLE_SELECT,
  })

  return formatArticle(updated)
}

/**
 * Maqolani o'chirish
 */
export const deleteArticle = async (id) => {
  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) throw new AppError('Maqola topilmadi', 404)

  await prisma.article.delete({ where: { id } })
}

// ─── YORDAMCHI: Tag'larni yassi formatga o'tkazish ───────────
const formatArticle = (article) => {
  if (!article) return null
  return {
    ...article,
    tags: article.tags?.map((at) => at.tag) || [],
  }
}
