import { useState } from 'react'

export default function RenterDetailsStep({ data, updateData, onNext, onPrev }) {
  const [error, setError] = useState('')
  // Simulating KYC status for the current user. In a real app this comes from useAuthStore / API
  const [isKycApproved] = useState(true) // Set to false to test the blocker

  const handleNext = () => {
    if (!data.renterDetails.name || !data.renterDetails.phone) {
      setError('Name and phone number are required.')
      return
    }
    if (!isKycApproved) {
      setError('You must complete identity verification (KYC) before booking.')
      return
    }
    setError('')
    onNext()
  }

  const handleChange = (field, value) => {
    updateData({
      renterDetails: {
        ...data.renterDetails,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-xl font-medium text-white">Renter Details</h2>
        <p className="text-carbon-400 text-sm mt-1">Ensure your information is up to date.</p>
      </div>

      <div className="space-y-5 bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl">
        
        {!isKycApproved && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
             <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <div>
               <p className="text-sm font-medium text-red-500">Identity Verification Required</p>
               <p className="text-xs text-red-400 mt-1">You must complete your KYC verification before you can rent a vehicle. Please visit your profile settings.</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-carbon-300 mb-1.5">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan/30"
              value={data.renterDetails.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-carbon-300 mb-1.5">Phone Number</label>
            <input 
              type="tel" 
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan/30"
              value={data.renterDetails.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-carbon-300 mb-1.5">Message to Host (Optional)</label>
          <textarea 
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan/30 h-24 resize-none"
            value={data.renterDetails.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Hi, I'm renting this for a weekend getaway..."
          />
        </div>

        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>

      <div className="flex justify-between pt-4 border-t border-white/[0.06]">
        <button className="btn-secondary px-8 py-3" onClick={onPrev}>Back</button>
        <button className="btn-primary px-8 py-3" onClick={handleNext}>Continue to Pricing</button>
      </div>
    </div>
  )
}
