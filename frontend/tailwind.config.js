/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── FONTS ────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },

      // ─── COLORS ───────────────────────────────────────────
      colors: {
        // Brand
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // News accent
        accent: {
          red:    '#EF4444',
          orange: '#F97316',
          amber:  '#F59E0B',
          green:  '#10B981',
          blue:   '#3B82F6',
          purple: '#8B5CF6',
          pink:   '#EC4899',
        },
        // Neutral surface
        surface: {
          light: '#FFFFFF',
          muted: '#F8FAFC',
          border: '#E2E8F0',
          dark:   '#0F172A',
          'dark-muted': '#1E293B',
          'dark-border': '#334155',
        },
        // Breaking news red
        breaking: '#DC2626',
      },

      // ─── SPACING & SIZES ──────────────────────────────────
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },

      // ─── BORDER RADIUS ────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ─── BOX SHADOW ───────────────────────────────────────
      boxShadow: {
        'card':      '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 12px -2px rgb(0 0 0 / 0.08)',
        'card-hover':'0 4px 6px -1px rgb(0 0 0 / 0.07), 0 12px 24px -4px rgb(0 0 0 / 0.12)',
        'glass':     '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'premium':   '0 20px 60px -12px rgba(0,0,0,0.25)',
        'glow':      '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-red':  '0 0 20px rgba(239, 68, 68, 0.3)',
      },

      // ─── BACKDROP BLUR ────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ─── ANIMATIONS ───────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ticker': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'fade-up':         'fade-up 0.4s ease forwards',
        'fade-in':         'fade-in 0.3s ease forwards',
        'slide-in-right':  'slide-in-right 0.3s ease forwards',
        'pulse-dot':       'pulse-dot 1.5s ease-in-out infinite',
        shimmer:           'shimmer 1.8s linear infinite',
        ticker:            'ticker 25s linear infinite',
      },

      // ─── SCREENS ──────────────────────────────────────────
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
