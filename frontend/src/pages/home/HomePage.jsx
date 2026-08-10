/**
 * BOSH SAHIFA — Premium yangiliklar portali
 *
 * Tarkib:
 * 1. Breaking news ticker
 * 2. Hero (featured) yangiliklar
 * 3. So'nggi yangiliklar grid
 * 4. Kategoriya bo'limlari (Sport, Dunyo, Texnologiya)
 * 5. Trending sidebar
 * 6. Ko'p o'qilganlar
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { HelmetProvider, Helmet } from 'react-helmet-async'

import BreakingNewsTicker            from '@/components/news/BreakingNewsTicker.jsx'
import { FeaturedCard, NewsCard }     from '@/components/news/NewsCard.jsx'
import { NewsGrid, NewsFeatureGrid }  from '@/components/news/NewsGrid.jsx'
import { SectionHeader }             from '@/components/common/SectionHeader.jsx'
import { CompactCard, CategoryBadge } from '@/components/news/NewsCard.jsx'
import {
  FeaturedCardSkeleton,
  NewsGridSkeleton,
  TrendingSkeleton,
} from '@/components/common/Skeleton.jsx'

import {
  useFeaturedArticles,
  useArticles,
  useTrendingArticles,
} from '@/hooks/useNews.js'

import { newsApi } from '@/services/newsApi.js'

// Kategoriya bo'limi
const CategorySection = ({ name, slug, color, icon }) => {
  const { data, isLoading } = useArticles({
    category: slug,
    limit: 3,
    status: 'PUBLISHED',
  })
  const articles = data?.data || []

  return (
    <section>
      <SectionHeader
        title={`${icon} ${name}`}
        categorySlug={slug}
        color={color}
      />
      <NewsGrid
        articles={articles}
        isLoading={isLoading}
        cols="3"
        skeletonCount={3}
        emptyText={`${name} yangiliklari topilmadi`}
      />
    </section>
  )
}

// Trending sidebar
const TrendingSection = () => {
  const { data, isLoading } = useTrendingArticles(8)
  const articles = data?.data || []

  return (
    <div className="news-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-[var(--border)]">
        <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
          🔥 <span>Trendda</span>
        </h3>
      </div>

      {isLoading ? (
        <TrendingSkeleton count={6} />
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {articles.map((article, i) => (
            <CompactCard key={article.id} article={article} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// Ko'p o'qilganlar
const MostReadSection = () => {
  const { data, isLoading } = useArticles({
    sort: '-viewCount',
    limit: 5,
    status: 'PUBLISHED',
  })
  const articles = data?.data || []

  return (
    <section>
      <SectionHeader title="📊 Ko'p o'qilganlar" showAll={false} />
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((article, i) => (
            <CompactCard key={article.id} article={article} rank={i + 1} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── ASOSIY SAHIFA ───────────────────────────────────────────
export default function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedArticles(5)
  const { data: latestData,   isLoading: latestLoading }   = useArticles({
    limit: 6,
    status: 'PUBLISHED',
    sort: '-publishedAt',
  })

  const featured = featuredData?.data || []
  const latest   = latestData?.data   || []

  const categorySections = [
    { name: "O'zbekiston", slug: 'uzbekistan', color: '#1D6FA4', icon: '🇺🇿' },
    { name: 'Dunyo',       slug: 'world',      color: '#2563EB', icon: '🌍' },
    { name: 'Sport',       slug: 'sport',      color: '#DC2626', icon: '⚽' },
    { name: 'Texnologiya', slug: 'technology', color: '#7C3AED', icon: '💻' },
    { name: 'Iqtisodiyot', slug: 'economy',    color: '#059669', icon: '📈' },
  ]

  return (
    <>
      <Helmet>
        <title>NEWS.UZ — O'zbekiston va Dunyo Yangiliklari</title>
        <meta name="description" content="O'zbekiston, dunyo, sport, texnologiya yangiliklari" />
      </Helmet>

      {/* Breaking news tasmasi */}
      <BreakingNewsTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">

        {/* ── HERO ── */}
        <section>
          {featuredLoading ? (
            <FeaturedCardSkeleton />
          ) : featured.length > 0 ? (
            <NewsFeatureGrid articles={featured} />
          ) : null}
        </section>

        {/* ── ASOSIY KONTENT + SIDEBAR ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Chap — so'nggi yangiliklar */}
          <div className="xl:col-span-2 space-y-12">

            {/* So'nggi yangiliklar */}
            <section>
              <SectionHeader title="🕐 So'nggi Yangiliklar" showAll={false} />
              <NewsGrid
                articles={latest}
                isLoading={latestLoading}
                cols="2"
                skeletonCount={6}
              />
            </section>

            {/* Kategoriya bo'limlari */}
            {categorySections.map((cat) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4 }}
              >
                <CategorySection {...cat} />
              </motion.div>
            ))}
          </div>

          {/* O'ng — sidebar */}
          <div className="space-y-8">
            <TrendingSection />
            <MostReadSection />

            {/* Newsletter */}
            <NewsletterWidget />
          </div>
        </div>
      </div>
    </>
  )
}

// Newsletter widget
function NewsletterWidget() {
  return (
    <div className="news-card p-5 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
      <h3 className="font-bold text-white text-lg mb-1"
          style={{ fontFamily: 'Playfair Display, serif' }}>
        Yangiliklar obunasi
      </h3>
      <p className="text-blue-100 text-sm mb-4">
        Har kuni eng muhim yangiliklar sizning emailingizga
      </p>
      <div className="space-y-2">
        <input
          type="email"
          placeholder="Email manzilingiz"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/15
                     text-white placeholder:text-blue-200 border border-white/20
                     focus:outline-none focus:border-white/40 transition-colors"
        />
        <button className="w-full py-2.5 rounded-xl bg-white text-blue-600
                           font-semibold text-sm hover:bg-blue-50 transition-colors
                           active:scale-[0.98]">
          Obuna bo'lish
        </button>
      </div>
    </div>
  )
}
