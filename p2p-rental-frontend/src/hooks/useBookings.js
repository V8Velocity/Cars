import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/bookings'

const KEYS = {
  renter: (status) => ['bookings', 'renter', status],
  owner: (status) => ['bookings', 'owner', status],
  detail: (id) => ['bookings', 'detail', id],
  earnings: (params) => ['bookings', 'earnings', params],
}

/**
 * Hook: renter's bookings.
 */
export function useRenterBookings(status) {
  return useQuery({
    queryKey: KEYS.renter(status),
    queryFn: () => bookingService.getRenterBookings(status),
  })
}

/**
 * Hook: owner's bookings.
 */
export function useOwnerBookings(status) {
  return useQuery({
    queryKey: KEYS.owner(status),
    queryFn: () => bookingService.getOwnerBookings(status),
  })
}

/**
 * Hook: booking detail.
 */
export function useBooking(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook: create a booking.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

/**
 * Hook: owner earnings.
 */
export function useEarnings(params) {
  return useQuery({
    queryKey: KEYS.earnings(params),
    queryFn: () => bookingService.getEarnings(params),
  })
}
