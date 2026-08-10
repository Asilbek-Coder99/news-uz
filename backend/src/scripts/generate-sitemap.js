/**
 * SITEMAP GENERATOR
 * Barcha nashr etilgan maqolalar va kategoriyalar uchun sitemap.xml yaratadi
 *
 * Ishlatish: node src/scripts/generate-sitemap.js
 * Yoki cron job orqali kundalik yangilash
 */
import 'dotenv/config'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { prisma } from '../config/database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_URL  = process.env.SITE_URL || 'https://news.uz'

const escape = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')

function url(loc, lastmod, changefreq = 'weekly', priority = '0.5') {
  return `
  <url>
    <loc>${SITE_URL}${escape(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function generateSitemap() {
  console.log('🗺️  Sitemap yaratilmoqda...')

  try {
    await prisma.$connect()

    // Maqolalar va kategoriyalarni yuklash
    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where:   { status: 'PUBLISHED' },
        select:  { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take:    10000,
      }),
      prisma.category.findMany({
        where:  { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ])

    const today = new Date().toISOString()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${url('/',        today,  'hourly',  '1.0')}
  ${url('/search',  today,  'monthly', '0.3')}
  ${categories.map(c =>
    url(`/category/${c.slug}`, c.updatedAt, 'daily', '0.7')
  ).join('')}
  ${articles.map(a =>
    url(`/news/${a.slug}`, a.updatedAt || a.publishedAt, 'weekly', '0.8')
  ).join('')}
</urlset>`

    // Public papkaga yozish
    const outputPath = join(__dirname, '../../../frontend/public/sitemap.xml')
    writeFileSync(outputPath, xml, 'utf-8')

    console.log(`✅ Sitemap yaratildi: ${articles.length} maqola, ${categories.length} kategoriya`)
    console.log(`   Fayl: ${outputPath}`)
  } catch (err) {
    console.error('❌ Sitemap yaratishda xato:', err)
  } finally {
    await prisma.$disconnect()
  }
}

generateSitemap()
