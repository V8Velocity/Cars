import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buildPath } from '@/constants/routes'

export default function VehicleCard({ vehicle }) {
  const [liked, setLiked] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const detailPath = buildPath('/vehicles/:id', { id: vehicle.id })

  return (
    <article className="group relative rounded-2xl bg-carbon-900/60 border border-white/[0.04] hover:border-neon-cyan/20 overflow-hidden transition-colors duration-300 flex flex-col">
      {/* Image */}
      <Link to={detailPath} className="relative aspect-[4/3] overflow-hidden bg-carbon-900 block">
        {!imgLoaded && <div className="absolute inset-0 bg-carbon-800 animate-pulse" />}
        <img
          src={vehicle.image}
          alt={vehicle.name}
          loading="lazy"
          width={400}
          height={300}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-transparent opacity-70" aria-hidden="true" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
      </Link>

      {/* Like */}
      <button
        onClick={() => setLiked(!liked)}
        aria-label={liked ? `Remove ${vehicle.name} from favorites` : `Save ${vehicle.name}`}
        aria-pressed={liked}
        className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 z-10 ${
          liked ? 'bg-red-500/20 border border-red-500/30' : 'bg-carbon-950/60 backdrop-blur-sm border border-white/10'
        }`}
      >
        <svg className={`w-4 h-4 ${liked ? 'text-red-400 fill-red-400' : 'text-white/50'}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4">
        {/* Type + Badges */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] text-neon-cyan font-medium bg-neon-cyan/[0.08] px-2 py-0.5 rounded-md uppercase tracking-wider">{vehicle.type}</span>
          {vehicle.ownerVerified && (
            <span className="flex items-center gap-0.5 text-[10px] text-neon-cyan/70">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Owner
            </span>
          )}
          {vehicle.vehicleVerified && (
            <span className="flex items-center gap-0.5 text-[10px] text-green-400/70">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Inspected
            </span>
          )}
        </div>

        {/* Name + Year */}
        <Link to={detailPath} className="hover:text-neon-cyan transition-colors">
          <h3 className="font-display font-bold text-white text-base leading-tight tracking-tight">
            {vehicle.name} <span className="text-carbon-500 font-normal text-sm">{vehicle.year}</span>
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-carbon-400 mt-1.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {vehicle.location}
        </div>

        {/* Rating + Trips + Availability */}
        <div className="flex items-center gap-2 text-xs text-carbon-400 mt-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <strong className="text-white">{vehicle.rating}</strong>
          </span>
          <span className="text-carbon-600">·</span>
          <span>{vehicle.trips} trips</span>
          <span className="ml-auto flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${vehicle.available ? 'bg-green-400' : 'bg-yellow-400'}`} aria-hidden="true" />
            <span className={vehicle.available ? 'text-green-400/70' : 'text-yellow-400/70'}>
              {vehicle.available ? 'Available' : vehicle.availableDate || 'Soon'}
            </span>
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
          <div>
            <span className="font-display font-bold text-xl text-white tracking-tight">${vehicle.price}</span>
            <span className="text-carbon-500 text-xs">/day</span>
          </div>
          <Link to={detailPath} className="btn-primary text-xs py-1.5 px-4">View</Link>
        </div>
      </div>
    </article>
  )
}
