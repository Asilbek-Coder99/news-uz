/**
 * useComments HOOK
 * Maqola izohlari bilan ishlash uchun
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { commentApi } from '@/services/newsApi.js'

export const useComments = (articleId) => {
  const queryClient = useQueryClient()
  const key = ['comments', articleId]

  // Izohlarni yuklash
  const query = useQuery({
    queryKey: key,
    queryFn:  () => commentApi.getForArticle(articleId).then(r => r.data),
    enabled:  !!articleId,
    select:   (d) => d,
  })

  // Yangi izoh qo'shish
  const createMutation = useMutation({
    mutationFn: (data) => commentApi.create({ ...data, articleId }),
    onSuccess: () => {
      toast.success('Izoh yuborildi — moderatsiyadan o\'tgach ko\'rinadi')
      queryClient.invalidateQueries({ queryKey: key })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xato'),
  })

  // Izoh o'chirish
  const deleteMutation = useMutation({
    mutationFn: (id) => commentApi.delete(id),
    onSuccess: () => {
      toast.success('Izoh o\'chirildi')
      queryClient.invalidateQueries({ queryKey: key })
    },
    onError: () => toast.error('O\'chirishda xato'),
  })

  return {
    comments:      query.data?.data || [],
    total:         query.data?.meta?.total || 0,
    isLoading:     query.isLoading,
    isError:       query.isError,

    addComment:    createMutation.mutate,
    isAdding:      createMutation.isPending,
    addError:      createMutation.error,

    deleteComment: deleteMutation.mutate,
    isDeleting:    deleteMutation.isPending,
  }
}
