/**
 * ADMIN DASHBOARD
 */
import { useQuery } from '@tanstack/react-query'
import { motion }   from 'framer-motion'
import { Link }     from 'react-router-dom'
import { Newspaper, Users, Eye, MessageSquare, TrendingUp, Plus, ArrowUpRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/services/api.js'
import { formatViews, timeAgo } from '@/utils/helpers.js'

const StatCard = ({ label, value, icon: Icon, color, sub, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="news-card p-5"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
           style={{ backgroundColor: color + '18' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <ArrowUpRight className="w-4 h-4 text-[var(--text-subtle)]" />
    </div>
    <p className="text-2xl font-bold text-[var(--text)] mb-0.5">{value ?? '—'}</p>
    <p className="text-sm text-[var(--text-muted)]">{label}</p>
    {sub && <p className="text-xs text-[var(--text-subtle)] mt-1">{sub}</p>}
  </motion.div>
)

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => api.get('/users/stats').then(r => r.data.data),
  })
  const { data: recentRaw } = useQuery({
    queryKey: ['admin-recent'],
    queryFn:  () => api.get('/news', { params: { limit: 6, sort: '-createdAt' } }).then(r => r.data.data),
  })
  const { data: pendingRaw } = useQuery({
    queryKey: ['admin-pending-comments'],
    queryFn:  () => api.get('/comments', { params: { status: 'PENDING', limit: 5 } }).then(r => r.data.data),
  })

  const statCards = [
    { label: 'Jami maqolalar',    value: stats?.articles?.total, sub: `${stats?.articles?.published ?? '—'} nashr`, icon: Newspaper,    color: '#2563eb' },
    { label: 'Foydalanuvchilar',  value: stats?.users?.total,    icon: Users,         color: '#7c3aed' },
    { label: "Ko'rishlar",        value: stats?.views?.total ? formatViews(stats.views.total) : '—', icon: Eye, color: '#059669' },
    { label: 'Izohlar',           value: stats?.comments?.total, sub: `${stats?.comments?.pending ?? '—'} kutmoqda`, icon: MessageSquare, color: '#d97706' },
  ]

  const statusMap = { PUBLISHED: ['Nashr','text-green-600 bg-green-50 dark:bg-green-950/20'], DRAFT: ['Qoralama','text-amber-600 bg-amber-50 dark:bg-amber-950/20'], ARCHIVED: ['Arxiv','text-gray-500 bg-gray-100 dark:bg-gray-800'] }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'Playfair Display, serif' }}>Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">NEWS.UZ boshqaruv markazi</p>
        </div>
        <Link to="/admin/articles/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Yangi maqola
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => <StatCard key={c.label} {...c} index={i} />)}
      </div>

      {stats?.popularArticles?.length > 0 && (
        <div className="news-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-[var(--text)]">Eng ko'p o'qilganlar</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {stats.popularArticles.map((a, i) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-xl font-black text-[var(--border)] w-6 text-center shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <Link to={`/news/${a.slug}`} target="_blank"
                        className="text-sm font-medium text-[var(--text)] line-clamp-1 hover:text-blue-600">
                    {a.title}
                  </Link>
                  <p className="text-xs text-[var(--text-subtle)]">{a.category?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[var(--text)]">{formatViews(a.viewCount)}</p>
                  <p className="text-[10px] text-[var(--text-subtle)]">ko'rish</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* So'nggi maqolalar */}
        <div className="news-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> So'nggi maqolalar
            </h3>
            <Link to="/admin/articles" className="text-xs text-blue-500 font-medium">Barchasi →</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentRaw?.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-muted)] transition-colors">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-muted)]">
                  {a.coverImage
                    ? <img src={a.coverImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-4 h-4 text-[var(--text-subtle)]" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/admin/articles/${a.id}`} className="text-sm font-medium text-[var(--text)] line-clamp-1 hover:text-blue-600">{a.title}</Link>
                  <p className="text-xs text-[var(--text-subtle)]">{a.category?.name} • {timeAgo(a.createdAt)}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusMap[a.status]?.[1]}`}>
                  {statusMap[a.status]?.[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kutayotgan izohlar */}
        <div className="news-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Kutayotgan izohlar
            </h3>
            <Link to="/admin/comments" className="text-xs text-blue-500 font-medium">Barchasi →</Link>
          </div>
          {!pendingRaw?.length ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)]">Barcha izohlar ko'rib chiqilgan</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {pendingRaw.map(c => (
                <div key={c.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[var(--text)]">{c.user?.fullName || c.user?.username}</span>
                    <span className="text-xs text-[var(--text-subtle)]">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{c.content}</p>
                  <p className="text-[10px] text-blue-500 mt-1 line-clamp-1">{c.article?.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
