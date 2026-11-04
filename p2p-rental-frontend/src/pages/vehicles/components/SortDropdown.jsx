import { SORT_OPTIONS } from '@/constants/vehicles'

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-lg pl-3 pr-8 py-2 text-white text-xs font-medium outline-none focus:border-neon-cyan/30 transition-colors cursor-pointer"
        aria-label="Sort vehicles"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-carbon-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-carbon-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
