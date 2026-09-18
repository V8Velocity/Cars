import { useState } from 'react'

const CATEGORIES = ['All', 'Cars', 'Motorcycles', 'Luxury', 'Electric']

const MOCK_VEHICLES = [
  {
    id: 1,
    name: 'Tesla Model S',
    type: 'Electric',
    price: 149,
    rating: 4.9,
    trips: 124,
    image: '/tesla_model_s.jpg',
    specs: ['1,020 hp', '396 mi range', 'AWD']
  },
  {
    id: 7,
    name: 'Ducati Panigale V4',
    type: 'Motorcycles',
    price: 89,
    rating: 5.0,
    trips: 42,
    image: '/ducati_panigale.jpg',
    specs: ['214 hp', '1.1L V4', 'Track Ready']
  },
  {
    id: 2,
    name: 'Porsche 911 GT3',
    type: 'Sports',
    price: 299,
    rating: 4.8,
    trips: 89,
    image: '/porsche_911_gt3.jpg',
    specs: ['502 hp', 'RWD', 'PDK']
  },
  {
    id: 3,
    name: 'Range Rover Vogue',
    type: 'Luxury',
    price: 189,
    rating: 5.0,
    trips: 42,
    image: '/range_rover_vogue.jpg',
    specs: ['395 hp', 'AWD', 'Air Susp']
  },
  {
    id: 4,
    name: 'BMW 7 Series',
    type: 'Luxury',
    price: 199,
    rating: 4.9,
    trips: 67,
    image: '/bmw_7_series.jpg',
    specs: ['536 hp', 'AWD', 'Exec Rear']
  },
  {
    id: 5,
    name: 'Ford Mustang GT',
    type: 'Sports',
    price: 110,
    rating: 4.7,
    trips: 156,
    image: '/ford_mustang_gt.jpg',
    specs: ['450 hp', 'RWD', 'V8']
  },
  {
    id: 6,
    name: 'Toyota Camry SE',
    type: 'Cars',
    price: 45,
    rating: 4.9,
    trips: 342,
    image: '/toyota_camry_se.jpg',
    specs: ['203 hp', 'FWD', 'Efficient']
  }
]

export default function FeaturedFleet() {
  const [activeTab, setActiveTab] = useState('All')

  // Filter vehicles based on active tab
  const filteredVehicles = MOCK_VEHICLES.filter(
    vehicle => activeTab === 'All' || vehicle.type === activeTab
  )

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <h3 className="text-neon-cyan font-semibold tracking-wider text-sm mb-2 uppercase">Featured Fleet</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Find Your Perfect Ride</h2>
        </div>
        <button 
          onClick={() => setActiveTab('All')}
          className="text-carbon-300 hover:text-neon-cyan transition-colors mt-4 md:mt-0 flex items-center gap-2"
        >
          View all vehicles <span className="text-xl">→</span>
        </button>
      </div>

      {/* Upgraded Category Pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
              activeTab === cat
                ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'bg-carbon-900 border-carbon-800 text-carbon-400 hover:text-white hover:border-carbon-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Premium Hover Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className="group relative bg-carbon-900/50 backdrop-blur-sm border border-carbon-800 rounded-2xl p-6 overflow-hidden hover:border-neon-cyan/50 transition-colors duration-500 cursor-pointer"
          >
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/0 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className="px-3 py-1 bg-carbon-950 rounded-full text-xs font-semibold text-carbon-300 border border-carbon-800">
                {vehicle.type}
              </span>
              <button className="text-carbon-500 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
            </div>

            {/* Image Area */}
            <div className="relative h-52 overflow-hidden bg-carbon-900 rounded-xl mb-6">
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 items-center justify-center text-carbon-500 font-bold opacity-50">
                {vehicle.name}
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-bold text-white mb-2">{vehicle.name}</h4>
              
              {/* Specs reveal on hover */}
              <div className="flex gap-3 text-xs text-carbon-400 mb-4 h-4 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                {vehicle.specs.map((spec, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-neon-cyan" /> {spec}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-end border-t border-carbon-800 pt-4 mt-4">
                <div>
                  <p className="text-carbon-400 text-sm">From</p>
                  <p className="text-2xl font-bold text-white">${vehicle.price}<span className="text-sm font-normal text-carbon-500">/day</span></p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-white">
                  <span className="text-yellow-400">★</span> {vehicle.rating} 
                  <span className="text-carbon-500">({vehicle.trips})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
