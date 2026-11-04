import { useState } from 'react'
import { useOwnerBookings } from '@/hooks/useBookings'
import BookingStatusBadge from '@/components/ui/BookingStatusBadge'

export default function OwnerBookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const { data: bookings, isLoading } = useOwnerBookings()

  const displayBookings = bookings?.filter(b => {
    if (activeTab === 'upcoming') return ['Pending', 'Confirmed', 'Handover'].includes(b.status)
    if (activeTab === 'active') return b.status === 'Active'
    if (activeTab === 'completed') return ['Completed', 'Returned'].includes(b.status)
    return true // 'all'
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Booking Management</h1>
        <p className="text-carbon-400 mt-1">Review requests, coordinate handovers, and track active rentals.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
        {['upcoming', 'active', 'completed', 'all'].map((tab) => (
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

      <div className="space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 glass rounded-2xl animate-pulse bg-carbon-900" />)}
          </div>
        )}

        {!isLoading && displayBookings?.length === 0 && (
          <div className="py-20 text-center glass rounded-2xl border-dashed">
             <p className="text-carbon-400">No {activeTab === 'all' ? '' : activeTab} bookings found.</p>
          </div>
        )}

        {!isLoading && displayBookings?.map(b => (
          <div key={b.id} className="glass rounded-2xl p-5 flex flex-col md:flex-row gap-6 border border-white/[0.04]">
            
            {/* Renter Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center font-bold">
                     {b.owner.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-white font-medium">{b.owner.name}</h3>
                     <p className="text-xs text-carbon-400">Renter</p>
                   </div>
                </div>
                <BookingStatusBadge status={b.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-carbon-500 block text-xs mb-1">Vehicle</span>
                  <span className="text-white">{b.vehicle.name}</span>
                </div>
                <div>
                  <span className="text-carbon-500 block text-xs mb-1">Dates</span>
                  <span className="text-white">{b.pickup} – {b.return}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="md:w-48 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
              <div className="text-center mb-2">
                <span className="text-carbon-500 block text-[10px] uppercase">Payout</span>
                <span className="text-xl font-bold text-white">${b.total}</span>
              </div>
              
              {b.status === 'Pending' && (
                <>
                  <button className="btn-primary py-2 text-xs w-full bg-green-500 hover:bg-green-600 text-white shadow-none">Accept</button>
                  <button className="btn-secondary py-2 text-xs w-full text-red-400 hover:bg-red-500/10">Decline</button>
                </>
              )}
              {b.status === 'Confirmed' && (
                <button className="btn-primary py-2 text-xs w-full">Start Handover</button>
              )}
              {b.status === 'Active' && (
                <button className="btn-primary py-2 text-xs w-full">Complete Return</button>
              )}
              <button className="btn-secondary py-2 text-xs w-full flex items-center justify-center gap-2">
                Message Renter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
