import { useState } from 'react'
import { useVehicles } from '@/hooks/useVehicles'
import { useVehicleSearch } from '@/hooks/useVehicleSearch'
import VehicleSearchBar from './components/VehicleSearchBar'
import FilterPanel from './components/FilterPanel'
import ActiveFilters from './components/ActiveFilters'
import SortDropdown from './components/SortDropdown'
import VehicleGrid from './components/VehicleGrid'
import Pagination from './components/Pagination'
import LoadingSkeleton from './components/LoadingSkeleton'
import EmptyState from './components/EmptyState'
import ErrorState from './components/ErrorState'

export default function VehiclesPage() {
  const { filters, setFilters, clearFilters, activeFilterCount } = useVehicleSearch()
  const { data, isLoading, isError, refetch, isFetching } = useVehicles(filters)
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="min-h-screen pt-20 px-6">
      <div className="max-w-7xl mx-auto py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-1">Browse Vehicles</h1>
          <p className="text-carbon-400 text-sm">Find your perfect ride from verified owners</p>
        </div>

        {/* Search bar */}
        <VehicleSearchBar filters={filters} setFilters={setFilters} />

        {/* Toolbar: filter toggle, active filters, count, sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mobile filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-carbon-400 hover:text-white text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-neon-cyan text-carbon-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <ActiveFilters filters={filters} setFilters={setFilters} />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {data && (
              <span className="text-carbon-500 text-xs">
                {data.total} vehicle{data.total !== 1 ? 's' : ''}
                {isFetching && !isLoading && (
                  <span className="ml-1.5 text-neon-cyan/60">updating…</span>
                )}
              </span>
            )}
            <SortDropdown value={filters.sort} onChange={(sort) => setFilters({ sort })} />
          </div>
        </div>

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-8">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <LoadingSkeleton />
            ) : isError ? (
              <ErrorState onRetry={refetch} />
            ) : data.vehicles.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <VehicleGrid vehicles={data.vehicles} />
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onPageChange={(page) => setFilters({ page })}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
