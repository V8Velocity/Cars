const links = {
  Product: ['Browse Cars', 'List Your Car', 'Insurance', 'Roadside Assist', 'Pricing'],
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
  Support: ['Help Center', 'Safety', 'Community', 'Policies', 'Trust & Safety'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan flex items-center justify-center">
                <svg className="w-4 h-4 text-carbon-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z"/>
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                DRIVE<span className="text-neon-cyan">SHARE</span>
              </span>
            </div>
            <p className="text-carbon-600 text-sm leading-relaxed mb-6 max-w-xs">
              The world's most trusted peer-to-peer car rental marketplace. Connecting drivers with extraordinary vehicles.
            </p>
            <div className="flex gap-2">
              {[
                { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'In', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map((s) => (
                <button
                  key={s.label}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-carbon-500 hover:text-neon-cyan hover:border-neon-cyan/20 transition-all duration-200"
                  title={s.label}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </button>
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
                    <a href="#" className="text-carbon-600 hover:text-white text-sm transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="rounded-xl bg-carbon-900/40 border border-white/[0.04] p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-white text-lg mb-1 tracking-tight">Stay in the loop</h3>
            <p className="text-carbon-500 text-sm">Get the latest cars, deals, and updates delivered to your inbox.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white placeholder-carbon-700 outline-none focus:border-neon-cyan/30 transition-colors text-sm flex-1 md:w-64"
            />
            <button className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap">Subscribe</button>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-carbon-600 text-xs">
          <p>© 2026 DriveShare, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
