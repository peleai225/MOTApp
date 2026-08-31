import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://agare.test/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  timeout: 12000,
})

// Injecter le token Bearer automatiquement
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Gérer l'expiration de session (401)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mot_token')
      localStorage.removeItem('mot_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: data  => api.post('/auth/register', data),
  login:    data  => api.post('/auth/login', data),
  logout:   ()    => api.post('/auth/logout'),
  me:       ()    => api.get('/auth/me'),
  update:   data  => api.put('/auth/me', data),
}

// ── Trajets (public) ─────────────────────────────────────────────────────────
export const trajetApi = {
  gares:      ()          => api.get('/gares'),
  rechercher: params      => api.get('/trajets', { params }),
  show:       id          => api.get(`/trajets/${id}`),
  sieges:     id          => api.get(`/trajets/${id}/sieges`),
}

// ── Réservations (auth) ──────────────────────────────────────────────────────
export const reservationApi = {
  index:  ()    => api.get('/reservations'),
  store:  data  => api.post('/reservations', data),
  show:   ref   => api.get(`/reservations/${ref}`),
  cancel: ref   => api.delete(`/reservations/${ref}`),
}

export default api
