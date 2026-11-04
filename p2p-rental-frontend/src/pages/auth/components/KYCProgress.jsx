export default function KYCProgress({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/[0.06] -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neon-cyan -z-10 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep
          const isCurrent = idx === currentStep
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-neon-cyan text-carbon-950'
                    : isCurrent
                    ? 'bg-carbon-900 border-2 border-neon-cyan text-neon-cyan'
                    : 'bg-carbon-900 border border-white/[0.06] text-carbon-500'
                }`}
              >
                {isCompleted ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                   </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-wider hidden sm:block ${
                isCompleted || isCurrent ? 'text-white' : 'text-carbon-500'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
