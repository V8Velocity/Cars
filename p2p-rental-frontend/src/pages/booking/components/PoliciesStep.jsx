export default function PoliciesStep({ vehicle, data, updateData, onNext, onPrev }) {
  const toggleAgreement = () => {
    updateData({ agreedToPolicies: !data.agreedToPolicies })
  }

  const rules = vehicle.rules || [
    'No smoking inside the vehicle.',
    'Return with the same fuel level.',
    'Valid driver\'s license required at handover.',
    'Late returns are subject to a $50/hr fee.'
  ]

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-xl font-medium text-white">Policies & Rules</h2>
        <p className="text-carbon-400 text-sm mt-1">Please review the host's rules and our cancellation policy.</p>
      </div>

      <div className="space-y-6">
        
        {/* Rules */}
        <div className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl">
          <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Host Rules</h3>
          <ul className="space-y-3">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-carbon-300">
                 <svg className="w-5 h-5 text-carbon-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Cancellation */}
        <div className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl">
          <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Cancellation Policy</h3>
          <p className="text-sm text-carbon-300 mb-2 font-medium">Free cancellation up to 48 hours before pickup.</p>
          <p className="text-xs text-carbon-400 leading-relaxed">
            If you cancel less than 48 hours before your trip begins, you will be refunded 50% of the rental amount. The platform fee is non-refundable. The security deposit is fully refunded.
          </p>
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-3 p-4">
          <button 
            onClick={toggleAgreement}
            className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
              data.agreedToPolicies ? 'bg-neon-cyan border-neon-cyan text-carbon-950' : 'bg-transparent border-carbon-600 text-transparent'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </button>
          <p className="text-sm text-carbon-300 leading-relaxed cursor-pointer" onClick={toggleAgreement}>
            I agree to the host's rules, the cancellation policy, and the DriveShare terms of service. I understand that I am responsible for any damage up to the deductible amount.
          </p>
        </div>

      </div>

      <div className="flex justify-between pt-4 border-t border-white/[0.06]">
        <button className="btn-secondary px-8 py-3" onClick={onPrev}>Back</button>
        <button 
          className="btn-primary px-8 py-3" 
          onClick={onNext} 
          disabled={!data.agreedToPolicies}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
