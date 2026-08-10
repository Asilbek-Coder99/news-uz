/**
 * PROFIL SAHIFASI
 * - Foydalanuvchi ma'lumotlari
 * - Saqlangan maqolalar
 * - Parolni o'zgartirish
 */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import { z }               from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  User, Bookmark, Lock, Edit2, Save,
  Loader2, Camera, LogOut, Shield
} from 'lucide-react'

import { useAuthStore }  from '@/store/authStore.js'
import api               from '@/services/api.js'
import { NewsCard }      from '@/components/news/NewsCard.jsx'
import { formatDate }    from '@/utils/helpers.js'

const TABS = [
  { id: 'profile',   label: 'Profil',       icon: User     },
  { id: 'bookmarks', label: 'Saqlangan',     icon: Bookmark },
  { id: 'password',  label: 'Xavfsizlik',   icon: Lock     },
]

// Parol o'zgartirish sxemasi
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parol majburiy'),
  newPassword: z
    .string()
    .min(8, 'Kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Katta harf kerak')
    .regex(/[0-9]/, 'Raqam kerak'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Parollar mos kelmadi',
  path: ['confirmPassword'],
})

// Profil tahrirlash sxemasi
const profileSchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').optional(),
  username: z
    .string()
    .min(3, 'Kamida 3 ta belgi')
    .regex(/^[a-z0-9_]+$/, 'Faqat kichik harf, raqam va _')
    .optional(),
  bio: z.string().max(500).optional(),
})

// ─── PROFIL TAB ──────────────────────────────────────────────
const ProfileTab = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } =
    useForm({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        fullName: user.fullName || '',
        username: user.username || '',
        bio:      user.bio      || '',
      },
    })

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/users/profile', data),
    onSuccess: ({ data }) => {
      updateUser(data.data)
      toast.success('Profil yangilandi!')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  const roleLabels = {
    USER:        { label: 'Foydalanuvchi', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    EDITOR:      { label: 'Muharrir',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ADMIN:       { label: 'Admin',         color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    SUPER_ADMIN: { label: 'Super Admin',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }
  const roleInfo = roleLabels[user.role] || roleLabels.USER

  return (
    <div className="space-y-6">
      {/* Avatar + asosiy ma'lumot */}
      <div className="news-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500
                              to-indigo-600 flex items-center justify-center
                              text-white text-3xl font-bold shadow-lg">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  user.fullName?.[0] || user.username?.[0] || 'U'
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                                 bg-blue-600 flex items-center justify-center
                                 shadow-md border-2 border-[var(--bg-card)]
                                 hover:bg-blue-700 transition-colors">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">
                {user.fullName || user.username}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleInfo.color}`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {roleInfo.label}
                </span>
                <span className="text-xs text-[var(--text-subtle)]">
                  {formatDate(user.createdAt)} dan beri
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl
                       bg-[var(--bg-muted)] border border-[var(--border)]
                       text-sm font-medium text-[var(--text-muted)]
                       hover:text-[var(--text)] transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditing ? 'Bekor' : 'Tahrirlash'}
          </button>
        </div>

        <AnimatePresence>
          {isEditing ? (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    To'liq ism
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  className="input-base resize-none"
                  placeholder="O'zingiz haqingizda bir necha so'z..."
                  {...register('bio')}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                             bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                             text-white text-sm font-semibold transition-all"
                >
                  {updateMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda</>
                    : <><Save className="w-4 h-4" /> Saqlash</>
                  }
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Email',    value: user.email },
                  { label: 'Username', value: `@${user.username}` },
                  { label: 'Holat',    value: user.isActive ? '✅ Faol' : '🚫 Bloklangan' },
                  { label: 'Tasdiqlangan', value: user.isVerified ? '✅ Ha' : '⏳ Yo\'q' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[var(--text-subtle)] mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-[var(--text)]">{value}</p>
                  </div>
                ))}
              </div>
              {user.bio && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--text-subtle)] mb-1">Bio</p>
                  <p className="text-sm text-[var(--text-muted)]">{user.bio}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── SAQLANGAN TAB ───────────────────────────────────────────
const BookmarksTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn:  () => api.get('/bookmarks').then((r) => r.data),
    select:   (d) => d.data,
  })

  const articles = data || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!articles.length) {
    return (
      <div className="text-center py-16">
        <Bookmark className="w-12 h-12 text-[var(--text-subtle)] mx-auto mb-3" />
        <p className="text-[var(--text-muted)] font-medium">Saqlangan maqolalar yo'q</p>
        <p className="text-sm text-[var(--text-subtle)] mt-1">
          Maqolalarni o'qiyotganda 🔖 tugmasini bosing
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {articles.map((article, i) => (
        <NewsCard key={article.id} article={article} index={i} />
      ))}
    </div>
  )
}

// ─── XAVFSIZLIK TAB ──────────────────────────────────────────
const SecurityTab = () => {
  const { logout } = useAuthStore()

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm({ resolver: zodResolver(passwordSchema) })

  const mutation = useMutation({
    mutationFn: (data) => api.put('/users/password', data),
    onSuccess: () => {
      toast.success("Parol o'zgartirildi! Qayta kiring.")
      reset()
      setTimeout(() => logout(), 1500)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  return (
    <div className="space-y-4">
      <div className="news-card p-6">
        <h3 className="font-bold text-[var(--text)] mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-500" />
          Parolni o'zgartirish
        </h3>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-w-md">
          {[
            { name: 'currentPassword', label: 'Joriy parol',       auto: 'current-password' },
            { name: 'newPassword',     label: 'Yangi parol',       auto: 'new-password'     },
            { name: 'confirmPassword', label: 'Yangi parolni tasdiqlash', auto: 'new-password' },
          ].map(({ name, label, auto }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                {label}
              </label>
              <input
                type="password"
                autoComplete={auto}
                className="input-base"
                {...register(name)}
              />
              {errors[name] && (
                <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                       text-white text-sm font-semibold transition-all"
          >
            {mutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda</>
              : <><Save className="w-4 h-4" /> O'zgartirish</>
            }
          </button>
        </form>
      </div>

      {/* Hisobdan chiqish */}
      <div className="news-card p-5 border-red-200 dark:border-red-900/30">
        <h3 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-red-500" />
          Tizimdan chiqish
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Barcha qurilmalardan chiqish
        </p>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     border border-red-200 dark:border-red-900/30
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20
                     text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  )
}

// ─── ASOSIY PROFIL SAHIFA ────────────────────────────────────
export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'
  const { user }  = useAuthStore()

  const setTab = (tab) => setSearchParams(tab === 'profile' ? {} : { tab })

  if (!user) return null

  const tabComponents = {
    profile:   <ProfileTab   user={user} />,
    bookmarks: <BookmarksTab />,
    password:  <SecurityTab />,
  }

  return (
    <>
      <Helmet>
        <title>Profil — NEWS.UZ</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Sarlavha */}
        <h1
          className="text-2xl font-bold text-[var(--text)] mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Mening profilim
        </h1>

        {/* Tab'lar */}
        <div className="flex gap-1 bg-[var(--bg-muted)] border border-[var(--border)]
                        rounded-2xl p-1.5 mb-6 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                         font-medium transition-all duration-200
                         ${activeTab === id
                           ? 'bg-[var(--bg-card)] text-[var(--text)] shadow-sm'
                           : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                         }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab kontenti */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tabComponents[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
