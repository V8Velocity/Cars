import { useState, useEffect } from 'react'
import { bookingService } from '@/services/bookings'

export default function PriceBreakdownStep({ vehicle, data, updateData, onNext, onPrev }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [breakdown, setBreakdown] = useState(data.priceResult || null)

  useEffect(() => {
    // If we already calculated it for these exact dates, skip refetching
    if (breakdown && data.priceResult?.startDate === data.startDate && data.priceResult?.endDate === data.endDate) {
      return
    }

    async function fetchPrice() {
      setLoading(true)
      setError('')
      try {
        const res = await bookingService.calculatePrice(vehicle.id, data.startDate, data.endDate)
        
        // Let's do the display calculation based on the factors returned by the backend
        const rentalAmount = res.days * vehicle.price
        const platformFee = rentalAmount * res.platformFeeRate
        const tax = rentalAmount * res.taxRate
        // Fetch security deposit from vehicle if available, or fallback
        const securityDeposit = vehicle.pricing?.securityDeposit || 500
        const total = rentalAmount + platformFee + tax + securityDeposit

        const newBreakdown = {
          startDate: data.startDate,
          endDate: data.endDate,
          days: res.days,
          perDay: vehicle.price,
          rentalAmount,
          platformFee,
          tax,
          securityDeposit,
          total
        }
        
        setBreakdown(newBreakdown)
        updateData({ priceResult: newBreakdown })
      } catch (err) {
        setError('Failed to calculate pricing. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [data.startDate, data.endDate, vehicle.id, vehicle.price])

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-xl font-medium text-white">Price Breakdown</h2>
        <p className="text-carbon-400 text-sm mt-1">Review the total cost for your {breakdown?.days}-day trip.</p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-white/[0.03] rounded w-full" />)}
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : breakdown ? (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-carbon-300">
              <span>${breakdown.perDay} x {breakdown.days} days</span>
              <span className="text-white">${breakdown.rentalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-carbon-300">
              <span>Platform Fee</span>
              <span className="text-white">${breakdown.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-carbon-300">
              <span>Taxes</span>
              <span className="text-white">${breakdown.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-carbon-300 pb-4 border-b border-white/[0.06]">
              <span>Refundable Security Deposit</span>
              <span className="text-white">${breakdown.securityDeposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-carbon-400 font-medium">Total (USD)</span>
              <span className="text-2xl font-bold text-neon-cyan">${breakdown.total.toFixed(2)}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between pt-4 border-t border-white/[0.06]">
        <button className="btn-secondary px-8 py-3" onClick={onPrev}>Back</button>
        <button className="btn-primary px-8 py-3" onClick={onNext} disabled={loading || !!error}>
          Review Policies
        </button>
      </div>
    </div>
  )
}
