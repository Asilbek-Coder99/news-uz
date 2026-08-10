/**
 * NEWS GRID — Maqolalar panjara ko'rinishi
 */
import { NewsCard } from './NewsCard.jsx'
import { NewsGridSkeleton } from '@/components/common/Skeleton.jsx'
import { AlertCircle, Newspaper } from 'lucide-react'

// Bo'sh holat
const Empty = ({ message = 'Maqolalar topilmadi' }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)]
                    flex items-center justify-center mb-4">
      <Newspaper className="w-7 h-7 text-[var(--text-subtle)]" />
    </div>
    <p className="text-[var(--text-muted)] font-medium text-center">{message}</p>
  </div>
)

// Xato holat
const ErrorState = ({ message = "Yuklashda xato yuz berdi" }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border
                    border-red-100 dark:border-red-900/30 flex items-center
                    justify-center mb-4">
      <AlertCircle className="w-7 h-7 text-red-400" />
    </div>
    <p className="text-[var(--text-muted)] font-medium text-center">{message}</p>
  </div>
)

/**
 * Asosiy NewsGrid komponenti
 *
 * @param {Array}   articles    - Maqolalar massivi
 * @param {boolean} isLoading   - Yuklanish holati
 * @param {boolean} isError     - Xato holati
 * @param {string}  cols        - Grid ustunlari: "2" | "3" | "4"
 * @param {string}  emptyText   - Bo'sh holat matni
 */
export const NewsGrid = ({
  articles = [],
  isLoading = false,
  isError   = false,
  cols      = '3',
  emptyText = 'Maqolalar topilmadi',
  skeletonCount = 6,
}) => {

  const colsMap = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  if (isLoading) {
    return <NewsGridSkeleton count={skeletonCount} />
  }

  if (isError) {
    return <ErrorState />
  }

  if (!articles.length) {
    return <Empty message={emptyText} />
  }

  return (
    <div className={`grid ${colsMap[cols] || colsMap['3']} gap-5`}>
      {articles.map((article, i) => (
        <NewsCard key={article.id} article={article} index={i} />
      ))}
    </div>
  )
}

/**
 * 1 ta katta + 2 ta kichik layout (bosh sahifa uchun)
 */
export const NewsFeatureGrid = ({ articles = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="skeleton aspect-[16/10] rounded-2xl" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="news-card p-4 space-y-2">
              <div className="skeleton h-28 rounded-xl" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const [main, ...rest] = articles

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Katta asosiy karta */}
      {main && (
        <div className="lg:col-span-2">
          <NewsCard article={main} variant="featured" index={0} />
        </div>
      )}

      {/* 2 ta kichik karta */}
      <div className="space-y-4">
        {rest.slice(0, 2).map((article, i) => (
          <NewsCard key={article.id} article={article} index={i + 1} />
        ))}
      </div>
    </div>
  )
}

export default NewsGrid
