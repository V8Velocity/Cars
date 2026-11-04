import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'

const navLinks = [
  { label: 'Browse Cars', to: '/vehicles' },
  { label: 'How It Works', to: '/#how' },
  { label: 'List Your Car', to: '/owner/vehicles/new' },
  { label: 'Reviews', to: '/#reviews' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

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

  const handleNavClick = (to) => {
    setMenuOpen(false)
    // Hash links on the homepage
    if (to.startsWith('/#')) {
      if (window.location.pathname === '/') {
        document.querySelector(to.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/' + to.slice(1))
      }
    } else {
      navigate(to)
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-carbon-950/80 backdrop-blur-2xl border-b border-white/[0.06] py-3'
          : 'bg-transparent py-5'
      }`}
      style={{ willChange: 'transform, background-color' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan flex items-center justify-center group-hover:shadow-lg group-hover:shadow-neon-cyan/30 transition-all duration-200">
            <svg className="w-4 h-4 text-carbon-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            DRIVE<span className="text-neon-cyan">SHARE</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.to)}
              className="text-carbon-400 hover:text-white text-[13px] font-medium tracking-wide transition-colors duration-200 relative group bg-transparent border-none cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <>
              <Link to={ROUTES.DASHBOARD} className="btn-outline text-xs py-2 px-4">
                Dashboard
              </Link>
              <button onClick={logout} className="text-carbon-400 hover:text-white text-xs font-medium transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="btn-outline text-xs py-2 px-4">Sign In</Link>
              <Link to={ROUTES.REGISTER} className="btn-primary text-xs py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
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
        <div id="mobile-menu" className="md:hidden absolute top-full left-0 right-0 bg-carbon-950/95 backdrop-blur-2xl border-b border-white/[0.06] px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.to)}
              className="text-carbon-300 hover:text-white py-2 text-sm font-medium text-left bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            {token ? (
              <>
                <Link to={ROUTES.DASHBOARD} className="btn-outline text-xs py-2 px-4 flex-1 text-center" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="btn-primary text-xs py-2 px-4 flex-1">Sign Out</button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="btn-outline text-xs py-2 px-4 flex-1 text-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to={ROUTES.REGISTER} className="btn-primary text-xs py-2 px-4 flex-1 text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
