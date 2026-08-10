/**
 * SEO YORDAMCHI — Har sahifa uchun meta teglar
 *
 * react-helmet-async bilan ishlaydi
 */
import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'NEWS.UZ'
const SITE_URL  = import.meta.env.VITE_SITE_URL || 'https://news.uz'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`
const DEFAULT_DESC  = "O'zbekiston va dunyo yangiliklari — ishonchli, tez va professional"

/**
 * Asosiy SEO komponenti
 */
export const SEO = ({
  title,
  description = DEFAULT_DESC,
  image       = DEFAULT_IMAGE,
  url,
  type        = 'website',
  publishedAt,
  author,
  keywords    = [],
  noindex     = false,
}) => {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL
  const fullImage = image?.startsWith('http') ? image : `${SITE_URL}${image}`

  return (
    <Helmet>
      {/* Asosiy */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={fullImage} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:type"        content={type} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="uz_UZ" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={fullImage} />

      {/* Maqola uchun */}
      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Til */}
      <html lang="uz" />
    </Helmet>
  )
}

/**
 * Maqola uchun maxsus SEO
 */
export const ArticleSEO = ({ article }) => {
  if (!article) return null

  return (
    <SEO
      title={article.title}
      description={article.excerpt || article.title}
      image={article.coverImage}
      url={`/news/${article.slug}`}
      type="article"
      publishedAt={article.publishedAt}
      author={article.authorName}
      keywords={[
        article.category?.name,
        ...(article.tags?.map(t => t.name) || []),
        "yangilik", "o'zbekiston",
      ].filter(Boolean)}
    />
  )
}

/**
 * Kategoriya uchun SEO
 */
export const CategorySEO = ({ category }) => {
  if (!category) return null

  return (
    <SEO
      title={`${category.name} yangiliklari`}
      description={`${category.name} bo'yicha so'nggi yangiliklar — ${SITE_NAME}`}
      url={`/category/${category.slug}`}
      keywords={[category.name, 'yangilik', "o'zbekiston"]}
    />
  )
}

/**
 * Qidiruv uchun SEO
 */
export const SearchSEO = ({ query }) => (
  <SEO
    title={query ? `"${query}" — Qidiruv` : 'Qidiruv'}
    description={`${query ? `"${query}" bo'yicha` : 'Barcha'} yangiliklar qidiruvi`}
    url={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
    noindex={!!query} // Qidiruv sahifalarini indekslamaslik
  />
)
