/**
 * NEWS CONTROLLER — Maqolalar HTTP handler
 */
import * as newsService from '../services/news.service.js'
import { asyncHandler } from '../utils/AppError.js'
import {
  successResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
} from '../utils/response.js'

// GET /api/news
export const getArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query
  const { articles, total } = await newsService.getArticles({ page, limit, ...filters })
  return paginatedResponse(res, articles, total, Number(page), Number(limit))
})

// GET /api/news/featured
export const getFeaturedArticles = asyncHandler(async (req, res) => {
  const articles = await newsService.getFeaturedArticles(Number(req.query.limit) || 5)
  return successResponse(res, articles)
})

// GET /api/news/trending
export const getTrendingArticles = asyncHandler(async (req, res) => {
  const articles = await newsService.getTrendingArticles(Number(req.query.limit) || 10)
  return successResponse(res, articles)
})

// GET /api/news/breaking
export const getBreakingArticles = asyncHandler(async (req, res) => {
  const articles = await newsService.getBreakingArticles(Number(req.query.limit) || 5)
  return successResponse(res, articles)
})

// GET /api/news/:slug
export const getArticleBySlug = asyncHandler(async (req, res) => {
  const userId  = req.user?.id || null
  const article = await newsService.getArticleBySlug(req.params.slug, userId)
  return successResponse(res, article)
})

// GET /api/news/:slug/related
export const getRelatedArticles = asyncHandler(async (req, res) => {
  const articles = await newsService.getRelatedArticles(req.params.slug, 4)
  return successResponse(res, articles)
})

// POST /api/news
export const createArticle = asyncHandler(async (req, res) => {
  const authorId   = req.user.id
  const authorName = req.user.fullName || req.user.username
  const article    = await newsService.createArticle(req.body, authorId, authorName)
  return createdResponse(res, article, "Maqola muvaffaqiyatli yaratildi")
})

// PUT /api/news/:id
export const updateArticle = asyncHandler(async (req, res) => {
  const article = await newsService.updateArticle(req.params.id, req.body)
  return successResponse(res, article, "Maqola yangilandi")
})

// DELETE /api/news/:id
export const deleteArticle = asyncHandler(async (req, res) => {
  await newsService.deleteArticle(req.params.id)
  return noContentResponse(res)
})
