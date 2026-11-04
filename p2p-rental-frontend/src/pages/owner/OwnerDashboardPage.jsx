import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useOwnerVehicles } from '@/hooks/useVehicles'
import { useOwnerBookings } from '@/hooks/useBookings'

function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 text-neon-cyan flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-sm text-carbon-400 uppercase tracking-wider mb-1">{title}</div>
        <div className="font-display text-3xl font-bold text-white">{value}</div>
        {subtitle && <div className="text-xs text-carbon-500 mt-2">{subtitle}</div>}
      </div>
    </div>
  )
}

export default function OwnerDashboardPage() {
  const { data: vehicles, isLoading: loadingVehicles } = useOwnerVehicles()
  const { data: bookings, isLoading: loadingBookings } = useOwnerBookings()

  const activeListings = vehicles?.filter(v => v.status === 'APPROVED')?.length || 0
  const pendingVerification = vehicles?.filter(v => v.status === 'PENDING_VERIFICATION')?.length || 0
  const upcomingBookings = bookings?.filter(b => b.status === 'Pending' || b.status === 'Confirmed')?.length || 0
  
  // Fake some complex metrics that require historical data
  const monthlyEarnings = 2450
  const occupancyRate = 65
  const averageRating = 4.9

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Owner Dashboard</h1>
          <p className="text-carbon-400 mt-1">Manage your fleet and track performance.</p>
        </div>
        <Link to={ROUTES.OWNER_ADD_VEHICLE} className="btn-primary text-sm px-6 py-2.5">
          List a Vehicle
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Monthly Earnings" 
          value={`$${monthlyEarnings.toLocaleString()}`}
          subtitle="+12% from last month"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          title="Upcoming Bookings" 
          value={loadingBookings ? '...' : upcomingBookings}
          subtitle="Next 30 days"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <MetricCard 
          title="Active Listings" 
          value={loadingVehicles ? '...' : activeListings}
          subtitle={`${pendingVerification} pending verification`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <MetricCard 
          title="Occupancy Rate" 
          value={`${occupancyRate}%`}
          subtitle={`Avg rating: ${averageRating} ★`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Recent Bookings</h2>
          {loadingBookings ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.03] animate-pulse rounded-lg" />)}
            </div>
          ) : bookings?.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="text-sm font-medium text-white">{b.vehicle.name}</div>
                    <div className="text-xs text-carbon-400">{b.owner.name} • {b.pickup}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-neon-cyan">${b.total}</div>
                    <div className="text-[10px] text-carbon-400 uppercase">{b.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-carbon-400 text-sm">No recent bookings.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Fleet Status</h2>
          {loadingVehicles ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.03] animate-pulse rounded-lg" />)}
            </div>
          ) : vehicles?.length > 0 ? (
            <div className="space-y-3">
              {vehicles.slice(0, 4).map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <img src={v.image} alt="" className="w-10 h-10 rounded object-cover" />
                    <div>
                      <div className="text-sm font-medium text-white">{v.name}</div>
                      <div className="text-xs text-carbon-400">{v.location}</div>
                    </div>
                  </div>
                  <div className="text-[10px] uppercase font-medium text-carbon-300 bg-white/[0.05] px-2 py-1 rounded">
                    {v.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-carbon-400 text-sm">No vehicles in your fleet yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
