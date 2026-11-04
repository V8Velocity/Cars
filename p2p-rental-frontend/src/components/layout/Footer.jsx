const links = {
  Product: ['Browse Cars', 'List Your Car', 'Insurance', 'Roadside Assist', 'Pricing'],
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
  Support: ['Help Center', 'Safety', 'Community', 'Policies', 'Trust & Safety'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'],
}

const socials = [
  {
    label: 'Follow DriveShare on X',
    href: '#',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Follow DriveShare on LinkedIn',
    href: '#',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'Follow DriveShare on Instagram',
    href: '#',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] pt-16 pb-10 px-6" aria-label="Site footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 md:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan flex items-center justify-center" aria-hidden="true">
                <svg className="w-4 h-4 text-carbon-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z"/>
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                DRIVE<span className="text-neon-cyan">SHARE</span>
              </span>
            </div>
            <p className="text-carbon-500 text-sm leading-relaxed mb-6 max-w-xs">
              The world&apos;s most trusted peer-to-peer car rental marketplace. Connecting drivers with extraordinary vehicles.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-carbon-500 hover:text-neon-cyan hover:border-neon-cyan/20 transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-medium text-xs mb-4 uppercase tracking-[0.2em]">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-carbon-500 hover:text-white text-sm transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <form
          className="rounded-xl bg-carbon-900/40 border border-white/[0.04] p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Newsletter signup"
        >
          <div>
            <h3 className="font-display font-bold text-white text-lg mb-1 tracking-tight">Stay in the loop</h3>
            <p className="text-carbon-400 text-sm">Get the latest cars, deals, and updates delivered to your inbox.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                required
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white placeholder-carbon-600 outline-none focus:border-neon-cyan/30 transition-colors text-sm w-full"
              />
            </div>
            <button type="submit" className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap">Subscribe</button>
          </div>
        </form>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-carbon-500 text-xs">
          <p>&copy; 2026 DriveShare, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
