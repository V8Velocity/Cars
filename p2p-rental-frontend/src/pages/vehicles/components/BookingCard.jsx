import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'
import AvailabilityCalendar from './AvailabilityCalendar'
import PriceBreakdown from './PriceBreakdown'

function calcDays(pickup, returnDate) {
  if (!pickup || !returnDate) return 0
  const ms = new Date(returnDate) - new Date(pickup)
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function BookingCard({ vehicle }) {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [pickup, setPickup] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const days = useMemo(() => calcDays(pickup, returnDate), [pickup, returnDate])

  const handleDateChange = ({ pickup: p, return: r }) => {
    setPickup(p)
    setReturnDate(r)
  }

  const total = useMemo(() => {
    if (!days || !vehicle.pricing) return 0
    const sub = vehicle.pricing.perDay * days
    return sub + Math.round(sub * vehicle.pricing.platformFeeRate) + Math.round(sub * vehicle.pricing.taxRate)
  }, [days, vehicle.pricing])

  const handleBooking = () => {
    if (!token) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/vehicles/${vehicle.id}` } } })
      return
    }
    // Future: navigate to booking confirmation
    alert(`Booking confirmed!\n\nVehicle: ${vehicle.name}\nPickup: ${pickup}\nReturn: ${returnDate}\nDays: ${days}\nTotal: $${total}\n\n(Mock — no payment processed)`)
  }

  return (
    <>
      {/* ── Desktop booking card ── */}
      <div className="hidden lg:block sticky top-24">
        <div className="glass rounded-2xl p-6 space-y-5">
          {/* Price header */}
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-white tracking-tight">${vehicle.pricing?.perDay}</span>
            <span className="text-carbon-500 text-sm">/day</span>
          </div>

          {/* Date display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
              <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-0.5">Pickup</div>
              <div className={`text-sm ${pickup ? 'text-white font-medium' : 'text-carbon-600'}`}>
                {pickup || 'Select date'}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
              <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-0.5">Return</div>
              <div className={`text-sm ${returnDate ? 'text-white font-medium' : 'text-carbon-600'}`}>
                {returnDate || 'Select date'}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <AvailabilityCalendar
            pickup={pickup}
            returnDate={returnDate}
            unavailableDates={vehicle.unavailableDates || []}
            onDateChange={handleDateChange}
          />

          {/* Duration */}
          {days > 0 && (
            <div className="text-center text-xs text-carbon-400 py-1">
              {days} day{days !== 1 ? 's' : ''} selected
            </div>
          )}

          {/* Price breakdown */}
          <PriceBreakdown pricing={vehicle.pricing} days={days} />

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-carbon-400 pt-2 border-t border-white/[0.04]">
            <svg className="w-3.5 h-3.5 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Pickup at {vehicle.location}
          </div>

          {/* Book button */}
          <button
            onClick={handleBooking}
            disabled={!days}
            className="btn-primary w-full py-3.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!days ? 'Select dates to book' : `Book Now — $${total}`}
          </button>

          <p className="text-carbon-600 text-[11px] text-center">You won&apos;t be charged yet</p>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <span className="font-display text-xl font-bold text-white tracking-tight">${vehicle.pricing?.perDay}</span>
            <span className="text-carbon-500 text-xs">/day</span>
            {days > 0 && (
              <span className="text-carbon-400 text-xs ml-2">· {days} day{days !== 1 ? 's' : ''} = <span className="text-neon-cyan font-semibold">${total}</span></span>
            )}
          </div>
          <button
            onClick={() => {
              if (!days) {
                // Scroll to calendar section
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
    </>
  )
}
