/**
 * THEME STORE — Dark / Light mode
 * localStorage da saqlanadi, tizim sozlamasini ham hisobga oladi
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'system'

      // Joriy haqiqiy tema (system bo'lsa, OSnikiqa qarab)
      resolvedTheme: () => {
        const { theme } = get()
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        }
        return theme
      },

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const current = get().theme
        const next    = current === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },

      // Ilova yuklanganda chaqiriladi
      initTheme: () => {
        const { theme } = get()
        applyTheme(theme)
      },
    }),
    {
      name: 'news-uz-theme',
    }
  )
)

// HTML <html> elementiga dark klassini qo'shish/olib tashlash
function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}
