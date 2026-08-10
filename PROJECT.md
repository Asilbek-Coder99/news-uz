# 📰 NEWS.UZ — Loyiha Yakuniy Hujjat

## 🎯 Loyiha haqida

**NEWS.UZ** — Apple-inspired premium o'zbek yangiliklar portali.
Full-stack, production-ready, 8 bosqichda qurilgan.

---

## 🗂️ Yakuniy Fayl Tuzilmasi

```
news-uz/                           # Root
├── README.md                      # Arxitektura hujjati
├── SETUP.md                       # O'rnatish qo'llanmasi
├── INTEGRATION.md                 # Ulanish hujjati
├── package.json                   # Root scripts
├── .gitignore
│
├── backend/                       # Node.js + Express API
│   ├── nodemon.json
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js               # Server entry point
│       ├── app.js                 # Express konfiguratsiya
│       ├── config/
│       │   ├── database.js        # Prisma singleton
│       │   ├── cloudinary.js      # Rasm yuklash
│       │   └── jwt.js             # Token yaratish/tekshirish
│       ├── controllers/           # HTTP handler'lar (thin)
│       │   ├── auth.controller.js
│       │   ├── news.controller.js
│       │   ├── category.controller.js
│       │   ├── comment.controller.js
│       │   ├── user.controller.js
│       │   ├── upload.controller.js
│       │   ├── like.controller.js
│       │   └── bookmark.controller.js
│       ├── services/              # Biznes logika (fat)
│       │   ├── auth.service.js
│       │   └── news.service.js
│       ├── middlewares/
│       │   ├── auth.middleware.js     # JWT tekshirish
│       │   ├── error.middleware.js    # Global xato handler
│       │   ├── upload.middleware.js   # Multer konfiguratsiya
│       │   ├── validate.middleware.js # Zod validatsiya
│       │   ├── security.middleware.js # Rate limit, SQL guard
│       │   └── notFound.middleware.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── news.routes.js
│       │   ├── category.routes.js
│       │   ├── comment.routes.js
│       │   ├── user.routes.js
│       │   ├── upload.routes.js
│       │   ├── like.routes.js
│       │   ├── bookmark.routes.js
│       │   └── sitemap.routes.js
│       ├── validators/
│       │   └── schemas.js         # Barcha Zod sxemalari
│       ├── utils/
│       │   ├── AppError.js        # Custom xato + asyncHandler
│       │   ├── response.js        # Standart javob formati
│       │   └── helpers.js         # slugify, pagination, ...
│       ├── prisma/
│       │   ├── schema.prisma      # 10 model, to'liq relations
│       │   └── seed.js            # Demo ma'lumotlar
│       └── scripts/
│           ├── test-api.js        # Integratsiya tekshiruvi
│           └── generate-sitemap.js
│
└── frontend/                      # React 19 + Vite
    ├── index.html
    ├── vite.config.js             # Optimallashtirilgan build
    ├── tailwind.config.js         # Design system
    ├── postcss.config.js
    ├── package.json
    ├── .env.example
    ├── .env.production.example
    └── src/
        ├── main.jsx               # Entry point
        ├── App.jsx                # Routing + providers
        ├── styles/
        │   └── globals.css        # CSS variables + components
        ├── types/
        │   └── index.js           # JSDoc tiplar
        ├── assets/
        ├── store/
        │   ├── authStore.js       # Zustand auth state
        │   └── themeStore.js      # Dark/Light mode
        ├── services/
        │   ├── api.js             # Axios + interceptors
        │   ├── authApi.js         # Auth API funksiyalar
        │   ├── newsApi.js         # News/Category/Comment API
        │   └── index.js           # Markaziy export
        ├── hooks/
        │   ├── useAuth.js         # Login/register/logout
        │   ├── useNews.js         # Maqolalar hook'lari
        │   ├── useCategories.js   # Kategoriyalar
        │   ├── useComments.js     # Izohlar
        │   ├── useUpload.js       # Rasm yuklash
        │   └── usePerformance.js  # Debounce, scroll, ...
        ├── utils/
        │   ├── helpers.js         # timeAgo, formatViews, ...
        │   └── seo.jsx            # SEO komponentlari
        ├── components/
        │   ├── layout/
        │   │   ├── MainLayout.jsx
        │   │   ├── Navbar.jsx     # Glass, dropdown, mobil
        │   │   └── Footer.jsx
        │   ├── news/
        │   │   ├── NewsCard.jsx   # 3 variant: default/compact/featured
        │   │   ├── NewsGrid.jsx   # Grid + Feature layout
        │   │   └── BreakingNewsTicker.jsx
        │   └── common/
        │       ├── Skeleton.jsx       # 6 xil skeleton loader
        │       ├── SectionHeader.jsx
        │       ├── ProtectedRoute.jsx # Role asosida himoya
        │       ├── ErrorBoundary.jsx  # React xato tutish
        │       ├── ApiStatusBanner.jsx# Offline xabar
        │       └── LazyImage.jsx      # Optimallashtirilgan rasm
        └── pages/
            ├── home/
            │   └── HomePage.jsx       # Bosh sahifa
            ├── article/
            │   └── ArticlePage.jsx    # Maqola o'qish
            ├── category/
            │   └── CategoryPage.jsx   # Kategoriya
            ├── search/
            │   └── SearchPage.jsx     # Qidiruv
            ├── auth/
            │   ├── LoginPage.jsx
            │   └── RegisterPage.jsx
            ├── profile/
            │   └── ProfilePage.jsx    # Foydalanuvchi profili
            └── admin/
                ├── AdminLayout.jsx    # Admin sidebar layout
                ├── dashboard/
                │   └── DashboardPage.jsx
                ├── articles/
                │   ├── ArticlesAdminPage.jsx
                │   └── ArticleFormPage.jsx
                ├── categories/
                │   └── CategoriesPage.jsx
                ├── users/
                │   └── UsersPage.jsx
                └── comments/
                    └── CommentsPage.jsx
```

---

## 🔑 Admin hisob

```
URL:      http://localhost:5173/admin
Email:    admin@news.uz
Parol:    Admin123!
```

---

## 📡 API Endpoint'lar

### Auth
| Method | Endpoint | Himoya |
|--------|----------|--------|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| POST | /api/auth/refresh | — |
| POST | /api/auth/logout | JWT |
| GET  | /api/auth/me | JWT |

### News
| Method | Endpoint | Himoya |
|--------|----------|--------|
| GET  | /api/news | — |
| GET  | /api/news/featured | — |
| GET  | /api/news/trending | — |
| GET  | /api/news/breaking | — |
| GET  | /api/news/:slug | — |
| GET  | /api/news/:slug/related | — |
| POST | /api/news | Editor+ |
| PUT  | /api/news/:id | Editor+ |
| DELETE | /api/news/:id | Editor+ |

### Categories, Comments, Users
| Method | Endpoint | Himoya |
|--------|----------|--------|
| GET  | /api/categories | — |
| POST | /api/categories | Admin |
| PUT  | /api/categories/:id | Admin |
| DELETE | /api/categories/:id | Admin |
| GET  | /api/comments/:articleId | — |
| POST | /api/comments | JWT |
| GET  | /api/users | Admin |
| GET  | /api/users/stats | Admin |
| PATCH | /api/users/:id/block | Admin |
| PATCH | /api/users/:id/role | Admin |
| POST | /api/likes/:articleId | JWT |
| POST | /api/bookmarks/:articleId | JWT |
| GET  | /api/bookmarks | JWT |
| POST | /api/upload/image | JWT |

---

## ⚡ Performance Optimizatsiyalar

| Soha | Yechim |
|------|--------|
| Kod bo'linishi | Vite `manualChunks` — 6 ta alohida chunk |
| Kesh | React Query — 5 min stale, 10 min GC |
| Rasmlar | LazyImage — IntersectionObserver, blur placeholder |
| Animatsiyalar | `whileInView` — faqat ko'ringanda ishlaydi |
| DB so'rovlar | Prisma select (faqat kerakli maydonlar) |
| Ko'rishlar | Async increment (javobni kutmaydi) |
| Tokenlar | Access 15min + Refresh 7kun rotation |

---

## 🔒 Xavfsizlik Qatlamlari

```
1. Helmet         → HTTP xavfsizlik headerlari
2. CORS           → Faqat ruxsat etilgan originlar
3. Rate Limiter   → 200 req/15min (auth: 10 req/15min)
4. Zod Validator  → Barcha kirish ma'lumotlari
5. JWT Auth       → Access + Refresh token rotation
6. bcrypt         → 12 tur shifrlash
7. SQL Guard      → Injection pattern tekshiruvi
8. Role Guard     → USER / EDITOR / ADMIN / SUPER_ADMIN
9. Error Handling → Production da stack trace ko'rsatilmaydi
10. asyncHandler  → Try/catch o'rniga
```

---

## 🚀 Ishga Tushirish

```bash
# 1. Klonlash
git clone ... && cd news-uz

# 2. .env fayllarini sozlash
cd backend  && cp .env.example .env  # keyin tahrirlang
cd frontend && cp .env.example .env

# 3. O'rnatish
npm run install:all

# 4. Database
cd backend
npx prisma migrate dev --name init
npm run db:seed

# 5. Ishga tushirish (ikki terminal)
# Terminal 1:
cd backend  && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 6. Tekshirish
cd backend && npm run test:api
```

---

**Yaratuvchi:** NEWS.UZ Development Team
**Versiya:** 1.0.0
**Litsenziya:** MIT
