/**
 * Route path constants — single source of truth for all route paths.
 * Import these instead of hardcoding path strings.
 */
export const ROUTES = {
  HOME: '/',

  // Vehicles (public)
  VEHICLES: '/vehicles',
  VEHICLE_DETAIL: '/vehicles/:id',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  KYC: '/kyc',

  // Booking (authenticated)
  BOOKING: '/booking/:vehicleId',

  // Renter dashboard
  DASHBOARD: '/dashboard',
  TRIPS: '/dashboard/trips',
  SAVED: '/dashboard/saved',

  // Owner
  OWNER: '/owner',
  OWNER_VEHICLES: '/owner/vehicles',
  OWNER_ADD_VEHICLE: '/owner/vehicles/new',
  OWNER_EDIT_VEHICLE: '/owner/vehicles/:id/edit',
  OWNER_BOOKINGS: '/owner/bookings',
  OWNER_CALENDAR: '/owner/calendar',
  OWNER_EARNINGS: '/owner/earnings',
  OWNER_VERIFICATION: '/owner/verification',

  // Account
  PROFILE: '/profile',
  SETTINGS: '/settings',
}

/**
 * Helper to build parameterized paths.
 * Usage: buildPath(ROUTES.VEHICLE_DETAIL, { id: '123' }) → '/vehicles/123'
 */
export function buildPath(template, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template
  )
}
