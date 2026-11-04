import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/components/layout/RootLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OwnerLayout from '@/components/layout/OwnerLayout'
import { ProtectedRoute, GuestRoute } from './guards'

// ─── Pages ───────────────────────────────────────────────
import HomePage from '@/pages/home/HomePage'
import VehiclesPage from '@/pages/vehicles/VehiclesPage'
import VehicleDetailPage from '@/pages/vehicles/VehicleDetailPage'
import BookingPage from '@/pages/booking/BookingPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import KycPage from '@/pages/auth/KycPage'

// Renter
import DashboardPage from '@/pages/renter/DashboardPage'
import TripsPage from '@/pages/renter/TripsPage'
import SavedPage from '@/pages/renter/SavedPage'

// Owner
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage'
import OwnerVehiclesPage from '@/pages/owner/OwnerVehiclesPage'
import AddVehiclePage from '@/pages/owner/AddVehiclePage'
import EditVehiclePage from '@/pages/owner/EditVehiclePage'
import OwnerBookingsPage from '@/pages/owner/OwnerBookingsPage'
import CalendarPage from '@/pages/owner/CalendarPage'
import EarningsPage from '@/pages/owner/EarningsPage'
import OwnerVerificationPage from '@/pages/owner/OwnerVerificationPage'

// Account
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'

// ─── Router ──────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ── Public routes ──────────────────────────────────
      { index: true, element: <HomePage /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'vehicles/:id', element: <VehicleDetailPage /> },

      // ── Guest-only routes (redirect if already signed in)
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'verify-email', element: <VerifyEmailPage /> },
        ],
      },

      // ── Authenticated routes ───────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'kyc', element: <KycPage /> },
          { path: 'booking/:vehicleId', element: <BookingPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },

          // Renter dashboard
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'trips', element: <TripsPage /> },
              { path: 'saved', element: <SavedPage /> },
            ],
          },

          // Owner panel
          {
            path: 'owner',
            element: <OwnerLayout />,
            children: [
              { index: true, element: <OwnerDashboardPage /> },
              { path: 'vehicles', element: <OwnerVehiclesPage /> },
              { path: 'vehicles/new', element: <AddVehiclePage /> },
              { path: 'vehicles/:id/edit', element: <EditVehiclePage /> },
              { path: 'bookings', element: <OwnerBookingsPage /> },
              { path: 'calendar', element: <CalendarPage /> },
              { path: 'earnings', element: <EarningsPage /> },
              { path: 'verification', element: <OwnerVerificationPage /> },
            ],
          },
        ],
      },

      // ── 404 ────────────────────────────────────────────
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
