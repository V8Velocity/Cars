import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, buildPath } from '@/constants/routes'
import BookingStatusBadge from '@/components/ui/BookingStatusBadge'
import BookingTimeline from './BookingTimeline'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TripCard({ trip }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/[0.04] transition-colors hover:border-white/[0.08]">
      {/* ── Summary Row (Always visible) ── */}
      <div 
        className="p-5 flex flex-col md:flex-row gap-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Image */}
        <div className="w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden flex-shrink-0 relative">
          <img src={trip.vehicle.image} alt={trip.vehicle.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 md:hidden">
             <BookingStatusBadge status={trip.status} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-bold text-white truncate">{trip.vehicle.name}</h3>
              <div className="hidden md:block">
                <BookingStatusBadge status={trip.status} />
              </div>
            </div>
            <p className="text-sm text-carbon-400 mb-3">{trip.vehicle.location}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-0.5">Dates</span>
              <span className="text-white font-medium">{formatDate(trip.pickup)} – {formatDate(trip.return)}</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-0.5">Total</span>
              <span className="text-white font-medium">${trip.total}</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-0.5">Host</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-carbon-800 flex items-center justify-center text-[10px] text-white">
                  {trip.owner.name.charAt(0)}
                </div>
                <span className="text-white font-medium truncate">{trip.owner.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Toggle */}
        <div className="hidden md:flex items-center justify-center pl-4 border-l border-white/[0.06]">
          <button className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center text-carbon-400 hover:text-white transition-colors">
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div className="p-5 border-t border-white/[0.06] bg-carbon-950/30 animate-in slide-in-from-top-4 duration-300">
          
          <div className="mb-8">
            <h4 className="text-xs text-carbon-400 uppercase tracking-wider mb-4">Booking Timeline</h4>
            <BookingTimeline status={trip.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs text-carbon-400 uppercase tracking-wider">Booking Info</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-carbon-500">Booking ID</span>
                  <span className="text-white font-mono">{trip.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-500">Booked On</span>
                  <span className="text-white">{formatDate(trip.bookingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-500">Payment</span>
                  <span className={`font-medium ${trip.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {trip.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h4 className="text-xs text-carbon-400 uppercase tracking-wider">Actions & Policies</h4>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <Link to={buildPath(ROUTES.VEHICLE_DETAIL, { id: trip.vehicleId })} className="btn-secondary text-xs px-4 py-2">
                  View Vehicle
                </Link>
                <button className="btn-secondary text-xs px-4 py-2 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Message Host
                </button>
                {['Pending', 'Confirmed'].includes(trip.status) && (
                  <button className="btn-secondary text-xs px-4 py-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/20">
                    Cancel Trip
                  </button>
                )}
                {['Returned'].includes(trip.status) && (
                   <button className="btn-primary text-xs px-4 py-2">
                     Leave Review
                   </button>
                )}
              </div>

              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-1">Cancellation Policy</span>
                <p className="text-xs text-carbon-300">{trip.cancellationPolicy}</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
