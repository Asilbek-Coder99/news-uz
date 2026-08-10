/**
 * RO'YXATDAN O'TISH SAHIFASI
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Loader2, Newspaper, AtSign } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.js'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Ism kamida 2 ta belgi'),
  username: z
    .string()
    .min(3, 'Username kamida 3 ta belgi')
    .max(30, "Ko'pi bilan 30 ta belgi")
    .regex(/^[a-z0-9_]+$/, 'Faqat kichik harf, raqam va _ belgisi'),
  email:    z.string().email("To'g'ri email kiriting"),
  password: z
    .string()
    .min(8, 'Kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Kamida 1 ta katta harf')
    .regex(/[0-9]/, 'Kamida 1 ta raqam'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Parollar mos kelmadi',
  path:    ['confirmPassword'],
})

// Parol kuchi ko'rsatkichi
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)      score++
  if (/[A-Z]/.test(password))    score++
  if (/[0-9]/.test(password))    score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const map = {
    0: { label: '',        color: '' },
    1: { label: 'Zaif',   color: 'bg-red-500' },
    2: { label: "O'rtacha", color: 'bg-orange-400' },
    3: { label: 'Yaxshi',  color: 'bg-yellow-400' },
    4: { label: 'Kuchli',  color: 'bg-green-500' },
  }
  return { score, ...map[score] }
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, isRegistering } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const passwordValue = watch('password', '')
  const strength      = getPasswordStrength(passwordValue)

  const onSubmit = ({ confirmPassword, ...data }) => registerUser(data)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12">

      {/* Fon */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        <div className="news-card p-8 sm:p-10">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[var(--text)]"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                NEWS<span className="text-blue-500">.UZ</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-1">
              Hisob yaratish
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Yangiliklar olamiga qo'shiling
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* To'liq ism */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                To'liq ism
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type="text"
                  placeholder="Abdullayev Abdulla"
                  className="input-base pl-10"
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type="text"
                  placeholder="abdullayev_a"
                  className="input-base pl-10"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="input-base pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Parol */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kamida 8 ta belgi"
                  className="input-base pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Parol kuchi */}
              {passwordValue && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-[var(--border)]'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Parol kuchi: <span className="font-medium">{strength.label}</span>
                    </p>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Parolni tasdiqlash */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type="password"
                  placeholder="Parolni qayta kiriting"
                  className="input-base pl-10"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Ro'yxatdan o'tish tugmasi */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                         text-white font-semibold rounded-xl transition-all duration-200
                         flex items-center justify-center gap-2 mt-2
                         shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                         active:scale-[0.98]"
            >
              {isRegistering ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Ro'yxatdan o'tilmoqda...</>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </form>

          {/* Kirish havolasi */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Hisob bormi?{' '}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
              >
                Kirish
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
