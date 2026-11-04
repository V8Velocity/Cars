import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth'
import { useRenterBookings } from '@/hooks/useBookings'
import TripCard from './components/TripCard'
import { useFavorites } from '@/hooks/useVehicles'

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

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  
  const { data: upcomingTrips, isLoading: loadingUpcoming } = useRenterBookings('upcoming')
  const { data: pastTrips, isLoading: loadingPast } = useRenterBookings('past')
  const { data: savedVehicles } = useFavorites()

  // Calculate total spent from past completed trips
  const totalSpent = pastTrips?.reduce((acc, trip) => acc + (trip.status === 'Completed' ? trip.total : 0), 0) || 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Driver'}</h1>
        <p className="text-carbon-400 mt-1">Here's what's happening with your DriveShare account.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Upcoming Trips" 
          value={loadingUpcoming ? '...' : (upcomingTrips?.length || 0)} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <MetricCard 
          title="Completed Trips" 
          value={loadingPast ? '...' : (pastTrips?.filter(t => t.status === 'Completed')?.length || 0)} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          title="Total Spent" 
          value={loadingPast ? '...' : `$${totalSpent.toLocaleString()}`} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          title="Saved Vehicles" 
          value={savedVehicles?.length || 0} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
        />
      </div>

      {/* Upcoming Trips Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Next Up</h2>
          {upcomingTrips?.length > 1 && (
             <Link to={ROUTES.TRIPS} className="text-sm text-neon-cyan hover:underline">View all</Link>
          )}
        </div>
        
        {loadingUpcoming ? (
          <div className="h-40 glass rounded-2xl animate-pulse bg-carbon-900" />
        ) : upcomingTrips?.length > 0 ? (
          <TripCard trip={upcomingTrips[0]} />
        ) : (
          <div className="glass rounded-2xl p-8 flex items-center justify-between border-dashed">
            <div>
              <h3 className="text-white font-medium mb-1">No upcoming trips</h3>
              <p className="text-carbon-400 text-sm">Ready for your next adventure?</p>
            </div>
            <Link to={ROUTES.VEHICLES} className="btn-primary text-sm px-6 py-2.5">
              Find a Vehicle
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}
