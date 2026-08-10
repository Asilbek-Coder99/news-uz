/**
 * MAQOLALAR BOSHQARUVI — Admin CMS
 */
import { useState } from 'react'
import { Link }     from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion }   from 'framer-motion'
import toast        from 'react-hot-toast'
import {
  Plus, Search, Edit2, Trash2, Eye, Star,
  Zap, TrendingUp, Filter, MoreVertical,
  ChevronDown, CheckCircle, Clock, Archive
} from 'lucide-react'
import api from '@/services/api.js'
import { timeAgo, formatViews } from '@/utils/helpers.js'

const STATUS_MAP = {
  PUBLISHED: { label: 'Nashr',     color: 'text-green-600 bg-green-50 dark:bg-green-950/20',  icon: CheckCircle },
  DRAFT:     { label: 'Qoralama',  color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',  icon: Clock       },
  ARCHIVED:  { label: 'Arxiv',     color: 'text-gray-500  bg-gray-100  dark:bg-gray-800',      icon: Archive     },
}

export default function ArticlesAdminPage() {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [deleting, setDeleting] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', search, status, page],
    queryFn:  () => api.get('/news', {
      params: { search: search || undefined, status: status || undefined, page, limit: 10, sort: '-createdAt' }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/news/${id}`),
    onSuccess: () => {
      toast.success("Maqola o'chirildi")
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      setDeleting(null)
    },
    onError: () => toast.error("O'chirishda xato"),
  })

  const toggleFeatured = useMutation({
    mutationFn: ({ id, val }) => api.put(`/news/${id}`, { isFeatured: val }),
    onSuccess: () => {
      toast.success('Yangilandi')
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
    },
  })

  const articles   = data?.data  || []
  const meta       = data?.meta  || {}

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'Playfair Display,serif' }}>
            Maqolalar
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Jami {meta.total ?? '—'} ta maqola
          </p>
        </div>
        <Link to="/admin/articles/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                         hover:bg-blue-700 text-white text-sm font-semibold transition-all
                         shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Yangi maqola
        </Link>
      </div>

      {/* Filtrlar */}
      <div className="news-card p-4 flex flex-wrap items-center gap-3">
        {/* Qidiruv */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Maqola qidirish..."
            className="input-base pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Status filtri */}
        <div className="flex gap-1 bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-1">
          {[
            { val: '',          label: 'Barchasi' },
            { val: 'PUBLISHED', label: 'Nashr' },
            { val: 'DRAFT',     label: 'Qoralama' },
            { val: 'ARCHIVED',  label: 'Arxiv' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => { setStatus(opt.val); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                         ${status === opt.val
                           ? 'bg-[var(--bg-card)] text-[var(--text)] shadow-sm'
                           : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jadval */}
      <div className="news-card overflow-hidden">
        {/* Jadval sarlavhasi */}
        <div className="grid grid-cols-[1fr_120px_100px_80px_100px] gap-4 px-5 py-3
                        border-b border-[var(--border)] bg-[var(--bg-muted)]">
          {['Maqola', 'Kategoriya', 'Status', "Ko'rish", 'Amallar'].map(h => (
            <span key={h} className="text-xs font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="divide-y divide-[var(--border)]">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="grid grid-cols-[1fr_120px_100px_80px_100px] gap-4 px-5 py-4 items-center">
                <div className="flex gap-3 items-center">
                  <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-3.5 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-4 w-12" />
                <div className="skeleton h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : !articles.length ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)]">Maqolalar topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {articles.map((article, i) => {
              const st = STATUS_MAP[article.status] || STATUS_MAP.DRAFT
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[1fr_120px_100px_80px_100px] gap-4
                             px-5 py-4 items-center hover:bg-[var(--bg-muted)] transition-colors"
                >
                  {/* Maqola */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-muted)]">
                      {article.coverImage
                        ? <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[var(--text-subtle)] text-lg">📄</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {article.isFeatured  && <Star    className="w-3 h-3 text-amber-500 shrink-0" />}
                        {article.isBreaking  && <Zap     className="w-3 h-3 text-red-500   shrink-0" />}
                        {article.isTrending  && <TrendingUp className="w-3 h-3 text-purple-500 shrink-0" />}
                        <p className="text-sm font-medium text-[var(--text)] line-clamp-1">
                          {article.title}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--text-subtle)]">
                        {article.authorName} • {timeAgo(article.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Kategoriya */}
                  <div>
                    <span className="text-xs font-medium text-[var(--text-muted)]"
                          style={{ color: article.category?.color }}>
                      {article.category?.icon} {article.category?.name}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Ko'rishlar */}
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Eye className="w-3 h-3" />
                    {formatViews(article.viewCount)}
                  </div>

                  {/* Amallar */}
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/articles/${article.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg
                                 text-[var(--text-muted)] hover:text-blue-500
                                 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/news/${article.slug}`}
                      target="_blank"
                      className="w-8 h-8 flex items-center justify-center rounded-lg
                                 text-[var(--text-muted)] hover:text-green-500
                                 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    {deleting === article.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(article.id)}
                          disabled={deleteMutation.isPending}
                          className="w-8 h-8 flex items-center justify-center rounded-lg
                                     text-red-500 bg-red-50 dark:bg-red-950/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(null)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg
                                     text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleting(article.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   text-[var(--text-muted)] hover:text-red-500
                                   hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4
                          border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">
              {meta.total} ta natijadan {(page-1)*10+1}–{Math.min(page*10, meta.total)} ko'rsatilmoqda
            </p>
            <div className="flex gap-1.5">
              <button disabled={page<=1} onClick={() => setPage(p=>p-1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)]
                                 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]
                                 disabled:opacity-40 transition-all">
                ← Oldingi
              </button>
              <span className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium">
                {page}
              </span>
              <button disabled={page>=meta.totalPages} onClick={() => setPage(p=>p+1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)]
                                 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]
                                 disabled:opacity-40 transition-all">
                Keyingi →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
