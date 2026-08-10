/**
 * QIDIRUV SAHIFASI
 * - Real-time qidiruv (debounce bilan)
 * - Kategoriya filtri
 * - Natijalar grid
 */
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { newsApi, categoryApi } from '@/services/newsApi.js'
import { NewsGrid }             from '@/components/news/NewsGrid.jsx'

// Debounce hook — foydalanuvchi yozishni to'xtatgandan keyin qidiruv
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [query,    setQuery]    = useState(searchParams.get('q')        || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort,     setSort]     = useState(searchParams.get('sort')     || '-publishedAt')
  const [page,     setPage]     = useState(1)

  const debouncedQuery = useDebounce(query, 400)

  // URL ni yangilash
  useEffect(() => {
    const params = {}
    if (debouncedQuery) params.q        = debouncedQuery
    if (category)       params.category = category
    if (sort !== '-publishedAt') params.sort = sort
    setSearchParams(params)
    setPage(1)
  }, [debouncedQuery, category, sort])

  // Kategoriyalar
  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryApi.getAll(),
    select:   (d) => d.data,
  })

  // Qidiruv natijalari
  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', debouncedQuery, category, sort, page],
    queryFn:  () => newsApi.getArticles({
      search:   debouncedQuery,
      category: category || undefined,
      sort,
      page,
      limit: 12,
      status: 'PUBLISHED',
    }),
    enabled: true, // Bo'sh bo'lsa ham so'nggi maqolalarni ko'rsatish
    keepPreviousData: true,
  })

  const articles = data?.data || []
  const meta     = data?.meta || {}
  const categories = catsData || []

  const handleClear = () => {
    setQuery('')
    setCategory('')
    setSort('-publishedAt')
  }

  return (
    <>
      <Helmet>
        <title>
          {debouncedQuery ? `"${debouncedQuery}" — Qidiruv` : 'Qidiruv'} | NEWS.UZ
        </title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── QIDIRUV HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-3xl font-bold text-[var(--text)] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            🔍 Qidiruv
          </h1>

          {/* Katta qidiruv inputi */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                              text-[var(--text-subtle)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Yangilik, mavzu yoki kalit so'z kiriting..."
              autoFocus
              className="w-full pl-12 pr-12 py-4 text-base rounded-2xl
                         bg-[var(--bg-card)] border border-[var(--border)]
                         text-[var(--text)] placeholder:text-[var(--text-subtle)]
                         focus:outline-none focus:border-blue-500
                         focus:ring-2 focus:ring-blue-500/10
                         shadow-[var(--shadow)] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-[var(--text-subtle)] hover:text-[var(--text)]
                           transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ── FILTRLAR ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">Filtr:</span>
          </div>

          {/* Kategoriya filtri */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium
                         transition-all border
                         ${!category
                           ? 'bg-blue-600 text-white border-blue-600'
                           : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-subtle)]'
                         }`}
            >
              Barchasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.slug ? '' : cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium
                           transition-all border flex items-center gap-1
                           ${category === cat.slug
                             ? 'text-white border-transparent'
                             : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-subtle)]'
                           }`}
                style={category === cat.slug
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : {}
                }
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Saralash */}
          <div className="ml-auto flex items-center gap-1 bg-[var(--bg-muted)]
                          border border-[var(--border)] rounded-xl p-1">
            {[
              { label: "So'nggi",   value: '-publishedAt' },
              { label: 'Mashhur',   value: '-viewCount'   },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                           ${sort === opt.value
                             ? 'bg-[var(--bg-card)] text-[var(--text)] shadow-sm'
                             : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                           }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── NATIJA MA'LUMOTI ── */}
        <AnimatePresence mode="wait">
          {debouncedQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">
                  {isLoading ? (
                    'Qidirilmoqda...'
                  ) : (
                    <>
                      <span className="font-semibold text-[var(--text)]">
                        "{debouncedQuery}"
                      </span>{' '}
                      uchun{' '}
                      <span className="font-semibold text-blue-600">
                        {meta.total || 0}
                      </span>{' '}
                      ta natija
                    </>
                  )}
                </p>

                {(query || category) && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]
                               hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Tozalash
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAQOLALAR ── */}
        <NewsGrid
          articles={articles}
          isLoading={isLoading}
          isError={isError}
          cols="3"
          skeletonCount={12}
          emptyText={
            debouncedQuery
              ? `"${debouncedQuery}" bo'yicha maqola topilmadi`
              : 'Maqolalar topilmadi'
          }
        />

        {/* ── PAGINATION ── */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => { setPage(page - 1); window.scrollTo(0, 0) }}
              className="px-4 py-2 rounded-xl border border-[var(--border)]
                         text-sm font-medium text-[var(--text-muted)]
                         hover:bg-[var(--bg-muted)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all"
            >
              ← Oldingi
            </button>

            <span className="text-sm text-[var(--text-muted)] px-2">
              {page} / {meta.totalPages}
            </span>

            <button
              disabled={page >= meta.totalPages}
              onClick={() => { setPage(page + 1); window.scrollTo(0, 0) }}
              className="px-4 py-2 rounded-xl border border-[var(--border)]
                         text-sm font-medium text-[var(--text-muted)]
                         hover:bg-[var(--bg-muted)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all"
            >
              Keyingi →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
