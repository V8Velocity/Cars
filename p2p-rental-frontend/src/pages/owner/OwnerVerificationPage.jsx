import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import KYCStatusBadge from '@/components/ui/KYCStatusBadge'

export default function OwnerVerificationPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Host Verification</h1>
        <p className="text-carbon-400 mt-1">Manage your identity and host verification status.</p>
      </div>

      <div className="glass rounded-2xl p-8">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-6 mb-6">
           <div>
             <h2 className="text-lg font-medium text-white">Identity Verification</h2>
             <p className="text-sm text-carbon-400 mt-1">Required to list vehicles and receive payouts.</p>
           </div>
           <KYCStatusBadge status="APPROVED" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-carbon-300">
             <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">✓</div>
             Government ID Verified
          </div>
          <div className="flex items-center gap-3 text-sm text-carbon-300">
             <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">✓</div>
             Selfie Match Verified
          </div>
          <div className="flex items-center gap-3 text-sm text-carbon-300">
             <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">✓</div>
             Phone Number Verified
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <Link to={ROUTES.KYC} className="btn-secondary text-sm px-6 py-2.5">
            Update Verification Info
          </Link>
        </div>
      </div>
    </div>
  )
}
