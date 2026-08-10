/**
 * NEWS CARD — Premium yangilik kartochkasi
 *
 * 3 xil variant:
 * - "default"     : Standart katta karta
 * - "compact"     : Kichik gorizontal karta
 * - "featured"    : Hero uslubida katta karta
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Eye, MessageCircle, Heart } from 'lucide-react'
import {
  timeAgo,
  formatViews,
  truncate,
  getCategoryStyle,
  readTime,
} from '@/utils/helpers.js'

// ─── CATEGORY BADGE ──────────────────────────────────────────
export const CategoryBadge = ({ category, size = 'sm' }) => {
  if (!category) return null
  const style = getCategoryStyle(category.color)
  return (
    <Link
      to={`/category/${category.slug}`}
      onClick={(e) => e.stopPropagation()}
      className={`badge border transition-opacity hover:opacity-80 ${
        size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
      style={style}
    >
      {category.icon && <span>{category.icon}</span>}
      {category.name}
    </Link>
  )
}

// ─── STANDART KARTA ──────────────────────────────────────────
export const NewsCard = ({ article, index = 0, variant = 'default' }) => {
  if (!article) return null

  if (variant === 'compact')  return <CompactCard  article={article} />
  if (variant === 'featured') return <FeaturedCard article={article} />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link to={`/news/${article.slug}`} className="block group">
        <div className="news-card h-full">

          {/* Rasm */}
          <div className="relative overflow-hidden aspect-[16/10]">
            <img
              src={article.coverImage || '/placeholder-news.jpg'}
              alt={article.coverImageAlt || article.title}
              className="w-full h-full object-cover transition-transform duration-500
                         group-hover:scale-105"
              loading="lazy"
            />

            {/* Breaking badge */}
            {article.isBreaking && (
              <div className="absolute top-3 left-3">
                <span className="breaking-pulse bg-red-600 text-white text-[10px]
                                 font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Shoshilinch
                </span>
              </div>
            )}

            {/* O'qish vaqti */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1
                            bg-black/60 backdrop-blur-sm text-white text-[10px]
                            px-2 py-1 rounded-full">
              <Clock className="w-2.5 h-2.5" />
              {readTime(article.readTimeMin)}
            </div>
          </div>

          {/* Kontent */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <CategoryBadge category={article.category} />
              <span className="text-[11px] text-[var(--text-subtle)]">
                {timeAgo(article.publishedAt)}
              </span>
            </div>

            <h3 className="font-semibold text-[var(--text)] text-sm leading-snug
                           line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors"
                style={{ fontFamily: 'Playfair Display, serif' }}>
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                {truncate(article.excerpt, 100)}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(article.viewCount)}
              </span>
              {article._count?.comments > 0 && (
                <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {article._count.comments}
                </span>
              )}
              {article._count?.likes > 0 && (
                <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {article._count.likes}
                </span>
              )}
              <span className="ml-auto text-xs font-medium text-[var(--text-muted)] truncate max-w-[80px]">
                {article.authorName}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── COMPACT KARTA (Trending uchun) ──────────────────────────
export const CompactCard = ({ article, rank }) => (
  <Link to={`/news/${article.slug}`} className="block group">
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg-muted)]
                    transition-all duration-200 border border-transparent
                    hover:border-[var(--border)]">

      {/* Raqam */}
      {rank && (
        <span className="shrink-0 w-6 h-6 flex items-center justify-center
                         text-sm font-black text-[var(--text-subtle)]">
          {rank}
        </span>
      )}

      {/* Kichik rasm */}
      <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden">
        <img
          src={article.coverImage || '/placeholder-news.jpg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300
                     group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Matn */}
      <div className="flex-1 min-w-0">
        <CategoryBadge category={article.category} size="xs" />
        <h4 className="text-sm font-semibold text-[var(--text)] line-clamp-2 mt-1
                       leading-snug group-hover:text-blue-600 transition-colors">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-[var(--text-subtle)] flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" />
            {formatViews(article.viewCount)}
          </span>
          <span className="text-[10px] text-[var(--text-subtle)]">
            {timeAgo(article.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  </Link>
)

// ─── FEATURED (HERO) KARTA ────────────────────────────────────
export const FeaturedCard = ({ article }) => (
  <Link to={`/news/${article.slug}`} className="block group relative">
    <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">

      {/* Fon rasm */}
      <img
        src={article.coverImage || '/placeholder-news.jpg'}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-700
                   group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85
                      via-black/30 to-transparent" />

      {/* Kontent */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={article.category} />
          {article.isBreaking && (
            <span className="breaking-pulse text-white text-[10px] font-bold
                             uppercase tracking-wide">
              Shoshilinch
            </span>
          )}
        </div>

        <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold
                       leading-tight line-clamp-3 mb-3 text-balance
                       group-hover:text-blue-200 transition-colors"
            style={{ fontFamily: 'Playfair Display, serif' }}>
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="text-white/70 text-sm line-clamp-2 max-w-2xl hidden sm:block">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3">
          <span className="text-white/60 text-xs">{article.authorName}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60 text-xs">{timeAgo(article.publishedAt)}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60 text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViews(article.viewCount)}
          </span>
        </div>
      </div>
    </div>
  </Link>
)

export default NewsCard
