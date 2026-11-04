/**
 * Base API client.
 * Wraps fetch with auth headers, base URL, and error handling.
 * All service modules (auth, vehicles, bookings) use this.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const { body, headers: customHeaders, ...rest } = options

  // Read token from localStorage (Zustand persists here)
  let token = null
  try {
    const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    token = authStorage?.state?.token
  } catch {
    // Ignore parse errors
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
      data
    )
  }

  // Handle 204 No Content
  if (response.status === 204) return null

  return response.json()
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

export { ApiError }
