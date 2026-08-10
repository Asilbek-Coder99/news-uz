/**
 * ERROR BOUNDARY
 * React xatolarini tutib, chiroyli xato sahifasini ko'rsatadi
 */
import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center
                        bg-[var(--bg)] px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}>
              Kutilmagan xato yuz berdi
            </h1>
            <p className="text-[var(--text-muted)] mb-6 text-sm">
              Sahifani yangilang yoki bosh sahifaga qayting.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl
                           font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Yangilash
              </button>
              <a
                href="/"
                className="px-5 py-2.5 border border-[var(--border)]
                           text-[var(--text)] rounded-xl font-semibold text-sm
                           hover:bg-[var(--bg-muted)] transition-colors"
              >
                Bosh sahifa
              </a>
            </div>
            {import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-[var(--text-subtle)] cursor-pointer">
                  Xato tafsilotlari (dev)
                </summary>
                <pre className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20
                                p-3 rounded-xl overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
