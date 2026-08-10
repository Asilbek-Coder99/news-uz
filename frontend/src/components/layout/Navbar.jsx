/**
 * NAVBAR — Glass effect, sticky, premium dizayn
 * - Logo
 * - Kategoriyalar menyusi
 * - Qidiruv
 * - Foydalanuvchi tugmasi
 * - Dark/Light mode
 * - Mobil menyu
 */
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Sun, Moon, User, LogOut, Settings,
  Menu, X, Newspaper, ChevronDown, Bookmark
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore.js'
import { useThemeStore } from '@/store/themeStore.js'
import api from '@/services/api.js'

// Kategoriyalarni yuklash
const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn:  () => api.get('/categories').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  })

export default function Navbar() {
  const [isScrolled,     setIsScrolled]     = useState(false)
  const [isMobileOpen,   setIsMobileOpen]   = useState(false)
  const [isSearchOpen,   setIsSearchOpen]   = useState(false)
  const [isUserOpen,     setIsUserOpen]     = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  const navigate    = useNavigate()
  const searchRef   = useRef(null)
  const userMenuRef = useRef(null)

  const { user, accessToken, logout } = useAuthStore()
  const { theme, toggleTheme }        = useThemeStore()
  const { data: categories = [] }     = useCategories()

  // Scroll hodisasi
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Qidiruv ochilganda focuslash
  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus()
  }, [isSearchOpen])

  // Tashqarida click — menyularni yopish
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setIsUserOpen(false)
    navigate('/')
  }

  // Asosiy navbar variantlari
  const mainCategories = categories.slice(0, 6)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled
            ? 'glass shadow-[var(--shadow)] border-b border-[var(--glass-border)]'
            : 'bg-[var(--bg)]/95 backdrop-blur-sm'
          }`}
        style={{ height: 'var(--nav-height)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-4">

          {/* ── LOGO ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold text-[var(--text)] hidden sm:block"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              NEWS<span className="text-blue-500">.UZ</span>
            </span>
          </Link>

          {/* ── KATEGORIYALAR (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-2">
            {mainCategories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveCategory(cat.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <NavLink
                  to={`/category/${cat.slug}`}
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                     transition-all duration-200
                     ${isActive
                       ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                       : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-muted)]'
                     }`
                  }
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  {cat.children?.length > 0 && (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </NavLink>

                {/* Subcategory dropdown */}
                <AnimatePresence>
                  {activeCategory === cat.id && cat.children?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-48 glass rounded-xl
                                 shadow-[var(--shadow-lg)] border border-[var(--border)]
                                 py-1.5 overflow-hidden"
                    >
                      {cat.children.map((sub) => (
                        <NavLink
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm
                                     text-[var(--text-muted)] hover:text-[var(--text)]
                                     hover:bg-[var(--bg-muted)] transition-colors"
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* ── O'NG TUGMALAR ── */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Qidiruv */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                         text-[var(--text-muted)] hover:text-[var(--text)]
                         hover:bg-[var(--bg-muted)] transition-all"
              aria-label="Qidiruv"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Tema almashtirish */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                         text-[var(--text-muted)] hover:text-[var(--text)]
                         hover:bg-[var(--bg-muted)] transition-all"
              aria-label="Temani almashtirish"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark'
                    ? <Sun className="w-4.5 h-4.5" />
                    : <Moon className="w-4.5 h-4.5" />
                  }
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Foydalanuvchi */}
            {accessToken && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                             hover:bg-[var(--bg-muted)] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center
                                  justify-center text-white text-xs font-bold shadow-sm">
                    {user.fullName?.[0] || user.username?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[var(--text)] max-w-[80px] truncate">
                    {user.fullName || user.username}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass rounded-xl
                                 shadow-[var(--shadow-lg)] border border-[var(--border)]
                                 py-1.5 overflow-hidden z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-[var(--border)]">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                                   text-[var(--text-muted)] hover:text-[var(--text)]
                                   hover:bg-[var(--bg-muted)] transition-colors"
                      >
                        <User className="w-4 h-4" /> Profil
                      </Link>

                      <Link
                        to="/profile?tab=bookmarks"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                                   text-[var(--text-muted)] hover:text-[var(--text)]
                                   hover:bg-[var(--bg-muted)] transition-colors"
                      >
                        <Bookmark className="w-4 h-4" /> Saqlangan
                      </Link>

                      {['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(user.role) && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm
                                     text-[var(--text-muted)] hover:text-[var(--text)]
                                     hover:bg-[var(--bg-muted)] transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Admin panel
                        </Link>
                      )}

                      <div className="border-t border-[var(--border)] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                     text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20
                                     transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Chiqish
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                           transition-all shadow-sm active:scale-95"
              >
                Kirish
              </Link>
            )}

            {/* Mobil menyu tugmasi */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg
                         text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-all"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── QIDIRUV MODALI ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50
                         w-full max-w-2xl px-4"
            >
              <form onSubmit={handleSearch}
                    className="glass rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden
                               border border-[var(--border)]">
                <div className="flex items-center px-4 py-3">
                  <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Yangilik qidiring..."
                    className="flex-1 mx-3 bg-transparent text-[var(--text)]
                               placeholder:text-[var(--text-subtle)] outline-none text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBIL MENYU ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-40 w-72 bg-[var(--bg-card)]
                       shadow-[var(--shadow-lg)] border-l border-[var(--border)]
                       flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4
                            border-b border-[var(--border)]"
                 style={{ paddingTop: 'calc(var(--nav-height) + 8px)' }}>
              <span className="font-bold text-[var(--text)]">Menyu</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           hover:bg-[var(--bg-muted)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kategoriyalar ro'yxati */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <NavLink
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       transition-colors
                       ${isActive
                         ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                         : 'text-[var(--text)] hover:bg-[var(--bg-muted)]'
                       }`
                    }
                  >
                    <span className="text-lg">{cat.icon}</span>
                    {cat.name}
                  </NavLink>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
              {!accessToken ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex justify-center py-2.5 px-4 rounded-xl bg-blue-600
                               text-white font-semibold text-sm"
                  >
                    Kirish
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex justify-center py-2.5 px-4 rounded-xl
                               border border-[var(--border)] text-[var(--text)]
                               font-semibold text-sm"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => { handleLogout(); setIsMobileOpen(false) }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4
                             rounded-xl border border-red-200 text-red-500 font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" /> Chiqish
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobil overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
