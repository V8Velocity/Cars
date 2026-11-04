export default function VehicleReviews({ reviews, rating }) {
  if (!reviews?.length) return null

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.floor(r.rating) === star).length,
    pct: Math.round((reviews.filter((r) => Math.floor(r.rating) === star).length / reviews.length) * 100),
  }))

  return (
    <div>
      <h2 className="font-display font-bold text-white text-lg tracking-tight mb-5">Reviews</h2>

      {/* Summary */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
        {/* Big rating */}
        <div className="text-center flex-shrink-0">
          <div className="font-display text-5xl font-bold text-white">{rating}</div>
          <div className="flex items-center gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-carbon-700'}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className="text-carbon-500 text-xs mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-1.5 w-full">
          {ratingCounts.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="text-carbon-400 w-3 text-right">{star}</span>
              <svg className="w-3 h-3 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <div className="flex-1 h-1.5 bg-carbon-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400/80 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-carbon-600 w-5 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {/* Initials avatar */}
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-carbon-400">{review.author.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{review.author}</span>
                  <span className="text-carbon-600 text-xs ml-2">
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400' : 'text-carbon-700'}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-carbon-400 text-sm leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
