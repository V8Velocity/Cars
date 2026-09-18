const REVIEWS = [
  {
    name: 'Sarah Mitchell',
    role: 'Rented a Tesla Model S',
    text: '"The contactless handover was flawless. Unlocking the car from my phone felt like the future. Will definitely use DriveShare for my next business trip."',
    avatar: 'SM'
  },
  {
    name: 'James Rodriguez',
    role: 'Platform Host',
    text: '"Listing my Porsche was intimidating at first, but the verified driver system and platform insurance gave me complete peace of mind. It pays for its own maintenance now."',
    avatar: 'JR'
  },
  {
    name: 'Priya Sharma',
    role: 'Rented a Range Rover',
    text: '"Found the exact SUV we needed for a weekend mountain trip. The owner was super responsive and the car was spotless. Much better than traditional rental counters."',
    avatar: 'PS'
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-carbon-800/50">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by thousands</h2>
        <p className="text-carbon-300 max-w-2xl mx-auto">Don't just take our word for it. Hear from our community of hosts and drivers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((review, i) => (
          <div 
            key={i} 
            className="p-8 rounded-2xl bg-gradient-to-b from-carbon-900/50 to-transparent border border-carbon-800/50 hover:border-carbon-700 transition-colors"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-carbon-800 flex items-center justify-center text-neon-cyan font-bold border border-carbon-700">
                {review.avatar}
              </div>
              <div>
                <h4 className="text-white font-semibold">{review.name}</h4>
                <p className="text-xs text-carbon-400">{review.role}</p>
              </div>
            </div>
            <p className="text-carbon-300 leading-relaxed text-sm">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
