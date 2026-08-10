/**
 * KATEGORIYALAR BOSHQARUVI
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, X, Save, Loader2, FolderOpen, ChevronRight } from 'lucide-react'
import api from '@/services/api.js'

const COLORS = [
  '#2563eb','#dc2626','#7c3aed','#059669',
  '#d97706','#ec4899','#0891b2','#1d6fa4',
]

const ICONS = ['🇺🇿','🌍','⚽','💻','📈','🚗','🎭','📹','🏛️','🔬','💰','📡']

const CategoryForm = ({ initial, categories, onSave, onCancel, loading }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name:     initial?.name     || '',
      nameUz:   initial?.nameUz   || '',
      color:    initial?.color    || '#2563eb',
      icon:     initial?.icon     || '',
      parentId: initial?.parentId || '',
      order:    initial?.order    || 0,
    },
  })
  const selectedColor = watch('color')
  const selectedIcon  = watch('icon')

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            Nomi (inglizcha) <span className="text-red-500">*</span>
          </label>
          <input type="text" placeholder="Sport" className="input-base"
                 {...register('name', { required: "Nom majburiy" })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            Nomi (o'zbekcha)
          </label>
          <input type="text" placeholder="Sport" className="input-base" {...register('nameUz')} />
        </div>
      </div>

      {/* Rang */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-2">Rang</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setValue('color', c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedColor === c ? 'border-[var(--text)] scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
          ))}
          <input type="color" value={selectedColor}
                 onChange={e => setValue('color', e.target.value)}
                 className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border)]" />
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-2">Emoji ikonka</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ICONS.map(ico => (
            <button key={ico} type="button" onClick={() => setValue('icon', ico)}
                    className={`w-9 h-9 text-lg rounded-lg border transition-all ${selectedIcon === ico ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-[var(--border)] hover:border-[var(--text-subtle)]'}`}>
              {ico}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Yoki emoji kiriting: 🎯"
               className="input-base text-sm w-40" {...register('icon')} />
      </div>

      {/* Ota kategoriya */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
          Ota kategoriya (ixtiyoriy)
        </label>
        <select className="input-base" {...register('parentId')}>
          <option value="">— Asosiy kategoriya —</option>
          {categories.filter(c => !c.parentId).map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                           hover:bg-blue-700 disabled:opacity-60 text-white text-sm
                           font-semibold transition-all">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Saqlash
        </button>
        <button type="button" onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)]
                           text-sm text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-all">
          Bekor
        </button>
      </div>
    </form>
  )
}

export default function CategoriesPage() {
  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteId,   setDeleteId]   = useState(null)
  const queryClient = useQueryClient()

  const { data: catsData = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn:  () => api.get('/categories').then(r => r.data.data),
  })

  const allCats = catsData.flatMap(c => [c, ...(c.children||[])])

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/categories', data),
    onSuccess: () => {
      toast.success('Kategoriya yaratildi!')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowForm(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      toast.success('Yangilandi!')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditItem(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success("O'chirildi!")
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]"
              style={{ fontFamily: 'Playfair Display,serif' }}>Kategoriyalar</h1>
          <p className="text-sm text-[var(--text-muted)]">{allCats.length} ta kategoriya</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                           hover:bg-blue-700 text-white text-sm font-semibold transition-all
                           shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Yangi kategoriya
        </button>
      </div>

      {/* Yangi/Tahrirlash formasi */}
      <AnimatePresence>
        {(showForm || editItem) && (
          <motion.div
            initial={{ opacity:0, y:-12 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-12 }}
            className="news-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[var(--text)]">
                {editItem ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditItem(null) }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg
                                 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <CategoryForm
              initial={editItem}
              categories={allCats}
              loading={createMutation.isPending || updateMutation.isPending}
              onCancel={() => { setShowForm(false); setEditItem(null) }}
              onSave={(data) => {
                if (editItem) updateMutation.mutate({ id: editItem.id, ...data })
                else createMutation.mutate(data)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kategoriyalar ro'yxati */}
      <div className="space-y-3">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : catsData.map(cat => (
          <motion.div key={cat.id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            className="news-card overflow-hidden"
          >
            {/* Ota kategoriya */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                     style={{ backgroundColor: cat.color + '18' }}>
                  {cat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[var(--text)]">{cat.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: cat.color }}>
                      Asosiy
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {cat._count?.articles || 0} ta maqola •{' '}
                    {cat.children?.length || 0} ta ichki kategoriya
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setEditItem(cat); setShowForm(false) }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   text-[var(--text-muted)] hover:text-blue-500
                                   hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {deleteId === cat.id ? (
                  <>
                    <button onClick={() => deleteMutation.mutate(cat.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium">
                      Ha, o'chir
                    </button>
                    <button onClick={() => setDeleteId(null)}
                            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)]">
                      Bekor
                    </button>
                  </>
                ) : (
                  <button onClick={() => setDeleteId(cat.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg
                                     text-[var(--text-muted)] hover:text-red-500
                                     hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Ichki kategoriyalar */}
            {cat.children?.length > 0 && (
              <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                {cat.children.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between px-5 py-3
                                               bg-[var(--bg-muted)] hover:bg-[var(--border)]
                                               transition-colors">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-subtle)] ml-3" />
                      <span className="text-sm text-[var(--text-muted)]">{sub.name}</span>
                      <span className="text-xs text-[var(--text-subtle)]">
                        {sub._count?.articles || 0} maqola
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditItem(sub); setShowForm(false) }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg
                                         text-[var(--text-muted)] hover:text-blue-500
                                         hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(sub.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg
                                         text-[var(--text-muted)] hover:text-red-500
                                         hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
