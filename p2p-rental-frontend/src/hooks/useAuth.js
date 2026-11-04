import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'

/**
 * Hook: current user profile (server state).
 * Only fires if we have a token — avoids 401 on public pages.
 */
export function useCurrentUser() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getProfile,
    enabled: !!token,
  })
}

/**
 * Hook: login mutation.
 */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate(ROUTES.DASHBOARD)
    },
  })
}

/**
 * Hook: register mutation.
 */
export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate(ROUTES.KYC)
    },
  })
}

/**
 * Hook: logout.
 */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate(ROUTES.HOME)
    },
  })
}
