export default function OwnerCard({ owner }) {
  if (!owner) return null

  const initials = owner.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display font-bold text-white text-lg tracking-tight mb-5">Hosted by</h2>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-neon-cyan text-lg">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-white text-base">{owner.name}</h3>
            {owner.verified && (
              <svg className="w-4 h-4 text-neon-cyan flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified owner">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <p className="text-carbon-500 text-xs mt-0.5">Member since {owner.memberSince}</p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-carbon-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <strong className="text-white">{owner.rating}</strong>
            </span>
            <span>{owner.totalTrips} trips</span>
            <span>{owner.listings} listing{owner.listings !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Response time */}
      <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-xs text-carbon-400">
          <svg className="w-4 h-4 text-carbon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Responds {owner.responseTime}
        </div>

        <button className="ml-auto btn-outline text-xs py-2 px-4">
          Contact Host
        </button>
      </div>
    </div>
  )
}
