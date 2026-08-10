import 'dotenv/config'
import app from './app.js'
import { prisma } from './config/database.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Test DB connection
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(PORT, () => {
      console.log('')
      console.log('═══════════════════════════════════════════')
      console.log('        📰 NEWS.UZ API Server              ')
      console.log('═══════════════════════════════════════════')
      console.log(`  🚀 Running:  http://localhost:${PORT}`)
      console.log(`  📡 API:      http://localhost:${PORT}/api`)
      console.log(`  🌱 ENV:      ${process.env.NODE_ENV}`)
      console.log('═══════════════════════════════════════════')
      console.log('')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
