import KYCStatusBadge from '@/components/ui/KYCStatusBadge'

export default function VerificationTimeline({ status }) {
  const steps = [
    { label: 'Submitted', desc: 'Your documents have been submitted', active: true },
    { label: 'Under Review', desc: 'Our team is reviewing your details', active: status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED' },
    { 
      label: status === 'REJECTED' ? 'Rejected' : 'Approved', 
      desc: status === 'REJECTED' ? 'Verification failed. Please retry.' : 'You are ready to rent!', 
      active: status === 'APPROVED' || status === 'REJECTED' 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
        <h3 className="text-lg font-medium text-white">Verification Status</h3>
        <KYCStatusBadge status={status} />
      </div>

      <div className="relative border-l border-white/[0.06] ml-3 space-y-8 pb-4">
        {steps.map((step, i) => (
          <div key={i} className="relative pl-6">
            {/* Timeline dot */}
            <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 ${
              step.active 
                ? (status === 'REJECTED' && i === 2) 
                  ? 'bg-carbon-900 border-red-500'
                  : 'bg-carbon-900 border-neon-cyan' 
                : 'bg-carbon-900 border-white/[0.06]'
            }`} />
            
            <h4 className={`text-sm font-medium ${step.active ? (status === 'REJECTED' && i === 2) ? 'text-red-400' : 'text-white' : 'text-carbon-500'}`}>
              {step.label}
            </h4>
            <p className="text-xs text-carbon-400 mt-1">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
