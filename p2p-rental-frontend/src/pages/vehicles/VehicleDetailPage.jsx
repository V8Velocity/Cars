import { useParams, Link, useNavigate } from 'react-router-dom'
import { useVehicle } from '@/hooks/useVehicles'
import { useAuthStore } from '@/store/auth'
import VehicleGallery from './components/VehicleGallery'
import VehicleHeader from './components/VehicleHeader'
import VehicleSpecs from './components/VehicleSpecs'
import OwnerCard from './components/OwnerCard'
import VehicleReviews from './components/VehicleReviews'
import BookingCard from './components/BookingCard'
import AvailabilityCalendar from './components/AvailabilityCalendar'
import PriceBreakdown from './components/PriceBreakdown'
import { useState, useMemo } from 'react'

function DetailSkeleton() {
  return (
    <div className="min-h-screen pt-20 px-6">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="aspect-[16/10] rounded-2xl bg-carbon-900 animate-pulse" />
            <div className="flex gap-2">{[1,2,3,4].map(i => <div key={i} className="w-20 h-14 rounded-lg bg-carbon-900 animate-pulse" />)}</div>
            <div className="space-y-3">
              <div className="h-4 w-24 bg-carbon-900 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-carbon-900 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-carbon-900 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-xl bg-carbon-900 animate-pulse" />)}</div>
          </div>
          <div className="hidden lg:block w-[380px]">
            <div className="h-[500px] rounded-2xl bg-carbon-900 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailError() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Vehicle not found</h2>
        <p className="text-carbon-400 text-sm mb-6">This listing may have been removed or the link is incorrect.</p>
        <Link to="/vehicles" className="btn-primary text-sm px-6 py-2.5">Browse Vehicles</Link>
      </div>
    </div>
  )
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { data: vehicle, isLoading, isError } = useVehicle(id)

  // Mobile calendar state (shared with BookingCard via this page)
  const [mobilePickup, setMobilePickup] = useState('')
  const [mobileReturn, setMobileReturn] = useState('')

  if (isLoading) return <DetailSkeleton />
  if (isError || !vehicle) return <DetailError />

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-carbon-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/vehicles" className="hover:text-white transition-colors">Vehicles</Link>
          <span aria-hidden="true">/</span>
          <span className="text-carbon-300">{vehicle.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left: Vehicle information ── */}
          <div className="flex-1 min-w-0 space-y-8">
            <VehicleGallery images={vehicle.images} name={vehicle.name} />
            <VehicleHeader vehicle={vehicle} />
            <VehicleSpecs vehicle={vehicle} />

            {/* Mobile calendar section */}
            <div className="lg:hidden" id="mobile-calendar">
              <h2 className="font-display font-bold text-white text-lg tracking-tight mb-4">Select Dates</h2>
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-0.5">Pickup</div>
                    <div className={`text-sm ${mobilePickup ? 'text-white font-medium' : 'text-carbon-600'}`}>
                      {mobilePickup || 'Select date'}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-0.5">Return</div>
                    <div className={`text-sm ${mobileReturn ? 'text-white font-medium' : 'text-carbon-600'}`}>
                      {mobileReturn || 'Select date'}
                    </div>
                  </div>
                </div>
                <AvailabilityCalendar
                  pickup={mobilePickup}
                  returnDate={mobileReturn}
                  unavailableDates={vehicle.unavailableDates || []}
                  onDateChange={({ pickup: p, return: r }) => {
                    setMobilePickup(p)
                    setMobileReturn(r)
                  }}
                />
                <MobilePriceSection vehicle={vehicle} pickup={mobilePickup} returnDate={mobileReturn} />
              </div>
            </div>

            <OwnerCard owner={vehicle.owner} />
            <VehicleReviews reviews={vehicle.reviews} rating={vehicle.rating} />
          </div>

          {/* ── Right: Booking card (desktop only) ── */}
          <div className="hidden lg:block w-[380px] flex-shrink-0">
            <BookingCard vehicle={vehicle} />
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <MobileBottomBar vehicle={vehicle} pickup={mobilePickup} returnDate={mobileReturn} />
    </div>
  )
}

// ── Mobile helper components ─────────────────────────────

function MobilePriceSection({ vehicle, pickup, returnDate }) {
  const days = useMemo(() => {
    if (!pickup || !returnDate) return 0
    return Math.max(0, Math.ceil((new Date(returnDate) - new Date(pickup)) / (1000 * 60 * 60 * 24)))
  }, [pickup, returnDate])

  if (!days) return null

  return (
    <div className="pt-4 border-t border-white/[0.04]">
      <PriceBreakdown pricing={vehicle.pricing} days={days} />
    </div>
  )
}

function MobileBottomBar({ vehicle, pickup, returnDate }) {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  const days = useMemo(() => {
    if (!pickup || !returnDate) return 0
    return Math.max(0, Math.ceil((new Date(returnDate) - new Date(pickup)) / (1000 * 60 * 60 * 24)))
  }, [pickup, returnDate])

  const total = useMemo(() => {
    if (!days || !vehicle.pricing) return 0
    const sub = vehicle.pricing.perDay * days
    return sub + Math.round(sub * vehicle.pricing.platformFeeRate) + Math.round(sub * vehicle.pricing.taxRate)
  }, [days, vehicle.pricing])

  const handleBooking = () => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/vehicles/${vehicle.id}` } } })
      return
    }
    alert(`Booking confirmed!\n\nVehicle: ${vehicle.name}\nPickup: ${pickup}\nReturn: ${returnDate}\nDays: ${days}\nTotal: $${total}\n\n(Mock — no payment processed)`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div>
          <span className="font-display text-xl font-bold text-white tracking-tight">${vehicle.pricing?.perDay}</span>
          <span className="text-carbon-500 text-xs">/day</span>
          {days > 0 && (
            <span className="text-carbon-400 text-xs ml-2">
              · {days}d = <span className="text-neon-cyan font-semibold">${total}</span>
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (!days) {
              document.getElementById('mobile-calendar')?.scrollIntoView({ behavior: 'smooth' })
            } else {
              handleBooking()
            }
          }}
          className="btn-primary px-6 py-2.5 text-sm font-semibold"
        >
          {days ? 'Book Now' : 'Select Dates'}
        </button>
      </div>
    </div>
  )
}
