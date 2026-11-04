const SPEC_ITEMS = [
  { key: 'type', label: 'Type', icon: 'M19 9l-7 7-7-7' },
  { key: 'fuel', label: 'Fuel', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'transmission', label: 'Transmission', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'seats', label: 'Seats', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { key: 'mileage', label: 'Mileage', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
]

export default function VehicleSpecs({ vehicle }) {
  return (
    <div>
      <h2 className="font-display font-bold text-white text-lg tracking-tight mb-4">Specifications</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {SPEC_ITEMS.map((spec) => (
          <div key={spec.key} className="glass rounded-xl p-4 text-center">
            <svg className="w-5 h-5 text-neon-cyan/60 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={spec.icon} />
            </svg>
            <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-1">{spec.label}</div>
            <div className="text-sm font-semibold text-white">{vehicle[spec.key]}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      {vehicle.features?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-carbon-300 mb-3">Features</h3>
          <div className="flex flex-wrap gap-2">
            {vehicle.features.map((feature) => (
              <span
                key={feature}
                className="text-xs text-carbon-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rules */}
      {vehicle.rules?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-carbon-300 mb-3">Vehicle Rules</h3>
          <ul className="space-y-2">
            {vehicle.rules.map((rule) => (
              <li key={rule} className="flex items-center gap-2 text-xs text-carbon-400">
                <svg className="w-3.5 h-3.5 text-carbon-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
