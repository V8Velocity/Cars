import { useState } from 'react'

const categories = ['All', 'Sedan', 'SUV', 'Sports', 'Luxury', 'Electric']

const cars = [
  {
    id: 1,
    name: 'Tesla Model S',
    type: 'Electric',
    price: 89,
    rating: 4.9,
    reviews: 234,
    location: 'San Francisco, CA',
    seats: 5,
    range: '405 mi',
    image: '/tesla_model_s.jpg',
    badge: 'Top Rated',
    features: ['Autopilot', 'Full Self-Drive', 'Supercharger'],
  },
  {
    id: 2,
    name: 'Porsche 911 GT3',
    type: 'Sports',
    price: 320,
    rating: 5.0,
    reviews: 89,
    location: 'Los Angeles, CA',
    seats: 2,
    range: '280 mi',
    image: '/porsche_911_gt3.jpg',
    badge: 'Premium',
    features: ['Sport Mode', 'Track Ready', 'Carbon Kit'],
  },
  {
    id: 3,
    name: 'Range Rover Vogue',
    type: 'SUV',
    price: 180,
    rating: 4.8,
    reviews: 156,
    location: 'New York, NY',
    seats: 7,
    range: '370 mi',
    image: '/range_rover_vogue.jpg',
    badge: 'Family Pick',
    features: ['Air Suspension', 'Panoramic Roof', '4WD'],
  },
  {
    id: 4,
    name: 'BMW 7 Series',
    type: 'Luxury',
    price: 210,
    rating: 4.7,
    reviews: 112,
    location: 'Chicago, IL',
    seats: 5,
    range: '340 mi',
    image: '/bmw_7_series.jpg',
    badge: 'Business',
    features: ['Massage Seats', 'Chauffeur Mode', 'Executive Pkg'],
  },
  {
    id: 5,
    name: 'Toyota Camry SE',
    type: 'Sedan',
    price: 55,
    rating: 4.6,
    reviews: 389,
    location: 'Austin, TX',
    seats: 5,
    range: '500 mi',
    image: '/toyota_camry_se.jpg',
    badge: 'Best Value',
    features: ['Fuel Efficient', 'Apple CarPlay', 'Safety Sense'],
  },
  {
    id: 6,
    name: 'Ford Mustang GT',
    type: 'Sports',
    price: 140,
    rating: 4.8,
    reviews: 201,
    location: 'Miami, FL',
    seats: 4,
    range: '360 mi',
    image: '/ford_mustang_gt.jpg',
    badge: 'Popular',
    features: ['V8 Engine', 'Brembo Brakes', 'Launch Control'],
  },
]

function CarCard({ car }) {
  const [liked, setLiked] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div className="group relative rounded-2xl bg-carbon-900/60 border border-white/[0.04] hover:border-neon-cyan/20 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-neon-cyan/[0.05] flex flex-col">
      {/* Image Area */}
      <div className="relative h-52 overflow-hidden bg-carbon-900">
        <img
          src={car.image}
          alt={car.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-transparent opacity-80" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* Badge */}
        <span className="absolute top-3 left-3 text-[10px] font-semibold text-neon-cyan bg-carbon-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-neon-cyan/20 uppercase tracking-wider">
          {car.badge}
        </span>
        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            liked ? 'bg-red-500/20 border border-red-500/30' : 'bg-carbon-950/60 backdrop-blur-sm border border-white/10'
          }`}
        >
          <svg className={`w-4 h-4 transition-colors ${liked ? 'text-red-400 fill-red-400' : 'text-white/50'}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-white text-lg leading-tight tracking-tight">{car.name}</h3>
          <span className="text-[10px] text-neon-cyan font-medium bg-neon-cyan/[0.08] px-2 py-0.5 rounded-md uppercase tracking-wider">
            {car.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-carbon-500 mb-4">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {car.location}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {car.features.map((f) => (
            <span key={f} className="text-[10px] text-carbon-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
              {f}
            </span>
          ))}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-xs text-carbon-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {car.seats} seats
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {car.range}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <svg className="w-3 h-3 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <strong className="text-white">{car.rating}</strong>
            <span className="text-carbon-600">({car.reviews})</span>
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
          <div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">${car.price}</span>
            <span className="text-carbon-600 text-xs ml-0.5">/day</span>
          </div>
          <button className="btn-primary text-xs py-2 px-5">Book Now</button>
        </div>
      </div>
    </div>
  )
}

export default function FeaturedCars() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? cars
    : cars.filter((c) => c.type === activeCategory)

  return (
    <section id="cars" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="label mb-3">Featured Fleet</p>
            <h2 className="section-title">
              Find Your Perfect <span className="gradient-text">Ride</span>
            </h2>
          </div>
          <a href="#" className="text-carbon-500 hover:text-neon-cyan text-xs font-medium transition-colors flex items-center gap-1 self-end tracking-wide">
            View all cars
            <span className="inline-block">→</span>
          </a>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-neon-cyan text-carbon-950 shadow-lg shadow-neon-cyan/20'
                  : 'bg-white/[0.03] border border-white/[0.06] text-carbon-400 hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </section>
  )
}
