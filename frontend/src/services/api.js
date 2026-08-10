/**
 * AXIOS INSTANCE
 *
 * Barcha API chaqiruvlar uchun markaziy konfiguratsiya.
 * - Har bir so'rovga avtomatik Authorization header qo'shadi
 * - 401 xatoda token yangilaydi (refresh)
 * - Refresh ham ishlamasa, foydalanuvchini logout qiladi
 */

import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Asosiy axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────
// Har bir so'rovdan oldin access token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────
// 401 xatoda token yangilash
let isRefreshing = false
let failedQueue  = []  // Token yangilanayotganda kutayotgan so'rovlar

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 va retry qilinmagan so'rov
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Refresh jarayonida boshqa so'rovlar navbatda kutadi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefresh } = response.data.data
        setTokens(accessToken, newRefresh)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
