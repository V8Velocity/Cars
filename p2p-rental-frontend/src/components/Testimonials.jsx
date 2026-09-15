import { useState } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Renter',
    location: 'San Francisco',
    avatar: 'SM',
    rating: 5,
    text: "Rented a Tesla for a weekend trip and it was absolutely flawless. The owner was super responsive, pickup was seamless, and the car itself was spotless. DriveShare has completely changed how I travel.",
    car: 'Tesla Model S',
    trip: 'SF → Napa Valley',
  },
  {
    id: 2,
    name: 'James Rodriguez',
    role: 'Owner',
    location: 'Los Angeles',
    avatar: 'JR',
    rating: 5,
    text: "I listed my Porsche 911 thinking I'd get a couple rentals a month. I'm now making $2,400/month with zero hassle. The insurance, the platform, the support — everything just works.",
    car: 'Porsche 911 GT3',
    trip: 'Owner since 2024',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Renter',
    location: 'New York',
    avatar: 'PS',
    rating: 5,
    text: "Found a Range Rover for my family road trip at half the price of traditional rental companies. The quality was incredible. My kids keep asking when we can rent again!",
    car: 'Range Rover Vogue',
    trip: 'NYC → Boston',
  },
  {
    id: 4,
    name: 'Marcus Chen',
    role: 'Owner',
    location: 'Chicago',
    avatar: 'MC',
    rating: 5,
    text: "My BMW barely sat in the garage anymore. Now it's earning while I work. The verification process gave me complete confidence in every renter. Highly recommend to any car owner.",
    car: 'BMW 7 Series',
    trip: 'Owner since 2023',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section id="reviews" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="label mb-3">Testimonials</p>
          <h2 className="section-title mb-5">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-carbon-500 text-base max-w-lg mx-auto leading-relaxed">
            Real stories from real drivers and owners on the platform.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="rounded-2xl bg-carbon-900/40 border border-white/[0.04] p-8 md:p-12 mb-8 relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

          <div className="relative z-10">
            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-8">
              {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            <blockquote className="font-display text-xl md:text-2xl lg:text-3xl font-medium text-white leading-relaxed mb-10 max-w-3xl tracking-tight">
              "{testimonials[active].text}"
            </blockquote>

            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/15 flex items-center justify-center text-neon-cyan font-display font-bold text-sm">
                  {testimonials[active].avatar}
                </div>
                <div>
                  <div className="font-display font-bold text-white text-base tracking-tight">{testimonials[active].name}</div>
                  <div className="text-carbon-500 text-xs">{testimonials[active].role} · {testimonials[active].location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-carbon-400">
                  {testimonials[active].car}
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-carbon-400">
                  {testimonials[active].trip}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                active === i
                  ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-white'
                  : 'bg-white/[0.02] border border-white/[0.04] text-carbon-500 hover:text-white hover:border-white/[0.1]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-display ${
                active === i ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/[0.04] text-carbon-500'
              }`}>
                {t.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold leading-none mb-0.5">{t.name}</div>
                <div className="text-[10px] opacity-60">{t.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
