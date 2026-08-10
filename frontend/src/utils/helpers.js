/**
 * FRONTEND YORDAMCHI FUNKSIYALAR
 */
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { uz } from 'date-fns/locale'

/**
 * Sanani "3 soat oldin" formatida ko'rsatish
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(parseISO(dateStr), {
      addSuffix: true,
      locale: uz,
    })
  } catch {
    return ''
  }
}

/**
 * Sanani "12 Yanvar 2024" formatida ko'rsatish
 */
export const formatDate = (dateStr, fmt = 'd MMMM yyyy') => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), fmt, { locale: uz })
  } catch {
    return ''
  }
}

/**
 * Ko'rishlar sonini formatlash: 12500 → "12.5K"
 */
export const formatViews = (count) => {
  if (!count) return '0'
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000)     return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

/**
 * Matnni qisqartirish
 */
export const truncate = (text, len = 120) => {
  if (!text || text.length <= len) return text
  return text.slice(0, len).trim() + '…'
}

/**
 * Rasm URL yoki placeholder qaytarish
 */
export const getImageUrl = (url, fallback = '/placeholder-news.jpg') =>
  url || fallback

/**
 * Kategoriya rangi bo'yicha badge stil
 */
export const getCategoryStyle = (color = '#2563eb') => ({
  backgroundColor: color + '18',
  color,
  borderColor:     color + '30',
})

/**
 * O'qish vaqti: "5 daqiqa o'qish"
 */
export const readTime = (min) => {
  if (!min) return ''
  return `${min} daqiqa`
}

/**
 * Clipboard ga nusxa ko'chirish
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Share API yoki fallback
 */
export const shareArticle = async ({ title, url }) => {
  if (navigator.share) {
    await navigator.share({ title, url })
  } else {
    await copyToClipboard(url)
  }
}

/**
 * CSS klasslarini birlashtirish
 */
export const cn = (...classes) =>
  classes.filter(Boolean).join(' ')
