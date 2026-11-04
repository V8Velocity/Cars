const REVIEWS = [
  {
    name: 'Sarah Mitchell',
    role: 'Rented a Tesla Model S',
    text: 'The contactless handover was flawless. Unlocking the car from my phone felt like the future. Will definitely use DriveShare for my next business trip.',
    rating: 5,
    avatar: 'SM',
  },
  {
    name: 'James Rodriguez',
    role: 'Platform Host',
    text: 'Listing my Porsche was intimidating at first, but the verified driver system and platform insurance gave me complete peace of mind. It pays for its own maintenance now.',
    rating: 5,
    avatar: 'JR',
  },
  {
    name: 'Priya Sharma',
    role: 'Rented a Range Rover',
    text: 'Found the exact SUV we needed for a weekend mountain trip. The owner was super responsive and the car was spotless. Much better than traditional rental counters.',
    rating: 5,
    avatar: 'PS',
  },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-carbon-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-carbon-800/50" aria-labelledby="testimonials-title">
      <div className="text-center mb-16">
        <p className="label mb-3">Testimonials</p>
        <h2 id="testimonials-title" className="section-title mb-5">
          Trusted by <span className="gradient-text">Thousands</span>
        </h2>
        <p className="text-carbon-400 max-w-2xl mx-auto leading-relaxed">
          Don&apos;t just take our word for it. Hear from our community of hosts and drivers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((review) => (
          <article
            key={review.name}
            className="p-8 rounded-2xl bg-gradient-to-b from-carbon-900/50 to-transparent border border-carbon-800/50 hover:border-carbon-700 transition-colors duration-300"
          >
            {/* Quotation mark */}
            <div className="text-neon-cyan/15 text-6xl font-serif leading-none mb-2 select-none" aria-hidden="true">
              &ldquo;
            </div>

            <p className="text-carbon-200 leading-relaxed text-sm mb-6">
              {review.text}
            </p>

            <StarRating rating={review.rating} />

            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/[0.04]">
              <div className="w-10 h-10 rounded-full bg-carbon-800 flex items-center justify-center text-neon-cyan text-sm font-bold border border-carbon-700">
                {review.avatar}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{review.name}</h3>
                <p className="text-xs text-carbon-400">{review.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
