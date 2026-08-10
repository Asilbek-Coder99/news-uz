/**
 * useUpload HOOK
 * Rasmlarni Cloudinary'ga yuklash uchun
 */
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/api.js'

export const useUpload = () => {
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('image', file)

      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setProgress(pct)
        },
      })

      setProgress(0)
      return res.data.data // { url, publicId, width, height }
    },
    onError: (err) => {
      setProgress(0)
      toast.error(err.response?.data?.message || 'Rasm yuklanmadi')
    },
  })

  return {
    upload:     mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    uploadedUrl: mutation.data?.url,
    reset:       mutation.reset,
  }
}

/**
 * Fayl tanlash dialogi
 */
export const selectImageFile = () => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type   = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.onchange = (e) => resolve(e.target.files[0] || null)
    input.click()
  })
}
