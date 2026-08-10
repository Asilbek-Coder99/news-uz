/**
 * PERFORMANCE HOOK'LARI
 * Ilovani tezlashtirish va monitoring qilish uchun
 */
import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Debounce hook — foydalanuvchi yozishni to'xtatgandan keyin ishlaydi
 * Qidiruv uchun ideal
 */
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/**
 * Throttle hook — har N millisekunda bir marta ishlaydi
 * Scroll hodisalari uchun ideal
 */
export const useThrottle = (value, limit = 200) => {
  const [throttled, setThrottled] = useState(value)
  const lastRun = useRef(Date.now())
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottled(value)
        lastRun.current = Date.now()
      }
    }, limit - (Date.now() - lastRun.current))
    return () => clearTimeout(handler)
  }, [value, limit])
  return throttled
}

/**
 * Scroll pozitsiyasi hook
 * Navbar uchun isScrolled holatini aniqlaydi
 */
export const useScrollPosition = (threshold = 10) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY,    setScrollY]    = useState(0)

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY
          setScrollY(y)
          setIsScrolled(y > threshold)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { isScrolled, scrollY }
}

/**
 * Clipboard hook
 */
export const useClipboard = (timeout = 2000) => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
      return true
    } catch {
      return false
    }
  }, [timeout])

  return { copy, copied }
}

/**
 * Sahifa ko'rinish vaqti — maqola o'qilishini kuzatish
 * Foydalanuvchi sahifada qancha vaqt o'tkazganini o'lchaydi
 */
export const usePageTime = (onLeave) => {
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    return () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000)
      if (seconds > 3 && onLeave) onLeave(seconds)
    }
  }, [])
}

/**
 * Infinite scroll hook
 * Observer orqali pastga yetganda yangi maqolalar yuklaydi
 */
export const useInfiniteScroll = (callback, { threshold = 300 } = {}) => {
  const observer = useRef(null)

  const ref = useCallback((node) => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback() },
      { rootMargin: `${threshold}px` }
    )

    if (node) observer.current.observe(node)
  }, [callback, threshold])

  return ref
}

/**
 * Media query hook — responsive dizayn uchun
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Qulay qisqartmalar
export const useIsMobile  = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet  = () => useMediaQuery('(max-width: 1024px)')
export const useIsDark    = () => useMediaQuery('(prefers-color-scheme: dark)')
export const useIsTouch   = () => useMediaQuery('(hover: none)')

/**
 * Mahalliy saqlash hook
 */
export const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback((val) => {
    try {
      const toStore = typeof val === 'function' ? val(value) : val
      setValue(toStore)
      localStorage.setItem(key, JSON.stringify(toStore))
    } catch {
      // localStorage to'liq bo'lishi mumkin
    }
  }, [key, value])

  const remove = useCallback(() => {
    setValue(initial)
    localStorage.removeItem(key)
  }, [key, initial])

  return [value, set, remove]
}

/**
 * Tarmoq holati hook
 */
export const useOnline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return isOnline
}
