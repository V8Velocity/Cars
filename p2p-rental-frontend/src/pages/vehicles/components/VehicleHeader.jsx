export default function VehicleHeader({ vehicle }) {
  return (
    <div>
      {/* Type + Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-[11px] text-neon-cyan font-semibold bg-neon-cyan/[0.08] px-2.5 py-1 rounded-md uppercase tracking-wider">
          {vehicle.type}
        </span>
        {vehicle.vehicleVerified && (
          <span className="flex items-center gap-1 text-[11px] text-green-400/80 bg-green-400/[0.06] px-2 py-1 rounded-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Inspected
          </span>
        )}
        {vehicle.ownerVerified && (
          <span className="flex items-center gap-1 text-[11px] text-neon-cyan/70 bg-neon-cyan/[0.05] px-2 py-1 rounded-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Verified Owner
          </span>
        )}
      </div>

      {/* Name */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
        {vehicle.name}
        <span className="text-carbon-500 font-normal text-2xl sm:text-3xl ml-2">{vehicle.year}</span>
      </h1>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap mt-3 text-sm text-carbon-400">
        {/* Rating */}
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          <strong className="text-white">{vehicle.rating}</strong>
          <span>({vehicle.reviews?.length || 0} reviews)</span>
        </span>

        <span className="text-carbon-700">·</span>

        {/* Trips */}
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          {vehicle.trips} trips
        </span>

        <span className="text-carbon-700">·</span>

        {/* Location */}
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          {vehicle.location}
        </span>
      </div>

      {/* Description */}
      {vehicle.description && (
        <p className="text-carbon-400 text-sm leading-relaxed mt-5 max-w-2xl">
          {vehicle.description}
        </p>
      )}
    </div>
  )
}
