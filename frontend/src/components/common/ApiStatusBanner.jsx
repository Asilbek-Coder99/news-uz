/**
 * API HOLAT BANNERI
 * Backend bilan ulanish yo'q bo'lganda foydalanuvchiga xabar beradi
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, X, RefreshCw } from 'lucide-react'
import api from '@/services/api.js'

export default function ApiStatusBanner() {
  const [isOffline,  setIsOffline]  = useState(false)
  const [dismissed,  setDismissed]  = useState(false)
  const [checking,   setChecking]   = useState(false)

  const checkConnection = async () => {
    setChecking(true)
    try {
      // Brauzer online/offline
      if (!navigator.onLine) {
        setIsOffline(true)
        return
      }
      // Backend ping
      await api.get('/../../health', { timeout: 3000 })
      setIsOffline(false)
      setDismissed(false)
    } catch {
      setIsOffline(true)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    // Sahifa yuklanganda tekshirish (faqat dev mode da)
    if (import.meta.env.DEV) {
      const timer = setTimeout(checkConnection, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Brauzer online/offline hodisalari
    const handleOffline = () => setIsOffline(true)
    const handleOnline  = () => checkConnection()
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  if (!isOffline || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white
                   px-4 py-2.5 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {!navigator.onLine
              ? 'Internet ulanishi yo\'q'
              : 'Server bilan ulanib bo\'lmaydi'
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkConnection}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20
                       hover:bg-white/30 rounded-lg text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            Qayta urinish
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
