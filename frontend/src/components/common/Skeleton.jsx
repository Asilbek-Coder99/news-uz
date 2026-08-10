/**
 * SKELETON LOADERLAR
 * Kontent yuklanayotganda ko'rsatiladigan animatsiyali placeholder'lar
 */

// Asosiy skeleton elementi
const Sk = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
)

// Yangilik kartasi skeleton
export const NewsCardSkeleton = () => (
  <div className="news-card overflow-hidden">
    <Sk className="aspect-[16/10] rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Sk className="h-5 w-20 rounded-full" />
        <Sk className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-3/4" />
      </div>
      <div className="space-y-1.5">
        <Sk className="h-3 w-full" />
        <Sk className="h-3 w-5/6" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
        <Sk className="h-3 w-12" />
        <Sk className="h-3 w-12" />
        <Sk className="h-3 w-20 ml-auto" />
      </div>
    </div>
  </div>
)

// Compact karta skeleton (trending uchun)
export const CompactCardSkeleton = () => (
  <div className="flex items-start gap-3 p-3">
    <Sk className="shrink-0 w-16 h-16 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Sk className="h-4 w-16 rounded-full" />
      <Sk className="h-3.5 w-full" />
      <Sk className="h-3.5 w-4/5" />
      <div className="flex gap-2">
        <Sk className="h-2.5 w-10" />
        <Sk className="h-2.5 w-14" />
      </div>
    </div>
  </div>
)

// Hero karta skeleton
export const FeaturedCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden">
    <Sk className="w-full aspect-[16/9] md:aspect-[21/9] rounded-none" />
  </div>
)

// Maqola sahifasi skeleton
export const ArticlePageSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    {/* Kategoriya + sana */}
    <div className="flex items-center gap-3 mb-4">
      <Sk className="h-6 w-24 rounded-full" />
      <Sk className="h-4 w-28" />
    </div>

    {/* Sarlavha */}
    <div className="space-y-3 mb-6">
      <Sk className="h-8 w-full" />
      <Sk className="h-8 w-5/6" />
      <Sk className="h-8 w-4/6" />
    </div>

    {/* Muallif */}
    <div className="flex items-center gap-3 mb-6">
      <Sk className="w-10 h-10 rounded-full" />
      <div className="space-y-1.5">
        <Sk className="h-4 w-28" />
        <Sk className="h-3 w-20" />
      </div>
    </div>

    {/* Cover rasm */}
    <Sk className="w-full aspect-video rounded-2xl mb-8" />

    {/* Matn */}
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Sk key={i} className={`h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  </div>
)

// Grid skeleton (N ta karta)
export const NewsGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <NewsCardSkeleton key={i} />
    ))}
  </div>
)

// Sidebar trending skeleton
export const TrendingSkeleton = ({ count = 5 }) => (
  <div className="divide-y divide-[var(--border)]">
    {Array.from({ length: count }).map((_, i) => (
      <CompactCardSkeleton key={i} />
    ))}
  </div>
)
