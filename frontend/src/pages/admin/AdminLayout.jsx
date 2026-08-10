/**
 * ADMIN LAYOUT — Admin panel asosiy qolip
 * Sidebar + kontent maydoni
 */
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence }      from 'framer-motion'
import {
  LayoutDashboard, Newspaper, FolderOpen,
  Users, MessageSquare, Menu, X,
  Newspaper as Logo, LogOut, Settings,
  ChevronRight, Bell
} from 'lucide-react'
import { useAuthStore }  from '@/store/authStore.js'
import { useThemeStore } from '@/store/themeStore.js'
import { Sun, Moon }     from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/admin/articles',    label: 'Maqolalar',   icon: Newspaper  },
  { href: '/admin/categories',  label: 'Kategoriyalar', icon: FolderOpen },
  { href: '/admin/users',       label: 'Foydalanuvchilar', icon: Users  },
  { href: '/admin/comments',    label: 'Izohlar',     icon: MessageSquare  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout }  = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                        justify-center shadow-md shrink-0">
          <Logo className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="font-bold text-[var(--text)] text-sm"
             style={{ fontFamily: 'Playfair Display, serif' }}>
            NEWS<span className="text-blue-500">.UZ</span>
          </p>
          <p className="text-[10px] text-[var(--text-subtle)]">Admin Panel</p>
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <NavLink
            key={href}
            to={href}
            end={exact}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200 group
               ${isActive
                 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                 : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-muted)]'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{label}</span>
                {!isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0
                                          group-hover:opacity-100 transition-opacity" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Foydalanuvchi */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-[var(--text-muted)] hover:text-[var(--text)]
                     hover:bg-[var(--bg-muted)] transition-all"
        >
          <Settings className="w-4.5 h-4.5" />
          Saytga o'tish
        </NavLink>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                        bg-[var(--bg-muted)]">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center
                          justify-center text-white text-xs font-bold shrink-0">
            {user?.fullName?.[0] || user?.username?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text)] truncate">
              {user?.fullName || user?.username}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[var(--text-subtle)] hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-[var(--bg-muted)]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--bg-card)]
                        border-r border-[var(--border)] fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobil sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden
                         bg-[var(--bg-card)] border-r border-[var(--border)]"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Asosiy kontent */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-[var(--bg-card)]
                           border-b border-[var(--border)] flex items-center
                           justify-between px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg
                       text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:block hidden">
            <p className="text-sm text-[var(--text-muted)]">
              Xush kelibsiz, <span className="font-semibold text-[var(--text)]">
                {user?.fullName || user?.username}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg
                               text-[var(--text-muted)] hover:bg-[var(--bg-muted)]
                               relative transition-all">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500
                               rounded-full border border-[var(--bg-card)]" />
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                         text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-all"
            >
              {theme === 'dark'
                ? <Sun className="w-4.5 h-4.5" />
                : <Moon className="w-4.5 h-4.5" />
              }
            </button>
          </div>
        </header>

        {/* Sahifa kontenti */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
