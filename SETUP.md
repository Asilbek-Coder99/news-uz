# 🚀 NEWS.UZ — Loyihani Ishga Tushirish Qo'llanmasi

## Talablar
- Node.js 18+
- PostgreSQL 15+
- npm yoki yarn
- Cloudinary hisobi (bepul)

---

## ⚙️ 1. Environment fayllarini sozlash

### Backend `.env` yaratish:
```bash
cd backend
cp .env.example .env
```

`.env` ni tahrirlang:
```env
DATABASE_URL="postgresql://postgres:PAROLINGIZ@localhost:5432/newsuz"
JWT_SECRET=kamida_32_ta_belgi_yozing_bu_yerga
JWT_REFRESH_SECRET=boshqa_32_ta_belgi_yozing_bu_yerga
CLOUDINARY_CLOUD_NAME=sizning_cloud_name
CLOUDINARY_API_KEY=sizning_api_key
CLOUDINARY_API_SECRET=sizning_api_secret
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Frontend `.env` yaratish:
```bash
cd frontend
cp .env.example .env
```

---

## 🗄️ 2. PostgreSQL ma'lumotlar bazasini yaratish

```sql
-- PostgreSQL ga kiring va:
CREATE DATABASE newsuz;
```

---

## 📦 3. Backend o'rnatish va ishga tushirish

```bash
cd backend

# Paketlarni o'rnatish
npm install

# Prisma schema ni DB ga ulash
npx prisma generate
npx prisma migrate dev --name init

# Dastlabki ma'lumotlarni yuklash (kategoriyalar, admin)
npm run db:seed

# Serverni ishga tushirish
npm run dev
```

Backend muvaffaqiyatli ishga tushsa:
```
✅ Database connected
🚀 Running:  http://localhost:5000
📡 API:      http://localhost:5000/api
```

---

## 🎨 4. Frontend o'rnatish va ishga tushirish

```bash
cd frontend

# Paketlarni o'rnatish
npm install

# Ishga tushirish
npm run dev
```

Frontend muvaffaqiyatli ishga tushsa:
```
  VITE v5.x.x  ready

  ➜  Local:   http://localhost:5173
```

---

## 🔑 5. Admin hisobiga kirish

Brauzerda: `http://localhost:5173/login`

```
Email:    admin@news.uz
Parol:    Admin123!
```

Admin panel: `http://localhost:5173/admin`

---

## 🌐 6. API tekshirish

```bash
# Sog'liq tekshiruvi
curl http://localhost:5000/health

# Kategoriyalar
curl http://localhost:5000/api/categories

# Maqolalar
curl http://localhost:5000/api/news
```

---

## 📁 Loyiha tuzilmasi (yakuniy)

```
news-uz/
├── backend/
│   ├── src/
│   │   ├── config/           ← DB, JWT, Cloudinary
│   │   ├── controllers/      ← HTTP handler'lar
│   │   ├── middlewares/      ← Auth, error, upload
│   │   ├── routes/           ← API marshrutlar
│   │   ├── services/         ← Biznes logika
│   │   ├── utils/            ← Yordamchilar
│   │   ├── validators/       ← Zod sxemalar
│   │   ├── prisma/           ← Schema + seed
│   │   ├── app.js            ← Express sozlamalari
│   │   └── index.js          ← Server
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/       ← Navbar, Footer, MainLayout
    │   │   ├── news/         ← NewsCard, NewsGrid, Ticker
    │   │   └── common/       ← Skeleton, SectionHeader
    │   ├── pages/
    │   │   ├── home/         ← HomePage
    │   │   ├── article/      ← ArticlePage
    │   │   ├── category/     ← CategoryPage
    │   │   ├── search/       ← SearchPage
    │   │   ├── auth/         ← Login, Register
    │   │   ├── profile/      ← ProfilePage
    │   │   └── admin/        ← Dashboard, Articles, Users...
    │   ├── hooks/            ← useAuth, useNews
    │   ├── services/         ← api.js, authApi, newsApi
    │   ├── store/            ← authStore, themeStore
    │   ├── utils/            ← helpers.js
    │   └── styles/           ← globals.css
    └── .env
```

---

## 🐛 Ko'p uchraydigan xatolar

### "Cannot connect to database"
```bash
# PostgreSQL ishlaydimi?
sudo service postgresql status
# yoki
pg_ctl status
```

### "Prisma migration failed"
```bash
npx prisma migrate reset  # Ehtiyotkor: barcha ma'lumot o'chadi!
npx prisma migrate dev --name init
npm run db:seed
```

### "CORS error"
`.env` da `CLIENT_URL` to'g'ri ekanligini tekshiring:
```env
CLIENT_URL=http://localhost:5173
```

### "JWT error"
`JWT_SECRET` kamida 32 ta belgi bo'lishi kerak.

---

## 🏗️ Production uchun

```bash
# Frontend build
cd frontend && npm run build

# Backend production mode
cd backend
NODE_ENV=production npm start
```

---

## 📊 Qo'shimcha: Prisma Studio (DB ko'rish)
```bash
cd backend
npx prisma studio
# http://localhost:5555 da ochiladi
```
