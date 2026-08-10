/**
 * AUTH SERVICE — Frontend
 * Backend auth API bilan ishlash uchun funksiyalar
 */
import api from './api.js'

export const authApi = {
  // Ro'yxatdan o'tish
  register: (data) => api.post('/auth/register', data),

  // Tizimga kirish
  login: (data) => api.post('/auth/login', data),

  // Token yangilash
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  // Tizimdan chiqish
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  // O'z ma'lumotlarini olish
  getMe: () => api.get('/auth/me'),
}
