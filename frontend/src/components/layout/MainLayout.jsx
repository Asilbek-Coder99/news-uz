/**
 * MAIN LAYOUT
 * Barcha ommaviy sahifalar uchun asosiy qolip:
 * Navbar + sahifa kontenti + Footer
 */
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar />
      <main className="flex-1 pt-[var(--nav-height)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
