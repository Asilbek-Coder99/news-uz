/**
 * MAQOLA YARATISH / TAHRIRLASH FORMASI
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save, Eye, ArrowLeft, Image, Star, Zap, TrendingUp, Loader2, X, Plus } from 'lucide-react'
import api from '@/services/api.js'
import { useAuthStore } from '@/store/authStore.js'

const schema = z.object({
  title:      z.string().min(5, 'Sarlavha kamida 5 ta belgi'),
  excerpt:    z.string().max(500).optional(),
  content:    z.string().min(50, 'Matn kamida 50 ta belgi'),
  categoryId: z.string().min(1, 'Kategoriya tanlang'),
  status:     z.enum(['DRAFT','PUBLISHED','ARCHIVED']),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  tagIds:     z.array(z.string()).optional(),
})

// Toggle belgisi (Featured, Breaking, Trending)
const Toggle = ({ label, icon: Icon, color, checked, onChange }) => (
  <label className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer border transition-all
                     ${checked
                       ? 'border-transparent text-white'
                       : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-subtle)]'}`}
         style={checked ? { backgroundColor: color } : {}}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
    <Icon className="w-4 h-4 shrink-0" />
    <span className="text-xs font-semibold">{label}</span>
  </label>
)

export default function ArticleFormPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const queryClient = useQueryClient()
  const { user }   = useAuthStore()
  const isEditing  = !!id
  const [imageUrl, setImageUrl] = useState('')

  const { register, handleSubmit, control, reset, watch, setValue,
    formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'DRAFT', isFeatured: false, isBreaking: false,
      isTrending: false, tagIds: [],
    },
  })

  // Kategoriyalar
  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => api.get('/categories').then(r => r.data.data),
  })

  // Tahrirlash uchun mavjud maqola
  const { data: existingData } = useQuery({
    queryKey: ['admin-article', id],
    queryFn:  () => api.get(`/news/${id}`).then(r => r.data.data),
    enabled:  isEditing,
    onSuccess: (article) => {
      reset({
        title:      article.title,
        excerpt:    article.excerpt || '',
        content:    article.content,
        categoryId: article.categoryId || article.category?.id,
        status:     article.status,
        isFeatured: article.isFeatured,
        isBreaking: article.isBreaking,
        isTrending: article.isTrending,
        coverImage: article.coverImage || '',
        tagIds:     article.tags?.map(t => t.id) || [],
      })
      setImageUrl(article.coverImage || '')
    },
  })

  // Saqlash
  const saveMutation = useMutation({
    mutationFn: (data) => isEditing
      ? api.put(`/news/${id}`, data)
      : api.post('/news', data),
    onSuccess: (res) => {
      const article = res.data.data
      toast.success(isEditing ? 'Yangilandi!' : 'Maqola yaratildi!')
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      if (!isEditing) navigate(`/admin/articles/${article.id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  const onSubmit = (data) => saveMutation.mutate(data)

  const coverImage = watch('coverImage')
  const allCategories = catsData?.flatMap(c => [c, ...(c.children||[])]) || []
  const currentStatus = watch('status')

  const statusBtn = (val, label, color) => (
    <button
      type="button"
      onClick={() => setValue('status', val, { shouldDirty: true })}
      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border
                  ${currentStatus === val
                    ? 'text-white border-transparent'
                    : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-subtle)]'}`}
      style={currentStatus === val ? { backgroundColor: color } : {}}
    >
      {label}
    </button>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/admin/articles')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl
                             border border-[var(--border)] text-[var(--text-muted)]
                             hover:bg-[var(--bg-muted)] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]"
                style={{ fontFamily: 'Playfair Display,serif' }}>
              {isEditing ? 'Maqolani tahrirlash' : 'Yangi maqola'}
            </h1>
            {isDirty && <p className="text-xs text-amber-500 mt-0.5">Saqlanmagan o'zgarishlar bor</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <a href={`/news/${existingData?.slug}`} target="_blank"
               className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border
                          border-[var(--border)] text-sm font-medium text-[var(--text-muted)]
                          hover:bg-[var(--bg-muted)] transition-all">
              <Eye className="w-4 h-4" /> Ko'rish
            </a>
          )}
          <button type="submit" disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                             hover:bg-blue-700 disabled:opacity-60 text-white text-sm
                             font-semibold transition-all shadow-md shadow-blue-600/20">
            {saveMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda</>
              : <><Save className="w-4 h-4" /> Saqlash</>
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Asosiy kontent */}
        <div className="xl:col-span-2 space-y-4">

          {/* Sarlavha */}
          <div className="news-card p-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Maqola sarlavhasini kiriting..."
              className="input-base text-lg font-semibold"
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title.message}</p>}
          </div>

          {/* Qisqa matn */}
          <div className="news-card p-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Qisqa tasvir (excerpt)
            </label>
            <textarea
              rows={3}
              placeholder="Maqola haqida qisqa ma'lumot..."
              className="input-base resize-none"
              {...register('excerpt')}
            />
          </div>

          {/* Asosiy matn */}
          <div className="news-card p-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Maqola matni <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[var(--text-subtle)] mb-3">
              HTML teglardan foydalanishingiz mumkin: &lt;h2&gt;, &lt;p&gt;, &lt;b&gt;, &lt;i&gt;, &lt;ul&gt;, &lt;blockquote&gt;
            </p>
            <textarea
              rows={20}
              placeholder="Maqola matnini yozing..."
              className="input-base resize-y font-mono text-sm leading-relaxed"
              {...register('content')}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1.5">{errors.content.message}</p>}
          </div>
        </div>

        {/* O'ng panel */}
        <div className="space-y-4">

          {/* Nashr holati */}
          <div className="news-card p-5">
            <p className="text-sm font-semibold text-[var(--text)] mb-3">Holat</p>
            <div className="flex gap-2">
              {statusBtn('DRAFT',     'Qoralama', '#d97706')}
              {statusBtn('PUBLISHED', 'Nashr',    '#059669')}
              {statusBtn('ARCHIVED',  'Arxiv',    '#64748b')}
            </div>
          </div>

          {/* Kategoriya */}
          <div className="news-card p-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Kategoriya <span className="text-red-500">*</span>
            </label>
            <select className="input-base" {...register('categoryId')}>
              <option value="">Tanlang...</option>
              {catsData?.map(cat => (
                <optgroup key={cat.id} label={`${cat.icon || ''} ${cat.name}`}>
                  <option value={cat.id}>{cat.name} (asosiy)</option>
                  {cat.children?.map(sub => (
                    <option key={sub.id} value={sub.id}>  └ {sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1.5">{errors.categoryId.message}</p>}
          </div>

          {/* Cover rasm */}
          <div className="news-card p-5">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              <Image className="w-4 h-4 inline mr-1.5" />
              Cover rasm URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="input-base text-sm"
              {...register('coverImage')}
            />
            {coverImage && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img src={coverImage} alt="Cover" className="w-full h-36 object-cover" />
              </div>
            )}
          </div>

          {/* Maxsus belgilar */}
          <div className="news-card p-5">
            <p className="text-sm font-semibold text-[var(--text)] mb-3">Maxsus belgilar</p>
            <div className="space-y-2">
              <Controller name="isFeatured" control={control}
                render={({ field }) => (
                  <Toggle label="Tanlangan (Featured)" icon={Star} color="#d97706"
                          checked={!!field.value} onChange={field.onChange} />
                )} />
              <Controller name="isBreaking" control={control}
                render={({ field }) => (
                  <Toggle label="Shoshilinch (Breaking)" icon={Zap} color="#dc2626"
                          checked={!!field.value} onChange={field.onChange} />
                )} />
              <Controller name="isTrending" control={control}
                render={({ field }) => (
                  <Toggle label="Trendda (Trending)" icon={TrendingUp} color="#7c3aed"
                          checked={!!field.value} onChange={field.onChange} />
                )} />
            </div>
          </div>

          {/* Muallif */}
          <div className="news-card p-4">
            <p className="text-xs text-[var(--text-subtle)] mb-1">Muallif</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center
                              justify-center text-white text-xs font-bold">
                {user?.fullName?.[0] || user?.username?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-[var(--text-subtle)]">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
