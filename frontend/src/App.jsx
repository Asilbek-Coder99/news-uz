/**
 * APP.JSX — Asosiy ilova komponenti (7-qadam: to'liq ulangan versiya)
 */
import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { useThemeStore }   from '@/store/themeStore.js'
import { ErrorBoundary }   from '@/components/common/ErrorBoundary.jsx'
import ApiStatusBanner     from '@/components/common/ApiStatusBanner.jsx'
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from '@/components/common/ProtectedRoute.jsx'

// ─── LAZY SAHIFALAR ──────────────────────────────────────────
const HomePage          = lazy(() => import('@/pages/home/HomePage.jsx'))
const ArticlePage       = lazy(() => import('@/pages/article/ArticlePage.jsx'))
const CategoryPage      = lazy(() => import('@/pages/category/CategoryPage.jsx'))
const SearchPage        = lazy(() => import('@/pages/search/SearchPage.jsx'))
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage.jsx'))
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage.jsx'))
const ProfilePage       = lazy(() => import('@/pages/profile/ProfilePage.jsx'))
const MainLayout        = lazy(() => import('@/components/layout/MainLayout.jsx'))

// Admin sahifalar
const AdminLayout       = lazy(() => import('@/pages/admin/AdminLayout.jsx'))
const DashboardPage     = lazy(() => import('@/pages/admin/dashboard/DashboardPage.jsx'))
const ArticlesAdminPage = lazy(() => import('@/pages/admin/articles/ArticlesAdminPage.jsx'))
const ArticleFormPage   = lazy(() => import('@/pages/admin/articles/ArticleFormPage.jsx'))
const CategoriesPage    = lazy(() => import('@/pages/admin/categories/CategoriesPage.jsx'))
const UsersPage         = lazy(() => import('@/pages/admin/users/UsersPage.jsx'))
const CommentsPage      = lazy(() => import('@/pages/admin/comments/CommentsPage.jsx'))

// ─── REACT QUERY ─────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5  * 60 * 1000,
      gcTime:               10 * 60 * 1000,
      retry:                1,
      refetchOnWindowFocus: false,
      // Xato bo'lganda toast ko'rsatmaslik (har query o'zi boshqaradi)
    },
    mutations: {
      retry: 0,
    },
  },
})

// ─── YUKLASH KOMPONENTI ──────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center
                      justify-center shadow-lg animate-pulse">
        <span className="text-white font-black text-xl"
              style={{ fontFamily: 'Playfair Display, serif' }}>N</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i}
               className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
               style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
)

// ─── 404 ─────────────────────────────────────────────────────
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center
                  bg-[var(--bg)] px-4">
    <p className="text-8xl font-black text-[var(--border)] mb-4"
       style={{ fontFamily: 'Playfair Display, serif' }}>404</p>
    <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
      Sahifa topilmadi
    </h1>
    <p className="text-[var(--text-muted)] mb-6 text-center">
      Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
    </p>
    <a href="/"
       className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl
                  hover:bg-blue-700 transition-colors">
      Bosh sahifaga qaytish
    </a>
  </div>
)

// ─── ASOSIY ILOVA ────────────────────────────────────────────
export default function App() {
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>

            {/* API ulanish banneri */}
            <ApiStatusBanner />

            <Suspense fallback={<PageLoader />}>
              <Routes>

                {/* ── Asosiy sahifalar ── */}
                <Route element={<MainLayout />}>
                  <Route path="/"               element={<HomePage />} />
                  <Route path="/news/:slug"     element={<ArticlePage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/search"         element={<SearchPage />} />
                  <Route path="/profile"        element={
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                  } />
                </Route>

                {/* ── Auth sahifalari ── */}
                <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                {/* ── Admin panel ── */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index                element={<DashboardPage />} />
                  <Route path="articles"      element={<ArticlesAdminPage />} />
                  <Route path="articles/new"  element={<ArticleFormPage />} />
                  <Route path="articles/:id"  element={<ArticleFormPage />} />
                  <Route path="categories"    element={<CategoriesPage />} />
                  <Route path="users"         element={<UsersPage />} />
                  <Route path="comments"      element={<CommentsPage />} />
                </Route>

                {/* ── 404 ── */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>

          {/* Toast xabarlari */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background:   'var(--bg-card)',
                color:        'var(--text)',
                border:       '1px solid var(--border)',
                borderRadius: '12px',
                fontSize:     '14px',
                fontWeight:   '500',
                boxShadow:    'var(--shadow-lg)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
