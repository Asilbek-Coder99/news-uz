import { z } from 'zod'

// ─── AUTH ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email majburiy' })
    .email('Noto\'g\'ri email format'),

  username: z
    .string({ required_error: 'Username majburiy' })
    .min(3, 'Username kamida 3 ta belgi')
    .max(30, 'Username ko\'pi bilan 30 ta belgi')
    .regex(/^[a-z0-9_]+$/, 'Username faqat kichik harf, raqam va _ bo\'lishi mumkin'),

  fullName: z
    .string()
    .min(2, 'Ism kamida 2 ta belgi')
    .max(100, 'Ism ko\'pi bilan 100 ta belgi')
    .optional(),

  password: z
    .string({ required_error: 'Parol majburiy' })
    .min(8, 'Parol kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Parolda kamida 1 ta katta harf bo\'lishi kerak')
    .regex(/[0-9]/, 'Parolda kamida 1 ta raqam bo\'lishi kerak'),
})

export const loginSchema = z.object({
  email:    z.string().email('Noto\'g\'ri email format'),
  password: z.string().min(1, 'Parol majburiy'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token majburiy'),
})

// ─── NEWS / ARTICLE ──────────────────────────────────────────

export const createArticleSchema = z.object({
  title: z
    .string({ required_error: 'Sarlavha majburiy' })
    .min(5, 'Sarlavha kamida 5 ta belgi')
    .max(300, 'Sarlavha ko\'pi bilan 300 ta belgi'),

  excerpt: z
    .string()
    .max(500, 'Qisqa matn ko\'pi bilan 500 ta belgi')
    .optional(),

  content: z
    .string({ required_error: 'Maqola matni majburiy' })
    .min(50, 'Maqola matni kamida 50 ta belgi'),

  categoryId: z
    .string({ required_error: 'Kategoriya majburiy' })
    .cuid('Noto\'g\'ri kategoriya ID'),

  tagIds: z
    .array(z.string().cuid())
    .max(10, 'Ko\'pi bilan 10 ta tag')
    .optional()
    .default([]),

  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .optional()
    .default('DRAFT'),

  isFeatured:  z.boolean().optional().default(false),
  isBreaking:  z.boolean().optional().default(false),
  isTrending:  z.boolean().optional().default(false),

  coverImage:    z.string().url('Noto\'g\'ri rasm URL').optional(),
  coverImageAlt: z.string().max(200).optional(),
})

export const updateArticleSchema = createArticleSchema.partial()

export const articleQuerySchema = z.object({
  page:       z.coerce.number().min(1).optional().default(1),
  limit:      z.coerce.number().min(1).max(50).optional().default(10),
  category:   z.string().optional(),
  tag:        z.string().optional(),
  status:     z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured:   z.coerce.boolean().optional(),
  breaking:   z.coerce.boolean().optional(),
  trending:   z.coerce.boolean().optional(),
  search:     z.string().optional(),
  sort:       z.string().optional().default('-publishedAt'),
  authorId:   z.string().optional(),
})

// ─── CATEGORY ────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name:        z.string().min(2, 'Nom kamida 2 ta belgi').max(100),
  nameUz:      z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Noto\'g\'ri rang formati').optional(),
  icon:        z.string().max(10).optional(),
  parentId:    z.string().cuid().optional().nullable(),
  order:       z.coerce.number().optional().default(0),
})

export const updateCategorySchema = createCategorySchema.partial()

// ─── COMMENT ─────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content:   z.string().min(2, 'Izoh kamida 2 ta belgi').max(1000, 'Izoh ko\'pi bilan 1000 ta belgi'),
  articleId: z.string().cuid('Noto\'g\'ri maqola ID'),
  parentId:  z.string().cuid().optional().nullable(),
})

// ─── USER UPDATE ─────────────────────────────────────────────

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  bio:      z.string().max(500).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parol majburiy'),
  newPassword:     z
    .string()
    .min(8, 'Yangi parol kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Parolda katta harf bo\'lishi kerak')
    .regex(/[0-9]/, 'Parolda raqam bo\'lishi kerak'),
})

// ─── PAGINATION ──────────────────────────────────────────────

export const paginationSchema = z.object({
  page:  z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  sort:  z.string().optional(),
})
