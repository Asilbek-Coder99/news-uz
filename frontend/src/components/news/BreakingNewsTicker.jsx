/**
 * BREAKING NEWS TICKER — Yuqori chiziq yangilik tasmasi
 */
import { Link } from 'react-router-dom'
import { useBreakingNews } from '@/hooks/useNews.js'
import { AlertTriangle } from 'lucide-react'

export default function BreakingNewsTicker() {
  const { data, isLoading } = useBreakingNews(8)
  const articles = data?.data || []

  if (isLoading || !articles.length) return null

  // Yangilik matnlarini " • " bilan birlashtirish
  const tickerText = articles
    .map((a) => a.title)
    .join('   •   ')

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">

        {/* "Shoshilinch" label */}
        <div className="shrink-0 flex items-center gap-1.5 bg-white/20
                        backdrop-blur-sm px-3 py-1 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Shoshilinch
          </span>
        </div>

        {/* Hаrakat qilayotgan matn */}
        <div className="ticker-wrap flex-1 min-w-0">
          <div className="ticker-move text-sm font-medium whitespace-nowrap">
            {articles.map((article, i) => (
              <span key={article.id}>
                <Link
                  to={`/news/${article.slug}`}
                  className="hover:underline underline-offset-2 transition-all"
                >
                  {article.title}
                </Link>
                {i < articles.length - 1 && (
                  <span className="mx-6 opacity-50">•</span>
                )}
              </span>
            ))}
            {/* Takrorlash uchun ikkinchi nusxa */}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {articles.map((article, i) => (
              <span key={`r-${article.id}`}>
                <Link
                  to={`/news/${article.slug}`}
                  className="hover:underline underline-offset-2"
                >
                  {article.title}
                </Link>
                {i < articles.length - 1 && (
                  <span className="mx-6 opacity-50">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
