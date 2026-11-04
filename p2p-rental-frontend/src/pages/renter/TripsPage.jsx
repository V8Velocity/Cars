import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useRenterBookings } from '@/hooks/useBookings'
import TripCard from './components/TripCard'

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' | 'past' | 'all'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const { data: trips, isLoading, isError } = useRenterBookings(activeTab)

  // Filter & Sort
  const filteredTrips = trips?.filter(t => 
    t.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.pickup) - new Date(a.pickup)
    if (sortBy === 'date-asc') return new Date(a.pickup) - new Date(b.pickup)
    if (sortBy === 'price-desc') return b.total - a.total
    if (sortBy === 'price-asc') return a.total - b.total
    return 0
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">My Trips</h1>
          <p className="text-carbon-400 mt-1">Manage your upcoming rentals and view past history.</p>
        </div>
        
        <Link to={ROUTES.VEHICLES} className="btn-primary text-sm px-6 py-2.5">
          Book a car
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
        {['upcoming', 'past', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-neon-cyan text-neon-cyan'
                : 'border-transparent text-carbon-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Controls: Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by vehicle or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-carbon-600 outline-none focus:border-neon-cyan/30 text-sm"
          />
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white outline-none focus:border-neon-cyan/30 text-sm min-w-[160px]"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="price-asc">Price: Low to High</option>
        </select>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 glass rounded-2xl animate-pulse bg-carbon-900" />
            ))}
          </div>
        )}

        {isError && (
           <div className="p-8 text-center glass rounded-2xl border-red-500/20">
             <p className="text-red-400">Failed to load trips. Please try again later.</p>
           </div>
        )}

        {!isLoading && !isError && trips?.length === 0 && (
          <div className="py-20 text-center glass rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-medium text-white mb-2">No {activeTab === 'all' ? '' : activeTab} trips found</h3>
            <p className="text-carbon-400 text-sm mb-6 max-w-sm mx-auto">
              When you book a vehicle, it will appear here. Start exploring our fleet.
            </p>
            <Link to={ROUTES.VEHICLES} className="btn-primary text-sm px-6 py-2.5 inline-block">
              Browse Vehicles
            </Link>
          </div>
        )}

        {!isLoading && !isError && filteredTrips?.length > 0 && (
          <div className="space-y-4">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
