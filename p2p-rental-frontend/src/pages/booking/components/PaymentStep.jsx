import { useState } from 'react'
import { bookingService } from '@/services/bookings'

export default function PaymentStep({ vehicle, data, updateData, onNext, onPrev }) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError('')

    try {
      // Create booking via service
      const payload = {
        vehicleId: vehicle.id,
        startDate: data.startDate,
        endDate: data.endDate,
        total: data.priceResult.total,
        paymentMethod: data.paymentMethod
      }
      
      const result = await bookingService.create(payload)
      
      // Save result to context to show on next screen
      updateData({ bookingResult: result })
      onNext()
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-xl font-medium text-white">Payment</h2>
        <p className="text-carbon-400 text-sm mt-1">Complete your booking for ${data.priceResult?.total?.toFixed(2)}</p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl flex flex-col md:flex-row gap-8">
        
        {/* Mock form */}
        <div className="flex-1 space-y-5">
           
           <div className="flex gap-4 mb-6">
             <button className="flex-1 py-3 border-2 border-neon-cyan bg-neon-cyan/10 rounded-lg text-white font-medium text-sm">Credit Card</button>
             <button className="flex-1 py-3 border border-white/[0.1] bg-white/[0.02] rounded-lg text-carbon-400 font-medium text-sm opacity-50 cursor-not-allowed">PayPal</button>
           </div>

           <div>
             <label className="block text-sm font-medium text-carbon-300 mb-1.5">Card Number</label>
             <div className="relative">
               <input type="text" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 pl-12 text-white outline-none" placeholder="0000 0000 0000 0000" />
               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-carbon-300 mb-1.5">Expiry</label>
               <input type="text" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none" placeholder="MM/YY" />
             </div>
             <div>
               <label className="block text-sm font-medium text-carbon-300 mb-1.5">CVC</label>
               <input type="text" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none" placeholder="123" />
             </div>
           </div>
           
           {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </div>

        {/* Total Summary */}
        <div className="md:w-64 bg-carbon-950 p-5 rounded-xl border border-white/[0.06] h-fit">
          <h3 className="text-xs uppercase tracking-wider text-carbon-400 mb-4">Summary</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-carbon-300">Due Now</span>
            <span className="text-lg font-bold text-white">${data.priceResult?.total?.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-carbon-500">Includes refundable security deposit of ${data.priceResult?.securityDeposit?.toFixed(2)}</p>
        </div>

      </div>

      <div className="flex justify-between pt-4 border-t border-white/[0.06]">
        <button className="btn-secondary px-8 py-3" onClick={onPrev} disabled={processing}>Back</button>
        <button 
          className="btn-primary px-8 py-3 flex items-center gap-2" 
          onClick={handlePayment} 
          disabled={processing}
        >
          {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {processing ? 'Processing...' : 'Pay & Confirm'}
        </button>
      </div>
    </div>
  )
}
