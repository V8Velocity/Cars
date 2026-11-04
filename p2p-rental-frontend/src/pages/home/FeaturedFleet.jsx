import { useState } from 'react'

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Sports', 'Luxury', 'Electric', 'Motorcycle']

const VEHICLES = [
  {
    id: 1,
    name: 'Tesla Model S',
    type: 'Electric',
    price: 149,
    rating: 4.9,
    trips: 124,
    location: 'San Francisco, CA',
    seats: 5,
    range: '396 mi',
    image: '/tesla_model_s.jpg',
    badge: 'Top Rated',
    specs: ['1,020 hp', '396 mi range', 'AWD'],
    verified: true,
    available: true,
  },
  {
    id: 2,
    name: 'Ducati Panigale V4',
    type: 'Motorcycle',
    price: 89,
    rating: 5.0,
    trips: 42,
    location: 'Los Angeles, CA',
    seats: 2,
    range: '180 mi',
    image: '/ducati_panigale.jpg',
    badge: 'Premium',
    specs: ['214 hp', '1.1L V4', 'Track Ready'],
    verified: true,
    available: true,
  },
  {
    id: 3,
    name: 'Porsche 911 GT3',
    type: 'Sports',
    price: 299,
    rating: 4.8,
    trips: 89,
    location: 'Los Angeles, CA',
    seats: 2,
    range: '280 mi',
    image: '/porsche_911_gt3.jpg',
    badge: 'Premium',
    specs: ['502 hp', 'RWD', 'PDK'],
    verified: true,
    available: true,
  },
  {
    id: 4,
    name: 'Range Rover Vogue',
    type: 'SUV',
    price: 189,
    rating: 5.0,
    trips: 156,
    location: 'New York, NY',
    seats: 7,
    range: '370 mi',
    image: '/range_rover_vogue.jpg',
    badge: 'Family Pick',
    specs: ['395 hp', 'AWD', 'Air Susp'],
    verified: true,
    available: true,
  },
  {
    id: 5,
    name: 'BMW 7 Series',
    type: 'Luxury',
    price: 199,
    rating: 4.9,
    trips: 67,
    location: 'Chicago, IL',
    seats: 5,
    range: '340 mi',
    image: '/bmw_7_series.jpg',
    badge: 'Business',
    specs: ['536 hp', 'AWD', 'Exec Rear'],
    verified: true,
    available: false,
    availableDate: 'Oct 5',
  },
  {
    id: 6,
    name: 'Ford Mustang GT',
    type: 'Sports',
    price: 110,
    rating: 4.7,
    trips: 201,
    location: 'Miami, FL',
    seats: 4,
    range: '360 mi',
    image: '/ford_mustang_gt.jpg',
    badge: 'Popular',
    specs: ['450 hp', 'RWD', 'V8'],
    verified: true,
    available: true,
  },
  {
    id: 7,
    name: 'Toyota Camry SE',
    type: 'Sedan',
    price: 45,
    rating: 4.9,
    trips: 342,
    location: 'Austin, TX',
    seats: 5,
    range: '500 mi',
    image: '/toyota_camry_se.jpg',
    badge: 'Best Value',
    specs: ['203 hp', 'FWD', 'Efficient'],
    verified: true,
    available: true,
  },
]

function VehicleCard({ vehicle }) {
  const [liked, setLiked] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <article
      className="group relative rounded-2xl bg-carbon-900/60 border border-white/[0.04] hover:border-neon-cyan/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-neon-cyan/[0.05] flex flex-col"
      aria-label={vehicle.name}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-carbon-900">
        {/* Skeleton shimmer */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-carbon-800 animate-shimmer" />
        )}
        <img
          src={vehicle.image}
          alt={vehicle.name}
          loading="lazy"
          width={400}
          height={300}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-transparent opacity-80" aria-hidden="true" />
        {/* Top accent line on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

        {/* Badge */}
        <span className="absolute top-3 left-3 text-[10px] font-semibold text-neon-cyan bg-carbon-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-neon-cyan/20 uppercase tracking-wider">
          {vehicle.badge}
        </span>

        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          aria-label={liked ? `Remove ${vehicle.name} from favorites` : `Add ${vehicle.name} to favorites`}
          aria-pressed={liked}
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            liked ? 'bg-red-500/20 border border-red-500/30' : 'bg-carbon-950/60 backdrop-blur-sm border border-white/10'
          }`}
        >
          <svg
            className={`w-4 h-4 transition-colors ${liked ? 'text-red-400 fill-red-400' : 'text-white/50'}`}
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-5">
        {/* Type + Verified */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-neon-cyan font-medium bg-neon-cyan/[0.08] px-2 py-0.5 rounded-md uppercase tracking-wider">
            {vehicle.type}
          </span>
          {vehicle.verified && (
            <span className="flex items-center gap-1 text-[10px] text-neon-cyan/70 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-white text-lg leading-tight tracking-tight mb-2">
          {vehicle.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-carbon-400 mb-3">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {vehicle.location}
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.specs.map((spec) => (
            <span key={spec} className="text-[10px] text-carbon-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
              {spec}
            </span>
          ))}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-xs text-carbon-400 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {vehicle.seats} seats
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {vehicle.range}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <strong className="text-white">{vehicle.rating}</strong>
            <span className="text-carbon-500">({vehicle.trips})</span>
          </span>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1.5 text-xs mb-4">
          <span className={`w-1.5 h-1.5 rounded-full ${vehicle.available ? 'bg-green-400' : 'bg-yellow-400'}`} aria-hidden="true" />
          <span className={vehicle.available ? 'text-green-400/80' : 'text-yellow-400/80'}>
            {vehicle.available ? 'Available Now' : `Available ${vehicle.availableDate}`}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
          <div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">${vehicle.price}</span>
            <span className="text-carbon-500 text-xs ml-0.5">/day</span>
          </div>
          <button className="btn-primary text-xs py-2 px-5">Book Now</button>
        </div>
      </div>
    </article>
  )
}

export default function FeaturedFleet() {
  const [activeTab, setActiveTab] = useState('All')

  const filteredVehicles = VEHICLES.filter(
    (vehicle) => activeTab === 'All' || vehicle.type === activeTab
  )

  return (
    <section className="py-24 px-6" aria-labelledby="fleet-title">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="label mb-3">Featured Fleet</p>
            <h2 id="fleet-title" className="section-title">
              Find Your Perfect <span className="gradient-text">Ride</span>
            </h2>
          </div>
          <a href="#" className="text-carbon-400 hover:text-neon-cyan text-xs font-medium transition-colors flex items-center gap-1 self-end tracking-wide">
            View all vehicles
            <span className="inline-block" aria-hidden="true">→</span>
          </a>
        </div>

        {/* Category Filters */}
        <div role="tablist" aria-label="Filter vehicles by category" className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeTab === cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                activeTab === cat
                  ? 'bg-neon-cyan text-carbon-950 shadow-lg shadow-neon-cyan/20'
                  : 'bg-white/[0.03] border border-white/[0.06] text-carbon-400 hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="tabpanel">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-carbon-400 text-lg mb-2">No vehicles found in this category.</p>
              <button
                onClick={() => setActiveTab('All')}
                className="text-neon-cyan text-sm hover:underline"
              >
                View all vehicles
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
