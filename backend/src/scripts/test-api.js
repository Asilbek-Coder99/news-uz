/**
 * API INTEGRATSIYA TEKSHIRUVI
 * Backend ishlaydimi va barcha endpoint'lar javob beradimi?
 *
 * Ishlatish: node src/scripts/test-api.js
 */
import 'dotenv/config'

const BASE = `http://localhost:${process.env.PORT || 5000}`
let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`)
    failed++
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

async function run() {
  console.log('\n🧪 NEWS.UZ API Integratsiya Tekshiruvi')
  console.log('─'.repeat(40))

  // Server
  console.log('\n📡 Server:')
  await test('Health check', () => get('/health'))

  // Auth
  console.log('\n🔐 Auth:')
  let token = null

  const loginRes = await post('/api/auth/login', {
    email: 'admin@news.uz',
    password: 'Admin123!',
  })

  await test('Login', async () => {
    if (!loginRes.success) throw new Error(loginRes.message)
    token = loginRes.data?.accessToken
    if (!token) throw new Error('Token kelmadi')
  })

  // Public API
  console.log('\n📰 Public API:')
  await test('GET /api/news',         () => get('/api/news'))
  await test('GET /api/news/featured', () => get('/api/news/featured'))
  await test('GET /api/news/trending', () => get('/api/news/trending'))
  await test('GET /api/news/breaking', () => get('/api/news/breaking'))
  await test('GET /api/categories',   () => get('/api/categories'))

  // Authenticated API
  if (token) {
    console.log('\n🔑 Authenticated API:')
    const authGet = async (path) => {
      const res = await fetch(`${BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }
    await test('GET /api/auth/me',    () => authGet('/api/auth/me'))
    await test('GET /api/users/stats', () => authGet('/api/users/stats'))
    await test('GET /api/bookmarks',  () => authGet('/api/bookmarks'))
  }

  // Natija
  console.log('\n' + '─'.repeat(40))
  console.log(`📊 Natija: ${passed} muvaffaqiyatli, ${failed} muvaffaqiyatsiz`)
  if (failed === 0) {
    console.log('🎉 Barcha tekshiruvlar o\'tdi!\n')
  } else {
    console.log('⚠️  Ba\'zi tekshiruvlar muvaffaqiyatsiz tugadi\n')
  }
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('\n❌ Server bilan ulanib bo\'lmadi!')
  console.error('   Backend ishga tushirilganmi? npm run dev')
  console.error(`   Xato: ${err.message}\n`)
  process.exit(1)
})
