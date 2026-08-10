/**
 * LAZY IMAGE — Optimallashtirilgan rasm komponenti
 *
 * - Progressive loading (blur → sharp)
 * - Intersection Observer (viewport ga kirganda yuklash)
 * - Xato holat uchun fallback
 * - WebP format qo'llab-quvvatlash
 */
import { useState, useRef, useEffect } from 'react'

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9'%3E%3Crect width='16' height='9' fill='%23e2e8f0'/%3E%3C/svg%3E"

export const LazyImage = ({
  src,
  alt = '',
  className = '',
  aspectRatio = '16/9',
  fallback = PLACEHOLDER,
  priority = false,    // LCP uchun eager yuklash
  objectFit = 'cover',
  onLoad,
  ...props
}) => {
  const [isLoaded,  setIsLoaded]  = useState(false)
  const [hasError,  setHasError]  = useState(false)
  const [isVisible, setIsVisible] = useState(priority)
  const imgRef  = useRef(null)
  const wrapRef = useRef(null)

  // Intersection Observer — viewport ga kirganda yuklash
  useEffect(() => {
    if (priority || isVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // 200px oldin yuklashni boshlash
    )

    if (wrapRef.current) observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  const imgSrc = hasError ? fallback : (isVisible ? src : PLACEHOLDER)

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-[var(--bg-muted)] ${className}`}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Asosiy rasm */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full transition-opacity duration-500
                   ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit }}
        {...props}
      />

      {/* Xato holat */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        bg-[var(--bg-muted)] text-[var(--text-subtle)]">
          <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Rasm yuklanmadi</span>
        </div>
      )}
    </div>
  )
}

export default LazyImage
