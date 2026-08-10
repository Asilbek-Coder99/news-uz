/**
 * FOOTER — Premium editorial dizayn
 */
import { Link } from 'react-router-dom'
import { Newspaper, Twitter, Instagram, Youtube, Send } from 'lucide-react'

const footerLinks = {
  "Kategoriyalar": [
    { label: "O'zbekiston", href: '/category/uzbekistan' },
    { label: 'Dunyo',       href: '/category/world' },
    { label: 'Sport',       href: '/category/sport' },
    { label: 'Texnologiya', href: '/category/technology' },
    { label: 'Iqtisodiyot', href: '/category/economy' },
  ],
  "Kompaniya": [
    { label: 'Biz haqimizda', href: '/about' },
    { label: 'Muharrirlarga', href: '/editorial' },
    { label: 'Reklama',       href: '/advertise' },
    { label: 'Aloqa',         href: '/contact' },
  ],
  "Yordam": [
    { label: 'Shartlar',       href: '/terms' },
    { label: 'Maxfiylik',      href: '/privacy' },
    { label: 'Cookie sozlama', href: '/cookies' },
  ],
}

const socials = [
  { icon: Twitter,   href: 'https://twitter.com',   label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube,   href: 'https://youtube.com',   label: 'YouTube' },
  { icon: Send,      href: 'https://t.me',          label: 'Telegram' },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-muted)] border-t border-[var(--border)] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                              justify-center shadow-md">
                <Newspaper className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text)]"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                NEWS<span className="text-blue-500">.UZ</span>
              </span>
            </Link>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs mb-5">
              O'zbekiston va dunyo yangiliklari — ishonchli, tez va professional.
              Har kuni eng muhim voqealar siz uchun.
            </p>

            {/* Ijtimoiy tarmoqlar */}
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg
                             bg-[var(--bg-card)] border border-[var(--border)]
                             text-[var(--text-muted)] hover:text-blue-500
                             hover:border-blue-300 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Havolalar */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]
                                 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pastki qism */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-subtle)]">
            © {new Date().getFullYear()} NEWS.UZ. Barcha huquqlar himoyalangan.
          </p>
          <p className="text-xs text-[var(--text-subtle)]">
            O'zbekistonda ishlab chiqilgan 🇺🇿
          </p>
        </div>
      </div>
    </footer>
  )
}
