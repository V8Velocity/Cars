import { Link } from 'react-router-dom'

export default function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-carbon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h3 className="font-display font-bold text-white text-lg mb-2">No vehicles found</h3>
      <p className="text-carbon-400 text-sm max-w-sm mb-8 leading-relaxed">
        We couldn&apos;t find any vehicles matching your filters. Try adjusting your search or explore all available vehicles.
      </p>

      <div className="flex gap-3">
        <button onClick={onClear} className="btn-primary text-xs px-6 py-2.5">
          Clear All Filters
        </button>
        <Link to="/vehicles" className="btn-outline text-xs px-6 py-2.5">
          Browse All
        </Link>
      </div>
    </div>
  )
}
