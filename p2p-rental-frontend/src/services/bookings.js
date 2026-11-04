import { api } from './api'

// ── Toggle when Django REST API is ready ──────────────────
const USE_MOCK = true

// ── Mock data ─────────────────────────────────────────────
const MOCK_BOOKINGS = [
  {
    id: 'b1',
    vehicleId: 'v1',
    vehicle: { name: 'Tesla Model S Plaid', image: '/tesla_model_s.jpg', location: 'San Francisco, CA' },
    owner: { name: 'Priya Sharma', avatar: '', rating: 4.9, responseTime: '< 30 min' },
    pickup: '2026-10-15',
    return: '2026-10-18',
    status: 'Confirmed', // Pending, Confirmed, Handover, Active, Returned, Completed, Cancelled
    paymentStatus: 'Paid',
    total: 514,
    cancellationPolicy: 'Free cancellation up to 48 hours before pickup.',
    bookingDate: '2026-09-25T10:00:00Z',
  },
  {
    id: 'b2',
    vehicleId: 'v3',
    vehicle: { name: 'Porsche 911 GT3', image: '/porsche_911_gt3.jpg', location: 'Los Angeles, CA' },
    owner: { name: 'David Chen', avatar: '', rating: 5.0, responseTime: '< 1 hour' },
    pickup: '2026-11-05',
    return: '2026-11-07',
    status: 'Pending',
    paymentStatus: 'Processing',
    total: 687,
    cancellationPolicy: 'Strict cancellation. 50% refund.',
    bookingDate: '2026-09-28T14:30:00Z',
  },
  {
    id: 'b3',
    vehicleId: 'v8',
    vehicle: { name: 'Tesla Model 3 LR', image: '/tesla_model_s.jpg', location: 'Seattle, WA' },
    owner: { name: 'Sarah Miller', avatar: '', rating: 4.7, responseTime: '< 15 min' },
    pickup: '2026-08-10',
    return: '2026-08-14',
    status: 'Completed',
    paymentStatus: 'Paid',
    total: 410,
    cancellationPolicy: 'Free cancellation up to 24 hours before pickup.',
    bookingDate: '2026-08-01T09:15:00Z',
  }
]

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export const bookingService = {
  create: async (data) => {
    if (USE_MOCK) {
      await delay(800)
      return { id: `b${Date.now()}`, ...data, status: 'Pending' }
    }
    return api.post('/bookings', data)
  },

  calculatePrice: async (vehicleId, startDate, endDate) => {
    if (USE_MOCK) {
      await delay(500)
      // Note: In real life this requires fetching the vehicle. We hardcode mock assumptions here.
      // E.g., assume $150/day if vehicle not fetched here, but actually we should pass vehicle price 
      // or fetch it. To be safe, we just use a dummy 150 if not specified, 
      // but ideally the backend calculates this accurately.
      const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      // We will pass perDay from the frontend just for the mock calculation so it matches the vehicle
      return {
        days,
        platformFeeRate: 0.10,
        taxRate: 0.05,
      }
    }
    return api.post('/bookings/calculate', { vehicleId, startDate, endDate })
  },

  getById: async (id) => {
    if (USE_MOCK) {
      await delay(400)
      const b = MOCK_BOOKINGS.find((x) => x.id === id)
      if (!b) throw new Error('Booking not found')
      return b
    }
    return api.get(`/bookings/${id}`)
  },

  cancel: async (id) => {
    if (USE_MOCK) {
      await delay(600)
      return { success: true }
    }
    return api.post(`/bookings/${id}/cancel`)
  },

  getRenterBookings: async (status) => {
    if (USE_MOCK) {
      await delay(600)
      let data = MOCK_BOOKINGS
      if (status) {
        if (status === 'upcoming') data = data.filter(b => ['Pending', 'Confirmed'].includes(b.status))
        else if (status === 'past') data = data.filter(b => ['Completed', 'Cancelled'].includes(b.status))
        else data = data.filter(b => b.status.toLowerCase() === status.toLowerCase())
      }
      return data
    }
    const query = status ? `?status=${status}` : ''
    return api.get(`/bookings/renter${query}`)
  },

  getOwnerBookings: async (status) => {
    if (USE_MOCK) {
      await delay(600)
      return MOCK_BOOKINGS
    }
    const query = status ? `?status=${status}` : ''
    return api.get(`/bookings/owner${query}`)
  },

  approve: (id) => api.post(`/bookings/${id}/approve`),
  reject: (id) => api.post(`/bookings/${id}/reject`),
  complete: (id) => api.post(`/bookings/${id}/complete`),
  rate: (id, data) => api.post(`/bookings/${id}/rate`, data),

  getEarnings: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get(`/bookings/earnings${query}`)
  },
}
