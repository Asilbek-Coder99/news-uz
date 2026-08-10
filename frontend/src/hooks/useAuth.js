/**
 * useAuth HOOK
 *
 * Auth amaliyotlari uchun qulay hook.
 * React Query mutation + Zustand store ni birlashtiradi.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/services/authApi.js'
import { useAuthStore } from '@/store/authStore.js'

export const useAuth = () => {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const {
    user, accessToken, isLoading,
    setAuth, logout: storeLogout,
    isAuthenticated, isAdmin, isEditor,
  } = useAuthStore()

  // ─── REGISTER ──────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data
      setAuth(user, accessToken, refreshToken)
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!")
      navigate('/')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ro\'yxatdan o\'tishda xato')
    },
  })

  // ─── LOGIN ─────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data
      setAuth(user, accessToken, refreshToken)
      toast.success('Xush kelibsiz!')
      navigate('/')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Kirishda xato')
    },
  })

  // ─── LOGOUT ────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: () => {
      const { refreshToken } = useAuthStore.getState()
      return authApi.logout(refreshToken)
    },
    onSettled: () => {
      storeLogout()
      queryClient.clear()
      toast.success('Tizimdan chiqildi')
      navigate('/login')
    },
  })

  // ─── GET ME (foydalanuvchi ma'lumotlarini yangilash) ───────
  const { data: meData } = useQuery({
    queryKey:  ['me'],
    queryFn:   () => authApi.getMe(),
    enabled:   !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 daqiqa
    retry:     false,
  })

  return {
    // State
    user,
    isAuthenticated: isAuthenticated(),
    isAdmin:         isAdmin(),
    isEditor:        isEditor(),
    isLoading,

    // Actions
    register:   registerMutation.mutate,
    login:      loginMutation.mutate,
    logout:     logoutMutation.mutate,

    // Loading states
    isRegistering: registerMutation.isPending,
    isLoggingIn:   loginMutation.isPending,
    isLoggingOut:  logoutMutation.isPending,

    // Errors
    registerError: registerMutation.error,
    loginError:    loginMutation.error,
  }
}
