import { Outlet, NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const sidebarLinks = [
  { label: 'Overview', to: ROUTES.DASHBOARD, end: true },
  { label: 'My Trips', to: ROUTES.TRIPS },
  { label: 'Saved Vehicles', to: ROUTES.SAVED },
  { label: 'Payments', to: '/dashboard/payments' },
  { label: 'KYC Status', to: ROUTES.KYC },
  { label: 'Profile', to: ROUTES.PROFILE },
  { label: 'Settings', to: ROUTES.SETTINGS },
]

export default function DashboardLayout() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <nav className="glass rounded-2xl p-4 space-y-1 md:sticky md:top-24" aria-label="Dashboard navigation">
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
