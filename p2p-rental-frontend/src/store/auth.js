import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth store — the ONLY piece of global client state.
 * Persisted to localStorage so sessions survive page reload.
 *
 * Shape:
 *   user:  { id, email, name, role, avatar, kycVerified } | null
 *   token: string | null
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      get isAuthenticated() {
        return this.token !== null
      },

      setAuth: (user, token) =>
        set({ user, token }),

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      logout: () =>
        set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
