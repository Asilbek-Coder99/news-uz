import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

// Routes
import authRoutes       from './routes/auth.routes.js'
import newsRoutes       from './routes/news.routes.js'
import categoryRoutes   from './routes/category.routes.js'
import commentRoutes    from './routes/comment.routes.js'
import userRoutes       from './routes/user.routes.js'
import uploadRoutes     from './routes/upload.routes.js'
import likeRoutes       from './routes/like.routes.js'
import bookmarkRoutes   from './routes/bookmark.routes.js'

// Middlewares
import { errorHandler } from './middlewares/error.middleware.js'
import { notFound }     from './middlewares/notFound.middleware.js'

const app = express()

// ─── SECURITY ────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))

// ─── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── RATE LIMITING ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
})

app.use('/api/', limiter)
app.use('/api/auth/', authLimiter)

// ─── BODY PARSING ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── LOGGING ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NEWS.UZ API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// ─── API ROUTES ──────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/news',      newsRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/comments',  commentRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/upload',    uploadRoutes)
app.use('/api/likes',     likeRoutes)
app.use('/api/bookmarks', bookmarkRoutes)

// ─── 404 & ERROR HANDLERS ────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app

// Sitemap (alohida qo'shamiz)
// import sitemapRoute from './routes/sitemap.routes.js'
// app.use('/', sitemapRoute)
