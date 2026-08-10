import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path  from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages':      path.resolve(__dirname, './src/pages'),
      '@hooks':      path.resolve(__dirname, './src/hooks'),
      '@store':      path.resolve(__dirname, './src/store'),
      '@services':   path.resolve(__dirname, './src/services'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@assets':     path.resolve(__dirname, './src/assets'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api':     { target: 'http://localhost:5000', changeOrigin: true },
      '/health':  { target: 'http://localhost:5000', changeOrigin: true },
    },
  },

  build: {
    outDir:    'dist',
    sourcemap: mode === 'development',
    minify:    'esbuild',
    target:    'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react'
          if (id.includes('framer-motion'))      return 'vendor-animations'
          if (id.includes('@tanstack') || id.includes('zustand') || id.includes('axios')) return 'vendor-data'
          if (id.includes('react-hook-form') || id.includes('zod')) return 'vendor-forms'
          if (id.includes('lucide-react'))       return 'vendor-icons'
          if (id.includes('date-fns'))           return 'vendor-utils'
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react','react-dom','react-router-dom','framer-motion','@tanstack/react-query','zustand','axios','lucide-react'],
  },
}))
