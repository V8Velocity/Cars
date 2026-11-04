import { useState } from 'react'

export default function TripDetailsStep({ vehicle, data, updateData, onNext }) {
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!data.startDate || !data.endDate) {
      setError('Please select both pickup and return dates.')
      return
    }
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const today = new Date()
    today.setHours(0,0,0,0)

    if (start < today) {
      setError('Pickup date cannot be in the past.')
      return
    }
    if (end <= start) {
      setError('Return date must be after pickup date.')
      return
    }

    // Check mock unavailable dates
    const isUnavailable = vehicle.unavailableDates?.some(d => {
      const unavail = new Date(d)
      return unavail >= start && unavail <= end
    })

    if (isUnavailable) {
      setError('Selected dates overlap with unavailable days.')
      return
    }

    setError('')
    onNext()
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-xl font-medium text-white">Trip Details</h2>
        <p className="text-carbon-400 text-sm mt-1">Confirm your rental dates and location.</p>
      </div>

      <div className="space-y-5 bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl">
        
        <div>
          <label className="block text-sm font-medium text-carbon-300 mb-1.5">Pickup Location</label>
          <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white flex items-center gap-3">
             <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             {vehicle.location} (Exact address provided after booking)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-carbon-300 mb-1.5">Pickup Date</label>
            <input 
              type="date" 
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan/30"
              value={data.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => updateData({ startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-carbon-300 mb-1.5">Return Date</label>
            <input 
              type="date" 
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan/30"
              value={data.endDate}
              min={data.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => updateData({ endDate: e.target.value })}
            />
          </div>
        </div>

        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>

      <div className="flex justify-end pt-4">
        <button className="btn-primary px-8 py-3" onClick={handleNext}>
          Continue to Renter Details
        </button>
      </div>
    </div>
  )
}
