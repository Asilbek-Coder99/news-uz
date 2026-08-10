/**
 * IZOHLAR BOSHQARUVI
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import toast      from 'react-hot-toast'
import { CheckCircle, XCircle, Trash2, MessageSquare, Filter } from 'lucide-react'
import api from '@/services/api.js'
import { timeAgo } from '@/utils/helpers.js'

const STATUS_STYLES = {
  PENDING:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
  APPROVED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:border-green-900/30',
  REJECTED: 'bg-red-50 text-red-500 border-red-200 dark:bg-red-950/20 dark:border-red-900/30',
}
const STATUS_LABELS = {
  PENDING: 'Kutmoqda', APPROVED: 'Tasdiqlangan', REJECTED: 'Rad etilgan'
}

export default function CommentsPage() {
  const [status, setStatus] = useState('PENDING')
  const [page,   setPage]   = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', status, page],
    queryFn:  () => api.get('/comments', {
      params: { status: status || undefined, page, limit: 15 }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/comments/${id}/approve`),
    onSuccess: (res) => {
      const s = res.data.data.status
      toast.success(s === 'APPROVED' ? 'Tasdiqlandi!' : 'Kutishga qaytarildi')
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
    onError: () => toast.error('Xato'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/comments/${id}`),
    onSuccess: () => {
      toast.success("Izoh o'chirildi")
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
    onError: () => toast.error("O'chirishda xato"),
  })

  const comments = data?.data || []
  const meta     = data?.meta || {}

  const filters = [
    { val: 'PENDING',  label: 'Kutmoqda',      dot: '#d97706' },
    { val: 'APPROVED', label: 'Tasdiqlangan',   dot: '#059669' },
    { val: 'REJECTED', label: 'Rad etilgan',    dot: '#ef4444' },
    { val: '',         label: 'Barchasi',       dot: '#94a3b8' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]"
              style={{ fontFamily: 'Playfair Display,serif' }}>
            Izohlar
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Jami {meta.total ?? '—'} ta izoh
          </p>
        </div>
      </div>

      {/* Status filtri */}
      <div className="news-card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          {filters.map(f => (
            <button
              key={f.val}
              onClick={() => { setStatus(f.val); setPage(1) }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs
                         font-medium transition-all border
                         ${status === f.val
                           ? 'bg-[var(--bg-card)] text-[var(--text)] border-[var(--border)] shadow-sm'
                           : 'text-[var(--text-muted)] border-transparent hover:border-[var(--border)]'
                         }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.dot }} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Izohlar ro'yxati */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))
        ) : !comments.length ? (
          <div className="news-card py-16 text-center">
            <MessageSquare className="w-10 h-10 text-[var(--text-subtle)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] font-medium">
              {status === 'PENDING' ? 'Kutayotgan izoh yo\'q' : 'Izohlar topilmadi'}
            </p>
          </div>
        ) : (
          comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="news-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Chap: foydalanuvchi + izoh */}
                <div className="flex gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400
                                  to-purple-500 flex items-center justify-center
                                  text-white text-sm font-bold shrink-0">
                    {comment.user?.fullName?.[0] || comment.user?.username?.[0] || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Foydalanuvchi + vaqt */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {comment.user?.fullName || comment.user?.username}
                      </span>
                      <span className="text-xs text-[var(--text-subtle)]">
                        {timeAgo(comment.createdAt)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5
                                       rounded-full border ${STATUS_STYLES[comment.status]}`}>
                        {STATUS_LABELS[comment.status]}
                      </span>
                    </div>

                    {/* Izoh matni */}
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-2">
                      {comment.content}
                    </p>

                    {/* Maqola havolasi */}
                    {comment.article && (
                      <Link
                        to={`/news/${comment.article.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-500
                                   hover:text-blue-600 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span className="line-clamp-1 max-w-xs">{comment.article.title}</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* O'ng: amallar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Tasdiqlash / Qaytarish */}
                  <button
                    onClick={() => approveMutation.mutate(comment.id)}
                    disabled={approveMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl
                               text-xs font-medium transition-all border
                               ${comment.status === 'APPROVED'
                                 ? 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20 hover:opacity-80'
                                 : 'text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 hover:opacity-80'
                               }`}
                  >
                    {comment.status === 'APPROVED'
                      ? <><XCircle className="w-3.5 h-3.5" /> Qaytarish</>
                      : <><CheckCircle className="w-3.5 h-3.5" /> Tasdiqlash</>
                    }
                  </button>

                  {/* O'chirish */}
                  <button
                    onClick={() => deleteMutation.mutate(comment.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                               text-xs font-medium text-red-500 border border-red-200
                               bg-red-50 dark:bg-red-950/20 hover:opacity-80
                               transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    O'chirish
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)]
                             text-sm text-[var(--text-muted)] hover:bg-[var(--bg-muted)]
                             disabled:opacity-40 transition-all">
            ← Oldingi
          </button>
          <span className="text-sm text-[var(--text-muted)] px-2">
            {page} / {meta.totalPages}
          </span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)]
                             text-sm text-[var(--text-muted)] hover:bg-[var(--bg-muted)]
                             disabled:opacity-40 transition-all">
            Keyingi →
          </button>
        </div>
      )}
    </div>
  )
}
