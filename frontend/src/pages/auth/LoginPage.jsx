/**
 * LOGIN SAHIFASI
 * Apple-inspired minimal va premium dizayn
 */
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, Newspaper } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth.js'

// Zod validatsiya sxemasi
const loginSchema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(1, 'Parol majburiy'),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggingIn } = useAuth()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = (data) => login(data)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">

      {/* Fon dekoratsiyasi */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        {/* Karta */}
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
              Xush kelibsiz
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Hisobingizga kiring
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type="email"
                  autoComplete="email"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Kirish tugmasi */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                         text-white font-semibold rounded-xl transition-all duration-200
                         flex items-center justify-center gap-2 mt-2
                         shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]
                         active:scale-[0.98]"
            >
              {isLoggingIn ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Kirilmoqda...</>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          {/* Ro'yxatdan o'tish havolasi */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Hisob yo'qmi?{' '}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
              >
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>


        </div>

        {/* Orqaga */}
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
