/**
 * useCategories HOOK
 * Kategoriyalarni global kesh bilan yuklaydi
 */
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/services/newsApi.js'

export const useCategories = () => {
  const query = useQuery({
    queryKey:  ['categories'],
    queryFn:   () => categoryApi.getAll().then(r => r.data),
    staleTime: 10 * 60 * 1000, // 10 daqiqa — kategoriyalar kam o'zgaradi
    gcTime:    30 * 60 * 1000,
  })

  // Barcha kategoriyalar (ota + bola)
  const allFlat = (query.data || []).flatMap(c => [c, ...(c.children || [])])

  // Slug bo'yicha topish
  const findBySlug = (slug) => allFlat.find(c => c.slug === slug)

  // Faqat ota kategoriyalar
  const parents = (query.data || []).filter(c => !c.parentId)

  return {
    ...query,
    categories: query.data || [],
    allFlat,
    parents,
    findBySlug,
  }
}

/**
 * useCategory HOOK — bitta kategoriya (slug bo'yicha)
 */
export const useCategory = (slug) => {
  const query = useQuery({
    queryKey: ['category', slug],
    queryFn:  () => categoryApi.getBySlug(slug).then(r => r.data),
    enabled:  !!slug,
  })

  return { ...query, category: query.data }
}
