# 📰 NEWS.UZ — Premium Uzbek Digital News Platform

> Apple-inspired editorial news platform with full CMS, auth, and admin dashboard.

---

## 🏛️ Architecture

```
news-uz/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # DB, Cloudinary, JWT config
│   │   ├── controllers/       # Route handlers (thin layer)
│   │   ├── middlewares/       # Auth, error, upload, rate-limit
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic (fat layer)
│   │   ├── utils/             # Helpers, slugify, pagination
│   │   ├── validators/        # Zod schemas for request validation
│   │   └── prisma/            # schema.prisma + seed
│   ├── uploads/               # Temp storage before Cloudinary
│   ├── .env
│   └── package.json
│
└── frontend/                   # React 19 + Vite
    └── src/
        ├── assets/            # Static images, icons, fonts
        ├── components/
        │   ├── ui/            # Button, Input, Badge, Card, Modal…
        │   ├── layout/        # Navbar, Footer, Sidebar, Layout
        │   ├── news/          # NewsCard, NewsGrid, HeroNews…
        │   ├── admin/         # AdminSidebar, DataTable, Editor…
        │   ├── common/        # Skeleton, Loader, Empty, Error…
        │   └── animations/    # PageTransition, FadeIn, Reveal…
        ├── pages/
        │   ├── home/          # HomePage
        │   ├── article/       # ArticlePage
        │   ├── category/      # CategoryPage
        │   ├── search/        # SearchPage
        │   ├── auth/          # LoginPage, RegisterPage
        │   ├── profile/       # ProfilePage
        │   └── admin/         # Admin CMS pages
        ├── hooks/             # useNews, useAuth, useTheme…
        ├── store/             # Zustand stores
        ├── services/          # Axios API calls
        ├── utils/             # formatDate, truncate, slugify…
        ├── styles/            # globals.css, theme variables
        └── types/             # TypeScript interfaces
```

---

## 🔑 Clean Architecture Principles

| Layer        | Responsibility                          |
|--------------|------------------------------------------|
| Routes       | Map HTTP verbs → controllers             |
| Controllers  | Validate req → call service → send res   |
| Services     | All business logic, DB queries           |
| Middlewares  | Cross-cutting: auth, errors, uploads     |
| Utils        | Pure helper functions                    |

---

## 🎨 Design System

| Token           | Value                        |
|-----------------|------------------------------|
| Primary font    | Inter (variable)             |
| Display font    | Playfair Display             |
| Radius          | 12px / 16px / 24px           |
| Shadow          | Soft multi-layer             |
| Glass bg        | rgba(255,255,255,0.08)       |
| Blur            | backdrop-blur-xl             |
| Transition      | 300ms cubic-bezier           |

---

## 📡 API Endpoints Summary

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/news               (paginated, filter, search)
GET    /api/news/featured
GET    /api/news/trending
GET    /api/news/:slug
POST   /api/news               (admin)
PUT    /api/news/:id           (admin)
DELETE /api/news/:id           (admin)

GET    /api/categories
POST   /api/categories         (admin)
PUT    /api/categories/:id     (admin)
DELETE /api/categories/:id     (admin)

POST   /api/comments
GET    /api/comments/:newsId
DELETE /api/comments/:id       (admin)

POST   /api/likes/:newsId
POST   /api/bookmarks/:newsId
GET    /api/users/me
GET    /api/users              (admin)
```

---

## ⚙️ Environment Variables

### Backend `.env`
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/newsuz
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=NEWS.UZ
```

---

## 🚀 Steps

- [x] Step 1 — Architecture
- [ ] Step 2 — Backend setup + Database
- [ ] Step 3 — Authentication
- [ ] Step 4 — News CMS API
- [ ] Step 5 — Frontend pages
- [ ] Step 6 — Admin dashboard
- [ ] Step 7 — Connect frontend ↔ backend
- [ ] Step 8 — Optimize + SEO
