import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'

/**
 * Guard: requires authentication.
 * Redirects to /login and preserves the intended destination.
 */
export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * Guard: requires renter or admin role.
 */
export function RenterRoute() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  if (role !== 'renter' && role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

/**
 * Guard: requires owner or admin role.
 */
export function OwnerRoute() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  if (role !== 'owner' && role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

/**
 * Guard: requires admin role.
 */
export function AdminRoute() {
  const user = useAuthStore((s) => s.user)

  if (user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

/**
 * Guard: only accessible when NOT authenticated (login, register).
 * Redirects to dashboard if already signed in.
 */
export function GuestRoute() {
  const token = useAuthStore((s) => s.token)

  if (token) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
