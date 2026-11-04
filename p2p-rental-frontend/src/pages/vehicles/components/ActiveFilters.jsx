const LABEL_MAP = {
  type: 'Type',
  fuel: 'Fuel',
  transmission: 'Transmission',
  seats: 'Min Seats',
  rating: 'Min Rating',
  priceMin: 'Min Price',
  priceMax: 'Max Price',
  available: 'Availability',
}

function formatValue(key, value) {
  if (key === 'priceMin' || key === 'priceMax') return `$${value}`
  if (key === 'rating') return `${value}+`
  if (key === 'available') return 'Available Now'
  if (key === 'seats') return `${value}+`
  return value
}

export default function ActiveFilters({ filters, setFilters }) {
  const sidebar = ['type', 'fuel', 'transmission', 'seats', 'rating', 'priceMin', 'priceMax', 'available']
  const active = sidebar.filter((key) => filters[key])

  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {active.map((key) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 bg-neon-cyan/[0.08] border border-neon-cyan/20 text-neon-cyan text-[11px] px-2.5 py-1 rounded-full"
        >
          <span className="text-carbon-400">{LABEL_MAP[key]}:</span>
          <span className="font-medium">{formatValue(key, filters[key])}</span>
          <button
            onClick={() => setFilters({ [key]: '' })}
            className="ml-0.5 hover:text-white transition-colors"
            aria-label={`Remove ${LABEL_MAP[key]} filter`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
