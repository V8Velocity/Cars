import { api } from './api'
import { PAGE_SIZE } from '@/constants/vehicles'

// ── Toggle when Django REST API is ready ──────────────────
const USE_MOCK = true

// ── Mock data ─────────────────────────────────────────────
const MOCK_VEHICLES = [
  { id: 'v1', name: 'Tesla Model S Plaid', year: 2025, type: 'Electric', price: 149, rating: 4.9, trips: 124, location: 'San Francisco, CA', seats: 5, fuel: 'Electric', transmission: 'Automatic', image: '/tesla_model_s.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-08-15' },
  { id: 'v2', name: 'Ducati Panigale V4', year: 2025, type: 'Motorcycle', price: 89, rating: 5.0, trips: 42, location: 'Los Angeles, CA', seats: 2, fuel: 'Petrol', transmission: 'Manual', image: '/ducati_panigale.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-07-20' },
  { id: 'v3', name: 'Porsche 911 GT3', year: 2024, type: 'Sports', price: 299, rating: 4.8, trips: 89, location: 'Los Angeles, CA', seats: 2, fuel: 'Petrol', transmission: 'Automatic', image: '/porsche_911_gt3.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-06-10' },
  { id: 'v4', name: 'Range Rover Vogue', year: 2025, type: 'SUV', price: 189, rating: 5.0, trips: 156, location: 'New York, NY', seats: 7, fuel: 'Diesel', transmission: 'Automatic', image: '/range_rover_vogue.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-09-01' },
  { id: 'v5', name: 'BMW 7 Series', year: 2025, type: 'Luxury', price: 199, rating: 4.9, trips: 67, location: 'Chicago, IL', seats: 5, fuel: 'Petrol', transmission: 'Automatic', image: '/bmw_7_series.jpg', ownerVerified: true, vehicleVerified: true, available: false, availableDate: 'Oct 5', createdAt: '2026-05-20' },
  { id: 'v6', name: 'Ford Mustang GT', year: 2024, type: 'Sports', price: 110, rating: 4.7, trips: 201, location: 'Miami, FL', seats: 4, fuel: 'Petrol', transmission: 'Manual', image: '/ford_mustang_gt.jpg', ownerVerified: true, vehicleVerified: false, available: true, createdAt: '2026-04-15' },
  { id: 'v7', name: 'Toyota Camry SE', year: 2025, type: 'Sedan', price: 45, rating: 4.9, trips: 342, location: 'Austin, TX', seats: 5, fuel: 'Hybrid', transmission: 'Automatic', image: '/toyota_camry_se.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-03-01' },
  { id: 'v8', name: 'Tesla Model 3 LR', year: 2025, type: 'Electric', price: 89, rating: 4.8, trips: 256, location: 'Seattle, WA', seats: 5, fuel: 'Electric', transmission: 'Automatic', image: '/tesla_model_s.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-09-10' },
  { id: 'v9', name: 'BMW X5 M Sport', year: 2024, type: 'SUV', price: 159, rating: 4.7, trips: 98, location: 'Denver, CO', seats: 5, fuel: 'Petrol', transmission: 'Automatic', image: '/bmw_7_series.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-08-05' },
  { id: 'v10', name: 'Toyota Supra GR', year: 2025, type: 'Sports', price: 175, rating: 4.9, trips: 45, location: 'San Diego, CA', seats: 2, fuel: 'Petrol', transmission: 'Manual', image: '/ford_mustang_gt.jpg', ownerVerified: false, vehicleVerified: true, available: true, createdAt: '2026-09-15' },
  { id: 'v11', name: 'Mercedes-Benz S-Class', year: 2025, type: 'Luxury', price: 249, rating: 4.9, trips: 31, location: 'New York, NY', seats: 5, fuel: 'Petrol', transmission: 'Automatic', image: '/bmw_7_series.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-09-20' },
  { id: 'v12', name: 'Jeep Wrangler Rubicon', year: 2024, type: 'SUV', price: 95, rating: 4.6, trips: 178, location: 'Phoenix, AZ', seats: 5, fuel: 'Petrol', transmission: 'Manual', image: '/range_rover_vogue.jpg', ownerVerified: true, vehicleVerified: false, available: true, createdAt: '2026-07-01' },
  { id: 'v13', name: 'Honda Civic Type R', year: 2025, type: 'Sports', price: 75, rating: 4.8, trips: 120, location: 'Portland, OR', seats: 4, fuel: 'Petrol', transmission: 'Manual', image: '/toyota_camry_se.jpg', ownerVerified: true, vehicleVerified: true, available: false, availableDate: 'Oct 10', createdAt: '2026-06-25' },
  { id: 'v14', name: 'Audi e-tron GT', year: 2025, type: 'Electric', price: 195, rating: 4.7, trips: 28, location: 'San Francisco, CA', seats: 5, fuel: 'Electric', transmission: 'Automatic', image: '/tesla_model_s.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-09-25' },
  { id: 'v15', name: 'Kawasaki Ninja ZX-10R', year: 2024, type: 'Motorcycle', price: 65, rating: 4.9, trips: 56, location: 'Las Vegas, NV', seats: 2, fuel: 'Petrol', transmission: 'Manual', image: '/ducati_panigale.jpg', ownerVerified: false, vehicleVerified: true, available: true, createdAt: '2026-05-10' },
  { id: 'v16', name: 'Porsche Cayenne S', year: 2025, type: 'SUV', price: 220, rating: 4.8, trips: 44, location: 'Miami, FL', seats: 5, fuel: 'Hybrid', transmission: 'Automatic', image: '/porsche_911_gt3.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-08-30' },
  { id: 'v17', name: 'Hyundai Tucson', year: 2025, type: 'SUV', price: 55, rating: 4.5, trips: 290, location: 'Dallas, TX', seats: 5, fuel: 'Hybrid', transmission: 'Automatic', image: '/range_rover_vogue.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-02-15' },
  { id: 'v18', name: 'Lamborghini Huracán', year: 2024, type: 'Sports', price: 499, rating: 5.0, trips: 12, location: 'Los Angeles, CA', seats: 2, fuel: 'Petrol', transmission: 'Automatic', image: '/porsche_911_gt3.jpg', ownerVerified: true, vehicleVerified: true, available: true, createdAt: '2026-09-28' },
]

// ── Mock implementation (mirrors Django REST API response shape) ───
async function mockGetVehicles(params = {}) {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))

  let vehicles = [...MOCK_VEHICLES]

  // Filters
  if (params.location) {
    const q = params.location.toLowerCase()
    vehicles = vehicles.filter((v) => v.location.toLowerCase().includes(q))
  }
  if (params.type) vehicles = vehicles.filter((v) => v.type === params.type)
  if (params.fuel) vehicles = vehicles.filter((v) => v.fuel === params.fuel)
  if (params.transmission) vehicles = vehicles.filter((v) => v.transmission === params.transmission)
  if (params.seats) vehicles = vehicles.filter((v) => v.seats >= parseInt(params.seats, 10))
  if (params.rating) vehicles = vehicles.filter((v) => v.rating >= parseFloat(params.rating))
  if (params.priceMin) vehicles = vehicles.filter((v) => v.price >= parseInt(params.priceMin, 10))
  if (params.priceMax) vehicles = vehicles.filter((v) => v.price <= parseInt(params.priceMax, 10))
  if (params.available === 'true') vehicles = vehicles.filter((v) => v.available)

  // Sort
  switch (params.sort) {
    case 'price_asc':  vehicles.sort((a, b) => a.price - b.price); break
    case 'price_desc': vehicles.sort((a, b) => b.price - a.price); break
    case 'rating':     vehicles.sort((a, b) => b.rating - a.rating || b.trips - a.trips); break
    case 'newest':     vehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break
    default: break // 'recommended' = default insertion order
  }

  // Paginate
  const page = parseInt(params.page, 10) || 1
  const total = vehicles.length
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1
  const start = (page - 1) * PAGE_SIZE

  return {
    vehicles: vehicles.slice(start, start + PAGE_SIZE),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  }
}

// ── Detail enrichment data ────────────────────────────────

const ALL_IMAGES = ['/tesla_model_s.jpg', '/ducati_panigale.jpg', '/porsche_911_gt3.jpg', '/range_rover_vogue.jpg', '/bmw_7_series.jpg', '/ford_mustang_gt.jpg', '/toyota_camry_se.jpg']

const MOCK_OWNERS = [
  { id: 'o1', name: 'Alex Johnson', rating: 4.9, responseTime: '< 1 hour', verified: true, memberSince: 'Jan 2024', listings: 3, totalTrips: 450 },
  { id: 'o2', name: 'Priya Sharma', rating: 5.0, responseTime: '< 30 min', verified: true, memberSince: 'Mar 2023', listings: 5, totalTrips: 780 },
  { id: 'o3', name: 'Marcus Chen', rating: 4.8, responseTime: '< 2 hours', verified: true, memberSince: 'Jun 2024', listings: 2, totalTrips: 120 },
  { id: 'o4', name: 'Sofia Martinez', rating: 4.7, responseTime: '< 1 hour', verified: false, memberSince: 'Sep 2025', listings: 1, totalTrips: 45 },
  { id: 'o5', name: 'Daniel Park', rating: 4.9, responseTime: '< 15 min', verified: true, memberSince: 'Nov 2022', listings: 8, totalTrips: 1120 },
]

const FEATURES_MAP = {
  Electric: ['Autopilot', 'Heated Seats', 'Premium Audio', 'Wireless Charging', 'Over-the-air Updates', 'Regenerative Braking'],
  Sports: ['Launch Control', 'Sport Exhaust', 'Carbon Fiber Trim', 'Track Mode', 'Adaptive Suspension', 'Performance Brakes'],
  SUV: ['All-Wheel Drive', 'Panoramic Roof', 'Adaptive Cruise', 'Tow Package', 'Off-Road Mode', 'Heated Steering'],
  Luxury: ['Massaging Seats', 'Rear Entertainment', 'Air Suspension', 'Night Vision', 'Executive Seating', 'Ambient Lighting'],
  Sedan: ['Adaptive Cruise', 'Lane Keep Assist', 'Apple CarPlay', 'Sunroof', 'Blind Spot Monitor', 'Wireless Charging'],
  Motorcycle: ['ABS', 'Traction Control', 'Quick Shifter', 'LED Lighting', 'Riding Modes', 'Slipper Clutch'],
}

const DESCRIPTIONS = {
  Electric: 'Experience the future of driving with this fully electric powerhouse. Instant torque, zero emissions, and cutting-edge technology make every journey unforgettable.',
  Sports: 'Feel the rush of pure automotive engineering. This high-performance machine delivers exhilarating acceleration, razor-sharp handling, and a soundtrack that stirs the soul.',
  SUV: 'Conquer any terrain in style. This premium SUV combines rugged capability with luxury refinement, offering space, comfort, and confidence on every road.',
  Luxury: 'Indulge in automotive excellence. Every detail has been crafted to deliver an unparalleled driving experience with world-class comfort and sophistication.',
  Sedan: 'The perfect blend of efficiency and comfort. Ideal for daily drives and road trips alike, with modern tech and reliable performance.',
  Motorcycle: 'Unleash your inner rider. This machine delivers pure two-wheeled thrills with precise handling, responsive power, and head-turning presence.',
}

const MOCK_REVIEWS = [
  { id: 'r1', author: 'Sarah M.', rating: 5, date: '2026-09-15', text: 'Incredible experience! The car was immaculate and drove like a dream. Pickup was seamless and the owner was super responsive.' },
  { id: 'r2', author: 'David K.', rating: 4, date: '2026-09-01', text: 'Great car, very well maintained. Minor delay at pickup but otherwise a perfect rental. Would definitely book again.' },
  { id: 'r3', author: 'Emily R.', rating: 5, date: '2026-08-20', text: 'Best rental experience I\'ve ever had. The car exceeded expectations in every way. Highly recommend this listing!' },
  { id: 'r4', author: 'James L.', rating: 5, date: '2026-08-10', text: 'Smooth booking process and the car was fantastic. Communication was excellent throughout the entire trip.' },
  { id: 'r5', author: 'Anita P.', rating: 4, date: '2026-07-28', text: 'Lovely car in great condition. Comfortable ride and great fuel economy. The return process was quick and easy.' },
]

function generateUnavailableDates(vehicleId) {
  const seed = parseInt(vehicleId.replace('v', ''), 10)
  const dates = []
  const today = new Date()
  const offsets = [5, 6, 15, 16, 17, 30 + seed, 31 + seed]
  for (const offset of offsets) {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const MILEAGE_MAP = { Electric: '12,450 mi', Sports: '8,230 mi', SUV: '22,100 mi', Luxury: '15,800 mi', Sedan: '31,200 mi', Motorcycle: '4,670 mi' }

function enrichVehicleDetail(vehicle) {
  if (!vehicle) return null

  const idx = parseInt(vehicle.id.replace('v', ''), 10)
  const others = ALL_IMAGES.filter((img) => img !== vehicle.image)
  const images = [vehicle.image, others[idx % others.length], others[(idx + 1) % others.length], others[(idx + 2) % others.length]]

  return {
    ...vehicle,
    images,
    mileage: MILEAGE_MAP[vehicle.type] || '18,500 mi',
    description: DESCRIPTIONS[vehicle.type] || DESCRIPTIONS.Sedan,
    features: FEATURES_MAP[vehicle.type] || FEATURES_MAP.Sedan,
    owner: MOCK_OWNERS[idx % MOCK_OWNERS.length],
    reviews: MOCK_REVIEWS.slice(0, 3 + (idx % 3)),
    unavailableDates: generateUnavailableDates(vehicle.id),
    pricing: {
      perDay: vehicle.price,
      platformFeeRate: 0.10,
      taxRate: 0.05,
      securityDeposit: vehicle.price >= 200 ? 1000 : vehicle.price >= 100 ? 500 : 250,
    },
    rules: ['No smoking in the vehicle', 'Return with same fuel level', 'Driver must be 21+', 'Valid license required'],
  }
}

async function mockGetById(id) {
  await new Promise((r) => setTimeout(r, 300))
  const vehicle = MOCK_VEHICLES.find((v) => v.id === id)
  return enrichVehicleDetail(vehicle)
}

// ── Public service API ────────────────────────────────────
export const vehicleService = {
  // Core queries — swap to api.get() when Django is ready
  getVehicles: USE_MOCK
    ? mockGetVehicles
    : (params) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : ''
        return api.get(`/vehicles${query}`)
      },

  getById: USE_MOCK ? mockGetById : (id) => api.get(`/vehicles/${id}`),

  // Mutations
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  
  getOwnerVehicles: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      // Add fake statuses for owner dashboard display
      const statuses = ['APPROVED', 'PENDING_VERIFICATION', 'DRAFT', 'SUSPENDED', 'REJECTED']
      return MOCK_VEHICLES.slice(0, 5).map((v, i) => ({
        ...v,
        status: statuses[i] || 'APPROVED'
      }))
    }
    return api.get('/vehicles/mine')
  },
  
  toggleFavorite: (id) => api.post(`/vehicles/${id}/favorite`),
  getFavorites: () => api.get('/vehicles/favorites'),
}
