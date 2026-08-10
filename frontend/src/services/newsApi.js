/**
 * NEWS API — Maqolalar bilan ishlash uchun API funksiyalar
 */
import api from './api.js'

export const newsApi = {
  // Maqolalar ro'yxati (filter, search, pagination)
  getArticles: (params) =>
    api.get('/news', { params }).then((r) => r.data),

  // Tanlangan maqolalar
  getFeatured: (limit = 5) =>
    api.get('/news/featured', { params: { limit } }).then((r) => r.data),

  // Trending maqolalar
  getTrending: (limit = 10) =>
    api.get('/news/trending', { params: { limit } }).then((r) => r.data),

  // Breaking yangiliklar
  getBreaking: (limit = 5) =>
    api.get('/news/breaking', { params: { limit } }).then((r) => r.data),

  // Slug bo'yicha bitta maqola
  getBySlug: (slug) =>
    api.get(`/news/${slug}`).then((r) => r.data),

  // O'xshash maqolalar
  getRelated: (slug) =>
    api.get(`/news/${slug}/related`).then((r) => r.data),

  // Yangi maqola yaratish (admin/editor)
  create: (data) =>
    api.post('/news', data).then((r) => r.data),

  // Maqolani tahrirlash
  update: (id, data) =>
    api.put(`/news/${id}`, data).then((r) => r.data),

  // Maqolani o'chirish
  delete: (id) =>
    api.delete(`/news/${id}`).then((r) => r.data),

  // Like toggle
  toggleLike: (articleId) =>
    api.post(`/likes/${articleId}`).then((r) => r.data),

  // Bookmark toggle
  toggleBookmark: (articleId) =>
    api.post(`/bookmarks/${articleId}`).then((r) => r.data),
}

export const categoryApi = {
  getAll: () =>
    api.get('/categories').then((r) => r.data),

  getBySlug: (slug) =>
    api.get(`/categories/${slug}`).then((r) => r.data),

  create: (data) =>
    api.post('/categories', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/categories/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
}

export const commentApi = {
  getForArticle: (articleId, params) =>
    api.get(`/comments/${articleId}`, { params }).then((r) => r.data),

  create: (data) =>
    api.post('/comments', data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/comments/${id}`).then((r) => r.data),

  // Admin
  getAll: (params) =>
    api.get('/comments', { params }).then((r) => r.data),

  approve: (id) =>
    api.patch(`/comments/${id}/approve`).then((r) => r.data),
}
