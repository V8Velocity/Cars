import { Outlet, NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const sidebarLinks = [
  { label: 'Overview', to: ROUTES.OWNER, end: true },
  { label: 'My Vehicles', to: ROUTES.OWNER_VEHICLES },
  { label: 'Bookings', to: ROUTES.OWNER_BOOKINGS },
  { label: 'Calendar', to: ROUTES.OWNER_CALENDAR },
  { label: 'Earnings', to: ROUTES.OWNER_EARNINGS },
  { label: 'Verification', to: ROUTES.OWNER_VERIFICATION },
]

export default function OwnerLayout() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <nav className="glass rounded-2xl p-4 space-y-1 md:sticky md:top-24" aria-label="Owner navigation">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neon-cyan/10 text-neon-cyan'
                      : 'text-carbon-400 hover:text-white hover:bg-white/[0.03]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-white/[0.04]">
              <NavLink
                to={ROUTES.OWNER_ADD_VEHICLE}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium bg-neon-cyan/[0.08] text-neon-cyan hover:bg-neon-cyan/15 transition-colors text-center"
              >
                + List New Vehicle
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
