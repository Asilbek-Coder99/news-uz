/**
 * FOYDALANUVCHILAR BOSHQARUVI
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Search, Shield, Ban, UserCheck, ChevronDown } from 'lucide-react'
import api from '@/services/api.js'
import { formatDate, timeAgo } from '@/utils/helpers.js'

const ROLES = ['USER', 'EDITOR', 'ADMIN']

const ROLE_STYLES = {
  USER:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  EDITOR:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ADMIN:       'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
const ROLE_LABELS = {
  USER: 'Foydalanuvchi', EDITOR: 'Muharrir',
  ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
}

export default function UsersPage() {
  const [search, setSearch]   = useState('')
  const [page,   setPage]     = useState(1)
  const [roleOpen, setRoleOpen] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn:  () => api.get('/users', {
      params: { search: search || undefined, page, limit: 15 }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const blockMutation = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/block`),
    onSuccess: (res) => {
      const u = res.data.data
      toast.success(u.isActive ? 'Blokdan chiqarildi' : 'Bloklandi')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Role yangilandi!')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setRoleOpen(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  const users = data?.data || []
  const meta  = data?.meta || {}

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]"
            style={{ fontFamily: 'Playfair Display,serif' }}>
          Foydalanuvchilar
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Jami {meta.total ?? '—'} ta ro'yxatdan o'tgan
        </p>
      </div>

      {/* Qidiruv */}
      <div className="news-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Ism, email yoki username..."
            className="input-base pl-9 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Jadval */}
      <div className="news-card overflow-hidden">
        {/* Sarlavha */}
        <div className="grid grid-cols-[1fr_160px_130px_110px_120px] gap-3 px-5 py-3
                        bg-[var(--bg-muted)] border-b border-[var(--border)]">
          {['Foydalanuvchi', "Ro'yxat sanasi", 'Role', 'Holat', 'Amallar'].map(h => (
            <span key={h} className="text-xs font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_160px_130px_110px_120px]
                                       gap-3 px-5 py-4 items-center">
                <div className="flex gap-3 items-center">
                  <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-3.5 w-28" />
                    <div className="skeleton h-3 w-36" />
                  </div>
                </div>
                <div className="skeleton h-3.5 w-24" />
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-8 w-28 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !users.length ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            Foydalanuvchilar topilmadi
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[1fr_160px_130px_110px_120px] gap-3
                           px-5 py-4 items-center hover:bg-[var(--bg-muted)] transition-colors"
              >
                {/* Avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500
                                  to-indigo-600 flex items-center justify-center
                                  text-white text-sm font-bold shrink-0">
                    {user.fullName?.[0] || user.username?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-[var(--text-subtle)] truncate">{user.email}</p>
                  </div>
                </div>

                {/* Sana */}
                <p className="text-xs text-[var(--text-muted)]">
                  {formatDate(user.createdAt, 'd MMM yyyy')}
                </p>

                {/* Role dropdown */}
                <div className="relative">
                  {user.role === 'SUPER_ADMIN' ? (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                                     ${ROLE_STYLES[user.role]}`}>
                      <Shield className="w-3 h-3 inline mr-1" />
                      {ROLE_LABELS[user.role]}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => setRoleOpen(roleOpen === user.id ? null : user.id)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1
                                   rounded-full font-semibold transition-all
                                   ${ROLE_STYLES[user.role]} hover:opacity-80`}
                      >
                        {ROLE_LABELS[user.role]}
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {roleOpen === user.id && (
                        <>
                          <div className="fixed inset-0 z-10"
                               onClick={() => setRoleOpen(null)} />
                          <div className="absolute left-0 top-full mt-1 z-20 w-36
                                          glass rounded-xl shadow-[var(--shadow-lg)]
                                          border border-[var(--border)] py-1 overflow-hidden">
                            {ROLES.filter(r => r !== user.role).map(role => (
                              <button
                                key={role}
                                onClick={() => roleMutation.mutate({ id: user.id, role })}
                                disabled={roleMutation.isPending}
                                className="flex items-center gap-2 w-full px-3 py-2
                                           text-xs text-[var(--text-muted)]
                                           hover:bg-[var(--bg-muted)] transition-colors"
                              >
                                <span className={`w-2 h-2 rounded-full`}
                                      style={{
                                        backgroundColor:
                                          role === 'ADMIN'  ? '#7c3aed' :
                                          role === 'EDITOR' ? '#2563eb' : '#6b7280'
                                      }} />
                                {ROLE_LABELS[role]}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Holat */}
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1
                                   rounded-full font-semibold
                                   ${user.isActive
                                     ? 'bg-green-50 text-green-600 dark:bg-green-950/20'
                                     : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                                   }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {user.isActive ? 'Faol' : 'Bloklangan'}
                  </span>
                </div>

                {/* Amallar */}
                <div>
                  {user.role !== 'SUPER_ADMIN' && (
                    <button
                      onClick={() => blockMutation.mutate(user.id)}
                      disabled={blockMutation.isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 text-xs font-medium transition-all
                                 ${user.isActive
                                   ? 'text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30'
                                   : 'text-green-600 bg-green-50 dark:bg-green-950/20 hover:bg-green-100'
                                 }`}
                    >
                      {user.isActive
                        ? <><Ban className="w-3.5 h-3.5" /> Bloklash</>
                        : <><UserCheck className="w-3.5 h-3.5" /> Ochish</>
                      }
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4
                          border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">
              {meta.total} ta foydalanuvchi
            </p>
            <div className="flex gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)]
                                 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]
                                 disabled:opacity-40 transition-all">
                ← Oldingi
              </button>
              <span className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium">
                {page} / {meta.totalPages}
              </span>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}
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
