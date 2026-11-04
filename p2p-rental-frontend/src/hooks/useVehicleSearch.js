import { useSearchParams } from 'react-router-dom'
import { useMemo, useCallback } from 'react'

/**
 * URL-synced vehicle search state.
 * Every filter change writes to the URL → browser history + shareable links.
 */
export function useVehicleSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => ({
    location: searchParams.get('location') || '',
    start: searchParams.get('start') || '',
    end: searchParams.get('end') || '',
    type: searchParams.get('type') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    seats: searchParams.get('seats') || '',
    rating: searchParams.get('rating') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    available: searchParams.get('available') || '',
    sort: searchParams.get('sort') || 'recommended',
    page: parseInt(searchParams.get('page') || '1', 10),
  }), [searchParams])

  /**
   * Merge updates into the URL.
   * Automatically resets to page 1 unless `page` is explicitly passed.
   */
  const setFilters = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)

      for (const [key, value] of Object.entries(updates)) {
        if (value === '' || value === null || value === undefined) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }

      // Reset to page 1 when any non-page filter changes
      if (!('page' in updates)) {
        next.delete('page')
      }

      return next
    }, { replace: true })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  /** Count of active sidebar filters (excludes search bar fields, sort, page) */
  const activeFilterCount = useMemo(() => {
    const sidebar = ['type', 'fuel', 'transmission', 'seats', 'rating', 'priceMin', 'priceMax', 'available']
    return sidebar.filter((key) => filters[key]).length
  }, [filters])

  return { filters, setFilters, clearFilters, activeFilterCount }
}
