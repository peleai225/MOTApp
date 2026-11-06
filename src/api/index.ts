import axios, { type AxiosError } from 'axios'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { demoApi } from './demo'
import type {
  AuthResponse, Client, Gare, ProfilePayload, Reservation, ReservationPayload,
  ReservationsResponse, SearchParams, SiegesResponse, Trajet, TrajetsResponse,
} from '@/types'

/**
 * Mode d'accès aux données
 *  - live : API réelle uniquement (défaut en production)
 *  - demo : données locales (présentation, tests sans serveur)
 *  - auto : API réelle, bascule en démo si le serveur ne répond pas (défaut en développement)
 */
const configured = (import.meta.env.VITE_API_MODE || (import.meta.env.DEV ? 'auto' : 'live')) as 'live' | 'demo' | 'auto'
export const isDemo = ref(configured === 'demo')

// Un jeton du mode démo n'a pas de sens face au serveur réel
if (!isDemo.value && (localStorage.getItem('mot_token') || '').startsWith('demo-')) {
  localStorage.removeItem('mot_token')
  localStorage.removeItem('mot_user')
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 12000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('mot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Session expirée : on nettoie et on laisse le routeur renvoyer vers la connexion */
export const onUnauthorized = { handler: () => {} }

function isUnreachable(e: unknown) {
  const err = e as AxiosError
  return !err?.response && (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED' || err?.message === 'Network Error')
}

async function call<T>(live: () => Promise<{ data: T }>, demo: () => Promise<{ data: T }>): Promise<{ data: T }> {
  if (isDemo.value) return guard(demo)
  try {
    return await live()
  } catch (e) {
    if (configured === 'auto' && navigator.onLine && isUnreachable(e)) {
      isDemo.value = true
      // Un jeton du serveur réel n'a pas de sens en démo
      if (!(localStorage.getItem('mot_token') || '').startsWith('demo-')) {
        localStorage.removeItem('mot_token')
        localStorage.removeItem('mot_user')
      }
      toast('Serveur injoignable', { description: 'Mode démonstration activé : les données sont simulées sur cet appareil.' })
      return guard(demo)
    }
    if ((e as AxiosError)?.response?.status === 401) onUnauthorized.handler()
    throw e
  }
}

async function guard<T>(fn: () => Promise<{ data: T }>) {
  try {
    return await fn()
  } catch (e) {
    if ((e as AxiosError)?.response?.status === 401) onUnauthorized.handler()
    throw e
  }
}

/** Message lisible depuis une erreur API (validation Laravel ou autre) */
export function errorMessage(e: unknown, fallback = 'Une erreur est survenue. Réessayez.'): string {
  const err = e as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
  if (!err?.response) {
    return navigator.onLine ? 'Le serveur ne répond pas. Réessayez dans un instant.' : 'Pas de connexion internet.'
  }
  const data = err.response.data
  const first = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined
  return first || data?.message || fallback
}

export function fieldErrors(e: unknown): Record<string, string> {
  const errs = (e as AxiosError<{ errors?: Record<string, string[]> }>)?.response?.data?.errors || {}
  return Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
}

// ── Gares & trajets ─────────────────────────────────────────────────────
export const trajetApi = {
  gares: () =>
    call<Gare[]>(() => http.get('/gares'), () => demoApi.gares()),

  rechercher: (params: Partial<SearchParams>) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    return call<TrajetsResponse>(() => http.get('/trajets', { params: clean }), () => demoApi.rechercher(clean))
  },

  show: (id: number | string) =>
    call<Trajet>(() => http.get(`/trajets/${id}`), () => demoApi.show(id)),

  sieges: (id: number | string) =>
    call<SiegesResponse>(() => http.get(`/trajets/${id}/sieges`), () => demoApi.sieges(id)),
}

// ── Réservations ────────────────────────────────────────────────────────
export const reservationApi = {
  index: () =>
    call<ReservationsResponse>(() => http.get('/reservations'), () => demoApi.reservations()),

  store: (data: ReservationPayload) =>
    call<{ message: string; reservation: Reservation }>(() => http.post('/reservations', data), () => demoApi.reserver(data)),

  show: (ref: string) =>
    call<Reservation>(() => http.get(`/reservations/${encodeURIComponent(ref)}`), () => demoApi.reservation(ref)),

  cancel: (ref: string) =>
    call<{ message: string }>(() => http.delete(`/reservations/${encodeURIComponent(ref)}`), () => demoApi.annuler(ref)),
}

// ── Authentification ────────────────────────────────────────────────────
export const authApi = {
  register: (data: { nom: string; prenom: string; telephone: string; email?: string; password: string; password_confirmation: string }) =>
    call<AuthResponse>(() => http.post('/auth/register', data), () => demoApi.register(data)),

  login: (data: { telephone: string; password: string }) =>
    call<AuthResponse>(() => http.post('/auth/login', data), () => demoApi.login(data)),

  logout: () =>
    call<{ message: string }>(() => http.post('/auth/logout'), () => demoApi.logout()),

  me: () =>
    call<Client>(() => http.get('/auth/me'), () => demoApi.me()),

  update: (data: ProfilePayload) =>
    call<{ message: string; client: Client }>(() => http.put('/auth/me', data), () => demoApi.update(data)),
}

export default http
