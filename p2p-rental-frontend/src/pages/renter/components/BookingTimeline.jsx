import BookingStatusBadge from '@/components/ui/BookingStatusBadge'

export default function BookingTimeline({ status }) {
  const allStatuses = ['Pending', 'Confirmed', 'Handover', 'Active', 'Returned', 'Completed']
  
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium">This booking was cancelled.</span>
      </div>
    )
  }

  const currentIndex = allStatuses.indexOf(status)
  
  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/[0.06] -z-10" />
        
        {/* Fill line up to current step */}
        {currentIndex > 0 && (
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neon-cyan -z-10 transition-all duration-500"
            style={{ width: `${(currentIndex / (allStatuses.length - 1)) * 100}%` }}
          />
        )}

        {allStatuses.map((step, idx) => {
          const isCompleted = idx < currentIndex
          const isCurrent = idx === currentIndex
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div 
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-neon-cyan'
                    : isCurrent
                    ? 'bg-carbon-900 border-[3px] border-neon-cyan'
                    : 'bg-carbon-900 border-[2px] border-white/[0.1]'
                }`}
              />
              <span className={`text-[9px] uppercase tracking-wider hidden sm:block ${
                isCompleted || isCurrent ? 'text-white font-medium' : 'text-carbon-600'
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
