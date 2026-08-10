/**
 * MAQOLA SAHIFASI — To'liq o'qish tajribasi
 *
 * - Katta sarlavha va cover rasm
 * - Muallif ma'lumotlari
 * - Like, Bookmark, Share tugmalari
 * - Maqola matni (rich text)
 * - Tag'lar
 * - O'xshash maqolalar
 * - Izohlar bo'limi
 */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Heart, Bookmark, Share2, Eye, Clock,
  MessageCircle, ArrowLeft, Twitter,
  Facebook, Link2, Check, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  useArticle,
  useRelatedArticles,
  useLike,
  useBookmark,
} from '@/hooks/useNews.js'
import { useAuthStore }    from '@/store/authStore.js'
import { commentApi }      from '@/services/newsApi.js'
import { NewsCard }        from '@/components/news/NewsCard.jsx'
import { CategoryBadge }   from '@/components/news/NewsCard.jsx'
import { ArticlePageSkeleton } from '@/components/common/Skeleton.jsx'
import { timeAgo, formatDate, formatViews, copyToClipboard } from '@/utils/helpers.js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── SHARE MENYU ─────────────────────────────────────────────
const ShareMenu = ({ title, slug }) => {
  const [open,    setOpen]    = useState(false)
  const [copied,  setCopied]  = useState(false)
  const url = `${window.location.origin}/news/${slug}`

  const handleCopy = async () => {
    await copyToClipboard(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Havola nusxalandi!')
  }

  const shareItems = [
    {
      icon: Twitter,
      label: 'Twitter',
      color: 'hover:text-sky-500',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      icon: Facebook,
      label: 'Facebook',
      color: 'hover:text-blue-600',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                   bg-[var(--bg-muted)] hover:bg-[var(--border)]
                   text-[var(--text-muted)] hover:text-[var(--text)]
                   transition-all text-sm font-medium"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:block">Ulashish</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{   opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-44 z-20
                         glass rounded-xl shadow-[var(--shadow-lg)]
                         border border-[var(--border)] py-1.5 overflow-hidden"
            >
              {shareItems.map(({ icon: Icon, label, color, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm
                             text-[var(--text-muted)] ${color}
                             hover:bg-[var(--bg-muted)] transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </a>
              ))}
              <button
                onClick={handleCopy}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                           text-[var(--text-muted)] hover:text-green-500
                           hover:bg-[var(--bg-muted)] transition-colors"
              >
                {copied
                  ? <><Check className="w-4 h-4 text-green-500" /> Nusxalandi!</>
                  : <><Link2 className="w-4 h-4" /> Havolani nusxalash</>
                }
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── IZOHLAR ─────────────────────────────────────────────────
const CommentsSection = ({ articleId }) => {
  const [newComment, setNewComment] = useState('')
  const queryClient = useQueryClient()
  const { user, accessToken } = useAuthStore()

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn:  () => commentApi.getForArticle(articleId),
    select:   (d) => d.data,
  })

  const createMutation = useMutation({
    mutationFn: () => commentApi.create({ content: newComment, articleId }),
    onSuccess: () => {
      toast.success('Izoh yuborildi — moderatsiyadan o\'tgach ko\'rinadi')
      setNewComment('')
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] })
    },
    onError: () => toast.error('Izoh yuborishda xato'),
  })

  const comments = commentsData || []

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border)]">
      <h3 className="text-xl font-bold text-[var(--text)] mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Playfair Display, serif' }}>
        <MessageCircle className="w-5 h-5 text-blue-500" />
        Izohlar {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Izoh yozish formasi */}
      {accessToken ? (
        <div className="mb-8 p-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center
                            justify-center text-white text-sm font-bold shrink-0">
              {user?.fullName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Fikringizni yozing..."
                rows={3}
                className="input-base resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!newComment.trim() || createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700
                             disabled:opacity-50 text-white text-sm font-semibold
                             rounded-lg transition-colors active:scale-[0.98]"
                >
                  {createMutation.isPending ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)]
                        text-center">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Izoh yozish uchun tizimga kiring
          </p>
          <Link
            to="/login"
            className="inline-flex px-4 py-2 bg-blue-600 text-white
                       text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kirish
          </Link>
        </div>
      )}

      {/* Izohlar ro'yxati */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10">
          <MessageCircle className="w-10 h-10 text-[var(--text-subtle)] mx-auto mb-2" />
          <p className="text-[var(--text-muted)] text-sm">
            Hali izoh yo'q. Birinchi bo'ling!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400
                              to-purple-500 flex items-center justify-center
                              text-white text-sm font-bold shrink-0">
                {comment.user?.fullName?.[0] || comment.user?.username?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-[var(--text)]">
                    {comment.user?.fullName || comment.user?.username}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)]">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {comment.content}
                </p>

                {/* Javoblar */}
                {comment.replies?.length > 0 && (
                  <div className="mt-3 ml-3 pl-3 border-l-2 border-[var(--border)] space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400
                                        to-teal-500 flex items-center justify-center
                                        text-white text-xs font-bold shrink-0">
                          {reply.user?.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-[var(--text)]">
                              {reply.user?.fullName || reply.user?.username}
                            </span>
                            <span className="text-[10px] text-[var(--text-subtle)]">
                              {timeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── ASOSIY SAHIFA ───────────────────────────────────────────
export default function ArticlePage() {
  const { slug }     = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuthStore()

  const { data: article, isLoading, isError } = useArticle(slug)
  const { data: related = [] }                = useRelatedArticles(slug)

  const likeMutation     = useLike(article?.id)
  const bookmarkMutation = useBookmark(article?.id)

  // Sahifa yuqorisiga qaytish
  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (isLoading) return <ArticlePageSkeleton />

  if (isError || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">😔</p>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Maqola topilmadi</h1>
        <p className="text-[var(--text-muted)] mb-6">
          Bu maqola mavjud emas yoki o'chirilgan bo'lishi mumkin.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold
                     hover:bg-blue-700 transition-colors"
        >
          Orqaga
        </button>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{article.title} — NEWS.UZ</title>
        <meta name="description" content={article.excerpt || article.title} />
        {article.coverImage && <meta property="og:image" content={article.coverImage} />}
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* ── Asosiy kontent ── */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2"
          >
            {/* Orqaga tugma */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)]
                         hover:text-[var(--text)] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>

            {/* Kategoriya + sana */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <CategoryBadge category={article.category} />
              {article.isBreaking && (
                <span className="breaking-pulse text-red-600 text-xs font-bold uppercase">
                  Shoshilinch
                </span>
              )}
              <span className="text-sm text-[var(--text-muted)]">
                {formatDate(article.publishedAt)}
              </span>
            </div>

            {/* Sarlavha */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text)]
                         leading-tight mb-5 text-balance"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {article.title}
            </h1>

            {/* Muallif + statistika */}
            <div className="flex items-center justify-between gap-4 py-4
                            border-y border-[var(--border)] mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500
                                to-indigo-600 flex items-center justify-center
                                text-white font-bold text-sm">
                  {article.authorName?.[0] || 'N'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {article.authorName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {timeAgo(article.publishedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTimeMin} daqiqa
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {formatViews(article.viewCount)}
                </span>
              </div>
            </div>

            {/* Cover rasm */}
            {article.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-8">
                <img
                  src={article.coverImage}
                  alt={article.coverImageAlt || article.title}
                  className="w-full object-cover max-h-[500px]"
                />
                {article.coverImageAlt && (
                  <p className="text-xs text-[var(--text-subtle)] text-center mt-2 px-2">
                    {article.coverImageAlt}
                  </p>
                )}
              </div>
            )}

            {/* Qisqacha */}
            {article.excerpt && (
              <p className="text-lg text-[var(--text-muted)] leading-relaxed
                            mb-6 font-medium border-l-4 border-blue-500 pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Asosiy matn */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tag'lar */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[var(--border)]">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/search?tag=${tag.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-muted)]
                               border border-[var(--border)] text-xs font-medium
                               text-[var(--text-muted)] hover:text-[var(--text)]
                               hover:border-[var(--text-subtle)] transition-all"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Amallar (Like, Bookmark, Share) */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[var(--border)]">
              {/* Like */}
              <button
                onClick={() => {
                  if (!user) { toast.error('Like bosish uchun kiring'); return }
                  likeMutation.mutate()
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl
                           transition-all text-sm font-medium
                           ${article.isLiked
                             ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30'
                             : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                           }`}
              >
                <Heart className={`w-4 h-4 ${article.isLiked ? 'fill-current' : ''}`} />
                <span>{article._count?.likes || 0}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => {
                  if (!user) { toast.error('Saqlash uchun kiring'); return }
                  bookmarkMutation.mutate()
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl
                           transition-all text-sm font-medium
                           ${article.isBookmarked
                             ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 border border-blue-200 dark:border-blue-900/30'
                             : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-blue-500'
                           }`}
              >
                <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
                <span className="hidden sm:block">
                  {article.isBookmarked ? 'Saqlangan' : 'Saqlash'}
                </span>
              </button>

              <div className="ml-auto">
                <ShareMenu title={article.title} slug={article.slug} />
              </div>
            </div>

            {/* Izohlar */}
            <CommentsSection articleId={article.id} />
          </motion.article>

          {/* ── O'ng sidebar ── */}
          <aside className="space-y-6">

            {/* O'xshash maqolalar */}
            {related.length > 0 && (
              <div>
                <h3 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                  🔗 O'xshash maqolalar
                </h3>
                <div className="space-y-3">
                  {related.map((item, i) => (
                    <NewsCard
                      key={item.id}
                      article={item}
                      variant="compact"
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Kategoriya haqida */}
            {article.category && (
              <div className="news-card p-4">
                <p className="text-xs text-[var(--text-subtle)] uppercase tracking-wider mb-2">
                  Kategoriya
                </p>
                <Link
                  to={`/category/${article.category.slug}`}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <span className="text-2xl">{article.category.icon}</span>
                  <div>
                    <p className="font-bold text-[var(--text)]">{article.category.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Barcha {article.category.name} yangiliklar
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
