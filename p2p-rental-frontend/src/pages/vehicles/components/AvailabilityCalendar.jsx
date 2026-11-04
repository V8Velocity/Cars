import { useState, useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function isSameOrBefore(a, b) { return a <= b }

export default function AvailabilityCalendar({ pickup, returnDate, unavailableDates = [], onDateChange }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectionError, setSelectionError] = useState('')

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates])

  // Generate calendar cells
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const startPad = first.getDay()
    const result = []
    for (let i = 0; i < startPad; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [viewYear, viewMonth])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  const canGoPrev = toDateStr(viewYear, viewMonth, 1) > todayStr.slice(0, 7) + '-01'

  const handleDayClick = (day) => {
    const dateStr = toDateStr(viewYear, viewMonth, day)
    setSelectionError('')

    // Can't select past dates or unavailable dates
    if (dateStr < todayStr || unavailableSet.has(dateStr)) return

    if (!pickup || (pickup && returnDate)) {
      // Start new selection
      onDateChange({ pickup: dateStr, return: '' })
    } else {
      // Complete selection
      let start = pickup
      let end = dateStr
      if (end < start) [start, end] = [end, start]

      // Check for unavailable dates within range
      const hasBlock = unavailableDates.some((d) => d > start && d < end)
      if (hasBlock) {
        setSelectionError('Selected range includes unavailable dates')
        return
      }

      onDateChange({ pickup: start, return: end })
    }
  }

  const getDayState = (day) => {
    if (!day) return 'empty'
    const dateStr = toDateStr(viewYear, viewMonth, day)
    if (dateStr < todayStr) return 'past'
    if (unavailableSet.has(dateStr)) return 'unavailable'
    if (dateStr === pickup) return 'pickup'
    if (dateStr === returnDate) return 'return'
    if (pickup && returnDate && dateStr > pickup && dateStr < returnDate) return 'range'
    return 'available'
  }

  const stateClasses = {
    empty: '',
    past: 'text-carbon-800 cursor-not-allowed',
    unavailable: 'text-carbon-700 line-through cursor-not-allowed bg-red-500/[0.04]',
    available: 'text-carbon-300 hover:bg-neon-cyan/10 hover:text-neon-cyan cursor-pointer',
    pickup: 'bg-neon-cyan text-carbon-950 font-bold cursor-pointer rounded-l-md',
    return: 'bg-neon-cyan text-carbon-950 font-bold cursor-pointer rounded-r-md',
    range: 'bg-neon-cyan/10 text-neon-cyan cursor-pointer',
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-carbon-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-carbon-400 hover:text-white transition-colors"
          aria-label="Next month"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-carbon-600 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px" role="grid" aria-label="Availability calendar">
        {cells.map((day, i) => {
          const state = getDayState(day)
          return (
            <div key={i} className="aspect-square flex items-center justify-center">
              {day && (
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={state === 'past' || state === 'unavailable'}
                  className={`w-full h-full flex items-center justify-center text-xs rounded-md transition-colors ${stateClasses[state]}`}
                  aria-label={`${MONTHS[viewMonth]} ${day}`}
                  aria-disabled={state === 'past' || state === 'unavailable'}
                >
                  {day}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-carbon-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-cyan" aria-hidden="true" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/30" aria-hidden="true" /> Unavailable</span>
      </div>

      {/* Error */}
      {selectionError && (
        <p className="text-red-400 text-xs mt-2">{selectionError}</p>
      )}

      {/* Selection hint */}
      {!pickup && (
        <p className="text-carbon-600 text-xs mt-2">Select your pickup date</p>
      )}
      {pickup && !returnDate && (
        <p className="text-neon-cyan/60 text-xs mt-2">Now select your return date</p>
      )}
    </div>
  )
}
