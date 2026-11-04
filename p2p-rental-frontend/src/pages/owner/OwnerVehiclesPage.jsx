import { Link } from 'react-router-dom'
import { ROUTES, buildPath } from '@/constants/routes'
import { useOwnerVehicles } from '@/hooks/useVehicles'

const STATUS_COLORS = {
  DRAFT: 'bg-carbon-700 text-carbon-300 border-carbon-600',
  PENDING_VERIFICATION: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  SUSPENDED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
}

function VehicleStatusBadge({ status }) {
  const colorCls = STATUS_COLORS[status] || STATUS_COLORS.DRAFT
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${colorCls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function OwnerVehiclesPage() {
  const { data: vehicles, isLoading } = useOwnerVehicles()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">My Vehicles</h1>
          <p className="text-carbon-400 mt-1">Manage your fleet and update listings.</p>
        </div>
        <Link to={ROUTES.OWNER_ADD_VEHICLE} className="btn-primary text-sm px-6 py-2.5">
          List New Vehicle
        </Link>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 glass rounded-2xl animate-pulse bg-carbon-900" />)}
          </div>
        )}

        {!isLoading && vehicles?.length === 0 && (
          <div className="py-20 text-center glass rounded-2xl">
            <h3 className="font-display text-xl font-medium text-white mb-2">No vehicles listed</h3>
            <p className="text-carbon-400 text-sm mb-6 max-w-sm mx-auto">
              Start earning by listing your first vehicle on DriveShare.
            </p>
            <Link to={ROUTES.OWNER_ADD_VEHICLE} className="btn-primary text-sm px-6 py-2.5 inline-block">
              List Your Vehicle
            </Link>
          </div>
        )}

        {!isLoading && vehicles?.map(vehicle => (
          <div key={vehicle.id} className="glass rounded-2xl p-5 flex flex-col md:flex-row gap-6 border border-white/[0.04]">
            
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
              <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 md:hidden">
                <VehicleStatusBadge status={vehicle.status} />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{vehicle.name}</h3>
                  <div className="hidden md:block">
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>
                </div>
                <p className="text-sm text-carbon-400 mb-3">{vehicle.location}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-0.5">Price</span>
                  <span className="text-white font-medium">${vehicle.price}/day</span>
                </div>
                <div>
                  <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-0.5">Rating</span>
                  <span className="text-white font-medium">{vehicle.rating} ★ ({vehicle.trips})</span>
                </div>
                <div>
                  <span className="text-[10px] text-carbon-500 uppercase tracking-wider block mb-0.5">Type</span>
                  <span className="text-white font-medium">{vehicle.type}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center justify-end gap-3 border-t border-white/[0.06] md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0 mt-4 md:mt-0">
               <Link to={buildPath(ROUTES.OWNER_EDIT_VEHICLE, { id: vehicle.id })} className="btn-secondary text-xs px-4 py-2 w-full text-center">
                 Edit Listing
               </Link>
               {vehicle.status === 'APPROVED' && (
                 <Link to={buildPath(ROUTES.VEHICLE_DETAIL, { id: vehicle.id })} className="btn-primary text-xs px-4 py-2 w-full text-center">
                   View Public
                 </Link>
               )}
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
