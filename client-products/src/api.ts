import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '')

const api = axios.create({
  baseURL: ${API_BASE_URL},
  headers: {
    'Content-Type': 'application/json',
  },
})

// Products API
export const productsApi = {
  getAll: (search?: string) => api.get('/products', { params: { search } }),
  getById: (id: number) => api.get(/products/),
  create: (data: { name: string; description?: string; productId: string }) =>
    api.post('/products', data),
  update: (id: number, data: { name?: string; description?: string; enabled?: boolean }) =>
    api.put(/products/, data),
  delete: (id: number) => api.delete(/products/),
}

// Admin Licenses API
export const licensesApi = {
  getAll: (params?: { search?: string; productId?: string; status?: string }) =>
    api.get('/admin/licenses', { params }),
  getById: (id: number) => api.get(/admin/licenses/),
  create: (data: { licenseKey: string; productId: string; notes?: string }) =>
    api.post('/admin/licenses', data),
  update: (id: number, data: { status?: string; enabled?: boolean; notes?: string }) =>
    api.put(/admin/licenses/, data),
  toggleEnabled: (id: number, enabled: boolean) =>
    api.patch(/admin/licenses//toggle, { enabled }),
  delete: (id: number) => api.delete(/admin/licenses/),
}

// Support API
export const supportApi = {
  search: (type: string, value: string) =>
    api.get('/support/search', { params: { type, value } }),
  getStats: () => api.get('/support/stats'),
}

export default api
