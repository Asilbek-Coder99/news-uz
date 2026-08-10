/**
 * KATEGORIYA SAHIFASI
 * - Kategoriya ma'lumotlari
 * - Subkategoriyalar filtri
 * - Maqolalar grid (pagination)
 */
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Filter, Grid, List } from 'lucide-react'
import { categoryApi } from '@/services/newsApi.js'
import { useArticles }  from '@/hooks/useNews.js'
import { NewsGrid }     from '@/components/news/NewsGrid.jsx'
import { NewsCard }     from '@/components/news/NewsCard.jsx'
import { SectionHeader } from '@/components/common/SectionHeader.jsx'

// Saralash variantlari
const SORT_OPTIONS = [
  { label: "So'nggi",      value: '-publishedAt' },
  { label: 'Ko\'p o\'qilgan', value: '-viewCount'  },
  { label: 'Eski',         value: 'publishedAt'  },
]

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const page     = parseInt(searchParams.get('page'))  || 1
  const subSlug  = searchParams.get('sub')  || ''
  const sort     = searchParams.get('sort') || '-publishedAt'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  // Kategoriyani yuklash
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn:  () => categoryApi.getBySlug(slug),
    select:   (d) => d.data,
  })

  // Maqolalarni yuklash
  const { data, isLoading, isError } = useArticles({
    category: subSlug || slug,
    page,
    limit: 12,
    sort,
    status: 'PUBLISHED',
  })

  const category = catData
  const articles = data?.data  || []
  const meta     = data?.meta  || {}

  // Slug o'zgarganda tepaga scroll
  useEffect(() => { window.scrollTo(0, 0) }, [slug, subSlug, page])

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val)
    else next.delete(key)
    next.delete('page') // filtr o'zgarganda 1-sahifaga qaytish
    setSearchParams(next)
  }

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', p)
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Helmet>
        <title>{category?.name || 'Kategoriya'} — NEWS.UZ</title>
      </Helmet>

      {/* ── KATEGORIYA HEADER ── */}
      <div
        className="border-b border-[var(--border)]"
        style={{ background: category?.color ? `${category.color}08` : undefined }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
            <Link to="/" className="hover:text-[var(--text)] transition-colors">Bosh sahifa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium" style={{ color: category?.color }}>
              {category?.name || slug}
            </span>
          </nav>

          {/* Sarlavha */}
          {catLoading ? (
            <div className="space-y-2">
              <div className="skeleton h-8 w-48" />
              <div className="skeleton h-4 w-72" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              {category?.icon && (
                <span className="text-4xl">{category.icon}</span>
              )}
              <div>
                <h1
                  className="text-3xl font-bold text-[var(--text)]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {category?.name}
                </h1>
                {category?._count?.articles > 0 && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {category._count.articles} ta maqola
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Subkategoriyalar */}
          {category?.children?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              <button
                onClick={() => setParam('sub', '')}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium
                           transition-all border
                           ${!subSlug
                             ? 'text-white border-transparent'
                             : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-subtle)]'
                           }`}
                style={!subSlug
                  ? { backgroundColor: category.color, borderColor: category.color }
                  : {}
                }
              >
                Barchasi
              </button>
              {category.children.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setParam('sub', sub.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium
                             transition-all border
                             ${subSlug === sub.slug
                               ? 'text-white border-transparent'
                               : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-subtle)]'
                             }`}
                  style={subSlug === sub.slug
                    ? { backgroundColor: category.color }
                    : {}
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ASOSIY KONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <p className="text-sm text-[var(--text-muted)]">
            {meta.total
              ? `${meta.total} ta natija topildi`
              : isLoading ? '' : 'Natijalar'
            }
          </p>

          <div className="flex items-center gap-2">
            {/* Saralash */}
            <div className="flex items-center gap-1 bg-[var(--bg-muted)]
                            border border-[var(--border)] rounded-xl p-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setParam('sort', opt.value)}
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

            {/* Ko'rinish */}
            <div className="flex items-center gap-1 bg-[var(--bg-muted)]
                            border border-[var(--border)] rounded-xl p-1">
              {[
                { mode: 'grid', Icon: Grid },
                { mode: 'list', Icon: List },
              ].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-all
                             ${viewMode === mode
                               ? 'bg-[var(--bg-card)] text-[var(--text)] shadow-sm'
                               : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                             }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Maqolalar */}
        {viewMode === 'grid' ? (
          <NewsGrid
            articles={articles}
            isLoading={isLoading}
            isError={isError}
            cols="3"
            skeletonCount={12}
            emptyText="Bu kategoriyada maqolalar topilmadi"
          />
        ) : (
          // List ko'rinishi
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))
              : articles.map((article, i) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    variant="compact"
                    index={i}
                  />
                ))
            }
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-[var(--border)]
                         text-sm font-medium text-[var(--text-muted)]
                         hover:bg-[var(--bg-muted)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all"
            >
              ← Oldingi
            </button>

            {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
              let p
              if (meta.totalPages <= 7) {
                p = i + 1
              } else if (page <= 4) {
                p = i + 1
              } else if (page >= meta.totalPages - 3) {
                p = meta.totalPages - 6 + i
              } else {
                p = page - 3 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all
                             ${page === p
                               ? 'bg-blue-600 text-white shadow-md'
                               : 'border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
                             }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
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
