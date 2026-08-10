/**
 * SITEMAP ROUTE — /sitemap.xml
 * Dinamik sitemap — har so'rovda yangi yaratiladi
 */
import { Router } from 'express'
import { prisma } from '../config/database.js'

const router = Router()

router.get('/sitemap.xml', async (req, res) => {
  try {
    const SITE_URL = process.env.SITE_URL || 'https://news.uz'
    const today    = new Date().toISOString()

    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where:   { status: 'PUBLISHED' },
        select:  { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
        take:    5000,
      }),
      prisma.category.findMany({
        where:  { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ])

    const esc = (s) => s.replace(/[&'"<>]/g, c => ({'&':'&amp;',"'":'&apos;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]))

    const urlTag = (loc, mod, freq, pri) =>
      `<url><loc>${SITE_URL}${esc(loc)}</loc><lastmod>${new Date(mod).toISOString().split('T')[0]}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTag('/', today, 'hourly', '1.0')}
${categories.map(c => urlTag(`/category/${c.slug}`, c.updatedAt, 'daily', '0.7')).join('\n')}
${articles.map(a => urlTag(`/news/${a.slug}`, a.updatedAt, 'weekly', '0.8')).join('\n')}
</urlset>`

    res.set('Content-Type', 'application/xml')
    res.set('Cache-Control', 'public, max-age=3600') // 1 soat kesh
    res.send(xml)
  } catch (err) {
    console.error('Sitemap error:', err)
    res.status(500).send('Sitemap yaratishda xato')
  }
})

export default router
