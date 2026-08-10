/**
 * PROTECTED ROUTE
 *
 * Faqat tizimga kirgan foydalanuvchilar ko'ra oladigan sahifalar uchun.
 * Admin sahifalari uchun role tekshiruvi ham mavjud.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore.js'

// Oddiy himoyalangan sahifa (login talab qilinadi)
export const ProtectedRoute = ({ children }) => {
  const { accessToken, user } = useAuthStore()
  const location = useLocation()

  if (!accessToken || !user) {
    // Login sahifasiga yo'naltirish, orqaga qaytish uchun manzilni saqlash
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Admin sahifasi (admin role talab qilinadi)
export const AdminRoute = ({ children }) => {
  const { accessToken, user } = useAuthStore()
  const location = useLocation()

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Editor sahifasi
export const EditorRoute = ({ children }) => {
  const { accessToken, user } = useAuthStore()
  const location = useLocation()

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Kirgan foydalanuvchilar ko'rmasligi kerak (login, register)
export const GuestRoute = ({ children }) => {
  const { accessToken, user } = useAuthStore()

  if (accessToken && user) {
    return <Navigate to="/" replace />
  }

  return children
}
