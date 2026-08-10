/**
 * API ULANISH TEKSHIRUVI
 * Frontend yuklanganda backend bilan ulanishni tekshiradi
 */
import api from './api.js'

export const checkApiConnection = async () => {
  try {
    const res = await api.get('/../../health', { timeout: 5000 })
    return { ok: true, data: res.data }
  } catch {
    return { ok: false }
  }
}

// Barcha API xizmatlarini bitta joydan export qilish
export { default as api }              from './api.js'
export { authApi }                     from './authApi.js'
export { newsApi, categoryApi, commentApi } from './newsApi.js'

// Admin API
export const adminApi = {
  // Statistika
  getStats: () =>
    api.get('/users/stats').then(r => r.data),

  // Barcha foydalanuvchilar
  getUsers: (params) =>
    api.get('/users', { params }).then(r => r.data),

  // Foydalanuvchi bloklash
  blockUser: (id) =>
    api.patch(`/users/${id}/block`).then(r => r.data),

  // Role berish
  setRole: (id, role) =>
    api.patch(`/users/${id}/role`, { role }).then(r => r.data),

  // Barcha izohlar (admin)
  getComments: (params) =>
    api.get('/comments', { params }).then(r => r.data),

  // Izoh tasdiqlash
  approveComment: (id) =>
    api.patch(`/comments/${id}/approve`).then(r => r.data),

  // Izoh o'chirish
  deleteComment: (id) =>
    api.delete(`/comments/${id}`).then(r => r.data),
}
