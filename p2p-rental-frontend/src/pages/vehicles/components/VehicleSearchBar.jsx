import { useState, useEffect } from 'react'

export default function VehicleSearchBar({ filters, setFilters }) {
  const [location, setLocation] = useState(filters.location)
  const [start, setStart] = useState(filters.start)
  const [end, setEnd] = useState(filters.end)

  // Sync local state when URL params change externally
  useEffect(() => { setLocation(filters.location) }, [filters.location])
  useEffect(() => { setStart(filters.start) }, [filters.start])
  useEffect(() => { setEnd(filters.end) }, [filters.end])

  const today = new Date()
  today.setDate(today.getDate() + 1)
  const minDate = today.toISOString().split('T')[0]

  const handleSubmit = (e) => {
    e.preventDefault()
    setFilters({ location, start, end })
  }

  const inputCls = 'bg-transparent w-full text-white text-sm placeholder-carbon-600 outline-none'

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-1.5" role="search" aria-label="Search vehicles">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-px">
        {/* Location */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors">
          <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="vs-location" className="block text-[10px] text-carbon-500 font-medium uppercase tracking-wider mb-0.5">Location</label>
            <input id="vs-location" type="text" placeholder="City or area..." value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Pickup */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors sm:border-l sm:border-white/[0.06]">
          <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="vs-start" className="block text-[10px] text-carbon-500 font-medium uppercase tracking-wider mb-0.5">Pickup</label>
            <input id="vs-start" type="date" min={minDate} value={start} onChange={(e) => setStart(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </div>
        </div>

        {/* Return */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors sm:border-l sm:border-white/[0.06]">
          <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <label htmlFor="vs-end" className="block text-[10px] text-carbon-500 font-medium uppercase tracking-wider mb-0.5">Return</label>
            <input id="vs-end" type="date" min={start || minDate} value={end} onChange={(e) => setEnd(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </div>
        </div>

        {/* Search */}
        <button type="submit" className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 sm:col-span-1 col-span-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
    </form>
  )
}
