import axios from 'axios'
import type { Gare, Trajet, Reservation, User, SearchParams } from '@/types'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 12000 })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('mot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) { localStorage.clear(); window.location.href = '/login' }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: Omit<User, 'id'> & { password: string; password_confirmation: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  login: (data: { telephone: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  update: (data: Partial<User>) => api.put<User>('/auth/me', data)
}

export const trajetApi = {
  gares: () => api.get<Gare[]>('/gares'),
  rechercher: (params: SearchParams) => api.get<Trajet[]>('/trajets', { params }),
  show: (id: number | string) => api.get<Trajet>(`/trajets/${id}`),
  sieges: (id: number | string) =>
    api.get<{ sieges: { numero: string; disponible: boolean }[] }>(`/trajets/${id}/sieges`)
}

export const reservationApi = {
  index: () => api.get<Reservation[]>('/reservations'),
  store: (data: { trajet_id: number; sieges: string[]; mode_paiement: string; nom_passager?: string }) =>
    api.post<Reservation>('/reservations', data),
  show: (ref: string) => api.get<Reservation>(`/reservations/${ref}`),
  cancel: (ref: string) => api.delete(`/reservations/${ref}`)
}

export default api
