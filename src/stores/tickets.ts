import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isDemo, reservationApi } from '@/api'
import { useAuthStore } from './auth'
import { minutesUntil } from '@/lib/format'
import type { Reservation } from '@/types'

interface Cache { list: Reservation[]; details: Record<string, Reservation>; syncedAt: number | null }

/**
 * Billets du client, gardés sur l'appareil pour rester consultables
 * sans réseau (à la gare, dans le car…).
 */
export const useTicketsStore = defineStore('tickets', () => {
  const auth = useAuthStore()
  const list = ref<Reservation[]>([])
  const details = ref<Record<string, Reservation>>({})
  const syncedAt = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let loadedFor: number | null = null

  // Cache séparé en démo : des billets simulés ne doivent jamais apparaître sur un vrai compte
  const key = () => `mot_tickets_${isDemo.value ? 'demo_' : ''}${auth.user?.id ?? 'anon'}`

  function hydrate() {
    if (loadedFor === (auth.user?.id ?? null)) return
    loadedFor = auth.user?.id ?? null
    try {
      const c: Cache = JSON.parse(localStorage.getItem(key()) || '')
      list.value = c.list || []
      details.value = c.details || {}
      syncedAt.value = c.syncedAt
    } catch {
      list.value = []; details.value = {}; syncedAt.value = null
    }
  }

  function persist() {
    const c: Cache = { list: list.value, details: details.value, syncedAt: syncedAt.value }
    try { localStorage.setItem(key(), JSON.stringify(c)) } catch { /* quota */ }
  }

  const isUpcoming = (t: Reservation) =>
    t.statut === 'valide' && !!t.trajet && minutesUntil(t.trajet.date_depart, t.trajet.heure) > -90

  const upcoming = computed(() =>
    list.value.filter(isUpcoming).sort((a, b) =>
      `${a.trajet!.date_depart} ${a.trajet!.heure}`.localeCompare(`${b.trajet!.date_depart} ${b.trajet!.heure}`)),
  )
  const past = computed(() =>
    list.value.filter(t => !isUpcoming(t)).sort((a, b) =>
      `${b.trajet?.date_depart} ${b.trajet?.heure}`.localeCompare(`${a.trajet?.date_depart} ${a.trajet?.heure}`)),
  )
  const next = computed(() => upcoming.value[0] ?? null)

  async function refresh() {
    if (!auth.isLoggedIn) return
    hydrate()
    loading.value = true
    error.value = null
    try {
      const { data } = await reservationApi.index()
      list.value = data.reservations || []
      syncedAt.value = Date.now()
      persist()
    } catch {
      error.value = list.value.length ? 'offline' : 'failed'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(ref: string): Promise<Reservation> {
    hydrate()
    try {
      const { data } = await reservationApi.show(ref)
      details.value[ref] = data
      upsert(data)
      persist()
      return data
    } catch (e) {
      const cached = details.value[ref] || list.value.find(t => t.reference === ref)
      if (cached) return cached
      throw e
    }
  }

  function cached(ref: string) {
    hydrate()
    return details.value[ref] || list.value.find(t => t.reference === ref) || null
  }

  function upsert(t: Reservation) {
    const i = list.value.findIndex(x => x.reference === t.reference)
    if (i >= 0) list.value[i] = { ...list.value[i], ...t }
    else list.value.unshift(t)
  }

  function add(t: Reservation) {
    hydrate()
    details.value[t.reference] = t
    upsert(t)
    persist()
  }

  async function cancel(ref: string) {
    const { data } = await reservationApi.cancel(ref)
    const t = cached(ref)
    if (t) {
      const updated = { ...t, statut: 'annule' as const }
      details.value[ref] = { ...(details.value[ref] || t), statut: 'annule' }
      upsert(updated)
      persist()
    }
    return data.message
  }

  function clear() {
    list.value = []; details.value = {}; syncedAt.value = null; loadedFor = null
  }

  return { list, upcoming, past, next, syncedAt, loading, error, hydrate, refresh, fetchOne, cached, add, cancel, clear }
})
