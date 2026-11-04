import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function ConfirmationStep({ vehicle, data }) {
  const bookingId = data.bookingResult?.id || 'PENDING'

  return (
    <div className="py-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center">
      
      <div className="w-20 h-20 bg-neon-cyan/10 rounded-full flex items-center justify-center text-neon-cyan mb-6">
         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
         </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
      <p className="text-carbon-400 mb-8 max-w-md">
        You're all set. Your request has been sent to the host. You can view the details and track the status in your dashboard.
      </p>

      <div className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl w-full max-w-sm mb-8 text-left space-y-4">
         <div>
           <div className="text-[10px] uppercase text-carbon-500 tracking-wider mb-1">Booking ID</div>
           <div className="text-white font-mono">{bookingId.toUpperCase()}</div>
         </div>
         <div>
           <div className="text-[10px] uppercase text-carbon-500 tracking-wider mb-1">Vehicle</div>
           <div className="text-white font-medium">{vehicle.name}</div>
         </div>
         <div>
           <div className="text-[10px] uppercase text-carbon-500 tracking-wider mb-1">Dates</div>
           <div className="text-white">{data.startDate} — {data.endDate}</div>
         </div>
      </div>

      <div className="flex gap-4">
        <Link to={ROUTES.TRIPS} className="btn-primary px-8 py-3">View My Trips</Link>
        <Link to={ROUTES.HOME} className="btn-secondary px-8 py-3">Return Home</Link>
      </div>

    </div>
  )
}
