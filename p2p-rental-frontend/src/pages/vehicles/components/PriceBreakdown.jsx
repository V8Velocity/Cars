export default function PriceBreakdown({ pricing, days }) {
  if (!pricing || !days || days <= 0) return null

  const subtotal = pricing.perDay * days
  const platformFee = Math.round(subtotal * pricing.platformFeeRate)
  const taxes = Math.round(subtotal * pricing.taxRate)
  const total = subtotal + platformFee + taxes

  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <span className="text-carbon-400">
          ${pricing.perDay} × {days} day{days !== 1 ? 's' : ''}
        </span>
        <span className="text-white font-medium">${subtotal}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-carbon-400">Platform fee</span>
        <span className="text-white font-medium">${platformFee}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-carbon-400">Taxes</span>
        <span className="text-white font-medium">${taxes}</span>
      </div>
      <div className="flex justify-between text-xs text-carbon-500">
        <span>Security deposit (refundable)</span>
        <span>${pricing.securityDeposit}</span>
      </div>

      <div className="flex justify-between pt-3 border-t border-white/[0.06] font-semibold">
        <span className="text-white">Total</span>
        <span className="text-neon-cyan text-lg font-display">${total}</span>
      </div>
    </div>
  )
}
