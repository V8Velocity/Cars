import { api } from './api'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (data) => api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/me'),

  updateProfile: (data) => api.patch('/auth/me', data),

  verifyKyc: (data) => api.post('/auth/kyc', data),

  refreshToken: () => api.post('/auth/refresh'),
}
