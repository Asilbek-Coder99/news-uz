/**
 * AUTH STORE — Zustand
 *
 * Foydalanuvchi holati butun ilovada shu yerdan boshqariladi.
 * localStorage da token saqlanadi (persist middleware orqali).
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── STATE ─────────────────────────────────────────────
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,

      // ─── COMPUTED ──────────────────────────────────────────
      isAuthenticated: () => !!get().accessToken && !!get().user,
      isAdmin:  () => ['ADMIN', 'SUPER_ADMIN'].includes(get().user?.role),
      isEditor: () => ['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(get().user?.role),

      // ─── ACTIONS ───────────────────────────────────────────

      // Muvaffaqiyatli login/register dan keyin chaqiriladi
      setAuth: (user, accessToken, refreshToken) => set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      }),

      // Faqat tokenlarni yangilash (refresh dan keyin)
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      // Foydalanuvchi ma'lumotlarini yangilash
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),

      // Tizimdan chiqish — hamma narsani tozalash
      logout: () => set({
        user:         null,
        accessToken:  null,
        refreshToken: null,
        isLoading:    false,
      }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name:    'news-uz-auth',          // localStorage kalit nomi
      storage: createJSONStorage(() => localStorage),
      // Faqat kerakli ma'lumotlarni saqlash (accessToken xavfsizroq uchun yo'q)
      partialize: (state) => ({
        user:         state.user,
        refreshToken: state.refreshToken,
        // accessToken saqlanmaydi — har refresh da yangilanadi
      }),
    }
  )
)
