import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Browse Cars', href: '#cars' },
  { label: 'How It Works', href: '#how' },
  { label: 'List Your Car', href: '#list' },
  { label: 'Reviews', href: '#reviews' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-carbon-950/80 backdrop-blur-2xl border-b border-white/[0.06] py-3'
          : 'bg-transparent py-5'
      }`}
      style={{ willChange: 'transform, background-color' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan flex items-center justify-center group-hover:shadow-lg group-hover:shadow-neon-cyan/30 transition-all duration-200">
            <svg className="w-4 h-4 text-carbon-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            DRIVE<span className="text-neon-cyan">SHARE</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-carbon-400 hover:text-white text-[13px] font-medium tracking-wide transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button className="btn-outline text-xs py-2 px-4">Sign In</button>
          <button className="btn-primary text-xs py-2 px-4">
            List Your Car
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-carbon-950/95 backdrop-blur-2xl border-b border-white/[0.06] px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-carbon-300 hover:text-white py-2 text-sm font-medium">
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button className="btn-outline text-xs py-2 px-4 flex-1">Sign In</button>
            <button className="btn-primary text-xs py-2 px-4 flex-1">List Your Car</button>
          </div>
        </div>
      )}
    </nav>
  )
}
