import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Products API
export const productsApi = {
  getAll: (search?: string) => api.get('/products', { params: { search } }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: { name: string; description?: string; productId: string }) =>
    api.post('/products', data),
  update: (id: number, data: { name?: string; description?: string; enabled?: boolean }) =>
    api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
}

// Admin Licenses API
export const licensesApi = {
  getAll: (params?: { search?: string; productId?: string; status?: string }) =>
    api.get('/admin/licenses', { params }),
  getById: (id: number) => api.get(`/admin/licenses/${id}`),
  create: (data: { licenseKey: string; productId: string; notes?: string }) =>
    api.post('/admin/licenses', data),
  update: (id: number, data: { status?: string; enabled?: boolean; notes?: string }) =>
    api.put(`/admin/licenses/${id}`, data),
  toggleEnabled: (id: number, enabled: boolean) =>
    api.patch(`/admin/licenses/${id}/toggle`, { enabled }),
  delete: (id: number) => api.delete(`/admin/licenses/${id}`),
}

// Support API
export const supportApi = {
  search: (type: string, value: string) =>
    api.get('/support/search', { params: { type, value } }),
  getStats: () => api.get('/support/stats'),
}

export default api

