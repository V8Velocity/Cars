import { useState, useEffect } from 'react'
import { VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS, SEAT_OPTIONS, RATING_OPTIONS } from '@/constants/vehicles'

// ── Reusable sub-components ──────────────────────────────

function FilterSection({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-carbon-300 uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-neon-cyan text-carbon-950'
          : 'bg-white/[0.03] border border-white/[0.06] text-carbon-400 hover:text-white hover:border-white/[0.12]'
      }`}
    >
      {children}
    </button>
  )
}

// ── Shared filter content (rendered in both desktop & mobile) ─

function FilterContent({ filters, setFilters }) {
  // Local state for price inputs — pushed to URL on blur/enter
  const [priceMin, setPriceMin] = useState(filters.priceMin)
  const [priceMax, setPriceMax] = useState(filters.priceMax)

  useEffect(() => { setPriceMin(filters.priceMin) }, [filters.priceMin])
  useEffect(() => { setPriceMax(filters.priceMax) }, [filters.priceMax])

  const toggle = (key, value) => {
    setFilters({ [key]: filters[key] === value ? '' : value })
  }

  const applyPrice = () => {
    setFilters({ priceMin, priceMax })
  }

  const priceCls =
    'w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-neon-cyan/30 transition-colors placeholder-carbon-600'

  return (
    <div className="space-y-6">
      {/* Vehicle Type */}
      <FilterSection title="Vehicle Type">
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map((type) => (
            <FilterPill key={type} active={filters.type === type} onClick={() => toggle('type', type)}>
              {type}
            </FilterPill>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price / Day">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className={priceCls}
            aria-label="Minimum price"
          />
          <span className="text-carbon-600 text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className={priceCls}
            aria-label="Maximum price"
          />
        </div>
      </FilterSection>

      {/* Fuel */}
      <FilterSection title="Fuel Type">
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((fuel) => (
            <FilterPill key={fuel} active={filters.fuel === fuel} onClick={() => toggle('fuel', fuel)}>
              {fuel}
            </FilterPill>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission">
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((t) => (
            <FilterPill key={t} active={filters.transmission === t} onClick={() => toggle('transmission', t)}>
              {t}
            </FilterPill>
          ))}
        </div>
      </FilterSection>

      {/* Seats */}
      <FilterSection title="Min Seats">
        <div className="flex flex-wrap gap-2">
          {SEAT_OPTIONS.map((s) => (
            <FilterPill key={s} active={filters.seats === String(s)} onClick={() => toggle('seats', String(s))}>
              {s}+
            </FilterPill>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Min Rating">
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <FilterPill key={r} active={filters.rating === String(r)} onClick={() => toggle('rating', String(r))}>
              {r}+ ★
            </FilterPill>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <button
          type="button"
          onClick={() => setFilters({ available: filters.available === 'true' ? '' : 'true' })}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium w-full transition-colors ${
            filters.available === 'true'
              ? 'bg-green-400/10 text-green-400 border border-green-400/20'
              : 'bg-white/[0.03] border border-white/[0.06] text-carbon-400 hover:text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${filters.available === 'true' ? 'bg-green-400' : 'bg-carbon-600'}`} aria-hidden="true" />
          Available Now Only
        </button>
      </FilterSection>
    </div>
  )
}

// ── Main FilterPanel component ───────────────────────────

export default function FilterPanel({ filters, setFilters, clearFilters, activeFilterCount, isOpen, onClose }) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 glass rounded-2xl p-5 max-h-[calc(100vh-120px)] overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-sm tracking-tight">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] text-carbon-500 hover:text-neon-cyan transition-colors">
                Clear all
              </button>
            )}
          </div>
          <FilterContent filters={filters} setFilters={setFilters} />
        </div>
      </aside>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-carbon-950 border-t border-white/[0.06] rounded-t-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
              <h3 className="font-display font-bold text-white text-base">
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-xs text-neon-cyan font-normal">({activeFilterCount})</span>
                )}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-carbon-400 hover:text-white transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <FilterContent filters={filters} setFilters={setFilters} />
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
              <button onClick={() => { clearFilters(); onClose() }} className="btn-outline flex-1 text-xs py-2.5">
                Clear All
              </button>
              <button onClick={onClose} className="btn-primary flex-1 text-xs py-2.5">
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
