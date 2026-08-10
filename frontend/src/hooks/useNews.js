/**
 * useNews HOOKS — Maqolalar uchun React Query hook'lari
 *
 * Har bir hook kesh, loading va error holatlarini boshqaradi.
 */
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { newsApi } from '@/services/newsApi.js'

// ─── QUERY KEYS (kesh kalitlari) ─────────────────────────────
export const newsKeys = {
  all:       ['news'],
  lists:     () => [...newsKeys.all, 'list'],
  list:      (filters) => [...newsKeys.lists(), filters],
  detail:    (slug) => [...newsKeys.all, 'detail', slug],
  featured:  () => [...newsKeys.all, 'featured'],
  trending:  () => [...newsKeys.all, 'trending'],
  breaking:  () => [...newsKeys.all, 'breaking'],
  related:   (slug) => [...newsKeys.all, 'related', slug],
}

// ─── HOOKS ───────────────────────────────────────────────────

/**
 * Maqolalar ro'yxati (filtr + pagination)
 */
export const useArticles = (params = {}) =>
  useQuery({
    queryKey: newsKeys.list(params),
    queryFn:  () => newsApi.getArticles(params),
    keepPreviousData: true, // pagination da sakrashni oldini olish
  })

/**
 * Cheksiz scroll uchun maqolalar
 */
export const useInfiniteArticles = (params = {}) =>
  useInfiniteQuery({
    queryKey: [...newsKeys.lists(), 'infinite', params],
    queryFn:  ({ pageParam = 1 }) =>
      newsApi.getArticles({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      return page < totalPages ? page + 1 : undefined
    },
  })

/**
 * Featured maqolalar
 */
export const useFeaturedArticles = (limit = 5) =>
  useQuery({
    queryKey: newsKeys.featured(),
    queryFn:  () => newsApi.getFeatured(limit),
    staleTime: 5 * 60 * 1000,
  })

/**
 * Trending maqolalar
 */
export const useTrendingArticles = (limit = 10) =>
  useQuery({
    queryKey: newsKeys.trending(),
    queryFn:  () => newsApi.getTrending(limit),
    staleTime: 5 * 60 * 1000,
  })

/**
 * Breaking yangiliklar
 */
export const useBreakingNews = (limit = 5) =>
  useQuery({
    queryKey: newsKeys.breaking(),
    queryFn:  () => newsApi.getBreaking(limit),
    staleTime: 2 * 60 * 1000, // breaking uchun tezroq yangilanish
    refetchInterval: 2 * 60 * 1000,
  })

/**
 * Bitta maqola (slug bo'yicha)
 */
export const useArticle = (slug) =>
  useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn:  () => newsApi.getBySlug(slug),
    enabled:  !!slug,
    select:   (data) => data.data,
  })

/**
 * O'xshash maqolalar
 */
export const useRelatedArticles = (slug) =>
  useQuery({
    queryKey: newsKeys.related(slug),
    queryFn:  () => newsApi.getRelated(slug),
    enabled:  !!slug,
    select:   (data) => data.data,
  })

/**
 * Like toggle
 */
export const useLike = (articleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => newsApi.toggleLike(articleId),
    // Optimistic update — UI darhol yangilanadi
    onMutate: async () => {
      const key = newsKeys.detail
      await queryClient.cancelQueries({ queryKey: key })
    },
    onSuccess: (data) => {
      const msg = data.data.liked ? '❤️ Like qo\'shildi' : 'Like olib tashlandi'
      toast.success(msg, { duration: 2000 })
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
    },
    onError: () => toast.error('Xato yuz berdi'),
  })
}

/**
 * Bookmark toggle
 */
export const useBookmark = (articleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => newsApi.toggleBookmark(articleId),
    onSuccess: (data) => {
      const msg = data.data.bookmarked ? '🔖 Saqlandi' : 'Saqlashdan olib tashlandi'
      toast.success(msg, { duration: 2000 })
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: () => toast.error('Xato yuz berdi'),
  })
}

/**
 * Maqola yaratish (admin)
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: newsApi.create,
    onSuccess: () => {
      toast.success('Maqola muvaffaqiyatli yaratildi!')
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })
}

/**
 * Maqola yangilash (admin)
 */
export const useUpdateArticle = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => newsApi.update(id, data),
    onSuccess: () => {
      toast.success('Maqola yangilandi!')
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })
}

/**
 * Maqola o'chirish (admin)
 */
export const useDeleteArticle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: newsApi.delete,
    onSuccess: () => {
      toast.success("Maqola o'chirildi")
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
    },
    onError: () => toast.error("O'chirishda xato"),
  })
}
