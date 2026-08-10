/**
 * SECTION HEADER — Bo'lim sarlavhasi
 * "Sport yangiliklari" + "Barchasini ko'rish →" uslubida
 */
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export const SectionHeader = ({
  title,
  categorySlug,
  color,
  showAll = true,
}) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      {/* Rang chizig'i */}
      {color && (
        <div
          className="w-1 h-6 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <h2
        className="section-title text-xl"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        {title}
      </h2>
    </div>

    {showAll && categorySlug && (
      <Link
        to={`/category/${categorySlug}`}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)]
                   hover:text-[var(--text)] transition-colors group"
      >
        Barchasi
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200
                               group-hover:translate-x-1" />
      </Link>
    )}
  </div>
)

export default SectionHeader
