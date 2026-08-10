/**
 * AUTH SERVICE — Autentifikatsiya biznes logikasi
 *
 * Controller'lar bu service'ni chaqiradi.
 * Barcha DB amaliyotlari va token yaratish shu yerda bo'ladi.
 */

import bcrypt from 'bcryptjs'
import { prisma } from '../config/database.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getExpiryMs,
} from '../config/jwt.js'
import { AppError } from '../utils/AppError.js'

// ─── YORDAMCHI FUNKSIYALAR ───────────────────────────────────

/**
 * Foydalanuvchi ma'lumotlarini tozalash (passwordHash ni chiqarmaslik)
 */
const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user
  return safeUser
}

/**
 * Access + Refresh token juftini yaratish
 */
const generateTokens = (user) => {
  const payload = {
    id:       user.id,
    email:    user.email,
    username: user.username,
    role:     user.role,
  }

  const accessToken  = signAccessToken(payload)
  const refreshToken = signRefreshToken({ id: user.id })

  return { accessToken, refreshToken }
}

/**
 * Refresh tokenni DB ga saqlash
 */
const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date(
    Date.now() + getExpiryMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  )

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  })
}

// ─── ASOSIY FUNKSIYALAR ──────────────────────────────────────

/**
 * Ro'yxatdan o'tish
 * @param {Object} data - { email, username, fullName, password }
 */
export const registerUser = async ({ email, username, fullName, password }) => {

  // 1. Email yoki username allaqachon borligini tekshirish
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email:    { equals: email,    mode: 'insensitive' } },
        { username: { equals: username, mode: 'insensitive' } },
      ],
    },
  })

  if (existing) {
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      throw new AppError('Bu email allaqachon ro\'yxatdan o\'tgan', 409)
    }
    throw new AppError('Bu username band', 409)
  }

  // 2. Parolni shifrlash (bcrypt, 12 tur)
  const passwordHash = await bcrypt.hash(password, 12)

  // 3. Foydalanuvchi yaratish
  const user = await prisma.user.create({
    data: {
      email:        email.toLowerCase().trim(),
      username:     username.toLowerCase().trim(),
      fullName:     fullName?.trim(),
      passwordHash,
      role:         'USER',
      isActive:     true,
    },
  })

  // 4. Tokenlar yaratish
  const { accessToken, refreshToken } = generateTokens(user)
  await saveRefreshToken(user.id, refreshToken)

  return {
    user:         sanitizeUser(user),
    accessToken,
    refreshToken,
  }
}

/**
 * Tizimga kirish
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {

  // 1. Foydalanuvchini topish
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  // 2. Xato xabar uchun umumiy xato (email yoki parol noto'g'ri)
  //    Xavfsizlik uchun "email topilmadi" demaymiz
  if (!user) {
    throw new AppError('Email yoki parol noto\'g\'ri', 401)
  }

  // 3. Hisob bloklangan?
  if (!user.isActive) {
    throw new AppError('Hisobingiz bloklangan. Admin bilan bog\'laning', 403)
  }

  // 4. Parolni tekshirish
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw new AppError('Email yoki parol noto\'g\'ri', 401)
  }

  // 5. Tokenlar yaratish
  const { accessToken, refreshToken } = generateTokens(user)
  await saveRefreshToken(user.id, refreshToken)

  // 6. Oxirgi kirish vaqtini yangilash
  await prisma.user.update({
    where: { id: user.id },
    data:  { lastLoginAt: new Date() },
  })

  return {
    user:         sanitizeUser(user),
    accessToken,
    refreshToken,
  }
}

/**
 * Refresh token orqali yangi access token olish
 * @param {string} token - Refresh token
 */
export const refreshAccessToken = async (token) => {

  // 1. Token to'g'riligini tekshirish
  let decoded
  try {
    decoded = verifyRefreshToken(token)
  } catch {
    throw new AppError('Noto\'g\'ri yoki muddati o\'tgan refresh token', 401)
  }

  // 2. Tokenni DB da qidirish
  const savedToken = await prisma.refreshToken.findUnique({
    where:   { token },
    include: { user: true },
  })

  if (!savedToken) {
    throw new AppError('Token topilmadi yoki bekor qilingan', 401)
  }

  // 3. Muddati o'tganmi?
  if (savedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: savedToken.id } })
    throw new AppError('Refresh token muddati tugagan. Qayta kiring', 401)
  }

  // 4. Foydalanuvchi aktiv?
  if (!savedToken.user.isActive) {
    throw new AppError('Hisob bloklangan', 403)
  }

  // 5. Eski tokenni o'chirib yangi token yaratish (Rotation)
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(savedToken.user)

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: savedToken.id } }),
    prisma.refreshToken.create({
      data: {
        token:     newRefreshToken,
        userId:    savedToken.userId,
        expiresAt: new Date(Date.now() + getExpiryMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d')),
      },
    }),
  ])

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user:         sanitizeUser(savedToken.user),
  }
}

/**
 * Tizimdan chiqish — refresh tokenni o'chirish
 * @param {string} token - Refresh token
 * @param {string} userId
 */
export const logoutUser = async (token, userId) => {
  // Agar token yuborilgan bo'lsa, uni o'chirish
  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token, userId },
    })
  } else {
    // Token yo'q bo'lsa, barcha tokenlarni o'chirish
    await prisma.refreshToken.deleteMany({ where: { userId } })
  }
}

/**
 * Eski/muddati o'tgan tokenlarni tozalash (cron job uchun)
 */
export const cleanExpiredTokens = async () => {
  const result = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  return result.count
}
