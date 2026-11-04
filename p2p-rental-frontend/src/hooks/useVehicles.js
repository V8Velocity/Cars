import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicles'

const KEYS = {
  all: ['vehicles'],
  list: (filters) => ['vehicles', 'list', filters],
  detail: (id) => ['vehicles', 'detail', id],
  favorites: ['vehicles', 'favorites'],
  mine: ['vehicles', 'mine'],
}

/**
 * Hook: list vehicles with filters, sorting, and pagination.
 * keepPreviousData prevents layout flicker during page changes.
 */
export function useVehicles(filters = {}) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => vehicleService.getVehicles(filters),
    placeholderData: keepPreviousData,
  })
}

/**
 * Hook: single vehicle by ID.
 */
export function useVehicle(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook: current owner's vehicles.
 */
export function useOwnerVehicles() {
  return useQuery({
    queryKey: KEYS.mine,
    queryFn: vehicleService.getOwnerVehicles,
  })
}

/**
 * Hook: user's favorites.
 */
export function useFavorites() {
  return useQuery({
    queryKey: KEYS.favorites,
    queryFn: vehicleService.getFavorites,
  })
}

/**
 * Hook: toggle favorite.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vehicleService.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.favorites })
    },
  })
}

/**
 * Hook: create a vehicle listing.
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vehicleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.mine })
    },
  })
}
