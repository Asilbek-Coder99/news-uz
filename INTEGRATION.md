# 7-QADAM: Frontend ↔ Backend Ulanish

## Ulanish arxitekturasi

```
Browser (localhost:5173)
       │
       ▼
  React App (Vite)
       │
       │  Axios (api.js)
       │  Authorization: Bearer <token>
       │
       ▼
  Express API (localhost:5000)
       │
       │  Prisma ORM
       │
       ▼
  PostgreSQL (localhost:5432/newsuz)
       │
       │  Cloudinary SDK
       │
       ▼
  Cloudinary (cloud images)
```

---

## Qanday ulanadi?

### 1. Axios instance (api.js)
```js
// Har so'rovga token qo'shiladi
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 bo'lsa token yangilanadi
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    // refresh token → yangi access token
  }
})
```

### 2. Vite Proxy (development)
```js
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```

### 3. CORS (backend)
```js
// app.js
cors({ origin: ['http://localhost:5173'], credentials: true })
```

---

## Ko'p uchraydigan ulanish xatolari

| Xato | Sabab | Yechim |
|------|-------|--------|
| `Network Error` | Backend ishlamayapti | `cd backend && npm run dev` |
| `401 Unauthorized` | Token yo'q/eskirgan | Qayta login qiling |
| `403 Forbidden` | Role yetarli emas | Admin hisobi kerak |
| `CORS error` | Origin ruxsati yo'q | `.env` da `CLIENT_URL` ni tekshiring |
| `404 Not Found` | Route noto'g'ri | API yo'lini tekshiring |
| `422 Validation` | Ma'lumot noto'g'ri | Zod schema xabarini o'qing |

---

## API Tekshiruvi

```bash
# Backend ishlaydimi?
curl http://localhost:5000/health

# Kategoriyalar keladimi?
curl http://localhost:5000/api/categories | json_pp

# Login ishlayapti?
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@news.uz","password":"Admin123!"}'

# Integratsiya tekshiruvi
cd backend && node src/scripts/test-api.js
```

---

## Frontend-Backend ma'lumot oqimi

### Maqola yaratish misoli:
```
Admin forma → react-hook-form → onSubmit()
    → useMutation(newsApi.create)
        → api.post('/news', data)
            → Express POST /api/news
                → validate middleware (Zod)
                → authenticate middleware (JWT)
                → requireEditor middleware (role)
                → news.controller.js → createArticle()
                    → news.service.js
                        → generateUniqueSlug()
                        → calculateReadTime()
                        → prisma.article.create()
                    → createdResponse(res, article)
        ← { success: true, data: article }
    ← useMutation onSuccess
→ toast.success('Maqola yaratildi!')
→ navigate('/admin/articles/id')
→ queryClient.invalidateQueries(['news'])
```
