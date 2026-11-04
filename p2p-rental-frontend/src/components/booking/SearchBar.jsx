import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VEHICLE_TYPES = ['Any Type', 'Sedan', 'SUV', 'Sports', 'Luxury', 'Electric', 'Motorcycle']

export default function SearchBar() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [vehicleType, setVehicleType] = useState('Any Type')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (pickupDate) params.set('start', pickupDate)
    if (returnDate) params.set('end', returnDate)
    if (vehicleType && vehicleType !== 'Any Type') params.set('type', vehicleType)
    const qs = params.toString()
    navigate(qs ? `/vehicles?${qs}` : '/vehicles')
  }

  const today = new Date()
  today.setDate(today.getDate() + 1)
  const minPickup = today.toISOString().split('T')[0]

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      aria-label="Search for vehicles"
      className="glass rounded-2xl p-2 shimmer-border w-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-0">
        {/* Location */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors">
          <svg className="w-4 h-4 text-neon-cyan flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="search-location" className="text-[10px] font-medium text-carbon-500 uppercase tracking-wider block mb-0.5">
              Location
            </label>
            <input
              id="search-location"
              type="text"
              placeholder="City, airport, or address…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder-carbon-600 text-sm"
            />
          </div>
        </div>

        {/* Pickup Date */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors lg:border-l lg:border-white/[0.06]">
          <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="search-pickup" className="text-[10px] font-medium text-carbon-500 uppercase tracking-wider block mb-0.5">
              Pickup
            </label>
            <input
              id="search-pickup"
              type="date"
              min={minPickup}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Return Date */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors lg:border-l lg:border-white/[0.06]">
          <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="search-return" className="text-[10px] font-medium text-carbon-500 uppercase tracking-wider block mb-0.5">
              Return
            </label>
            <input
              id="search-return"
              type="date"
              min={pickupDate || minPickup}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors lg:border-l lg:border-white/[0.06]">
          <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="search-type" className="text-[10px] font-medium text-carbon-500 uppercase tracking-wider block mb-0.5">
              Vehicle
            </label>
            <select
              id="search-type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full text-sm appearance-none cursor-pointer"
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type} className="bg-carbon-900 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="sm:col-span-2 lg:col-span-1 p-1">
          <button
            type="submit"
            className="btn-primary rounded-xl w-full px-8 py-3.5 text-sm flex items-center justify-center gap-2 font-semibold h-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
