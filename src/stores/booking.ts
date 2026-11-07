import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { trajetApi } from '@/api'
import type { Trajet } from '@/types'

const K = 'mot_booking'

interface Draft { trip: Trajet | null; places: number; seats: string[] }

function read(): Draft {
  try { return JSON.parse(sessionStorage.getItem(K) || '') } catch { return { trip: null, places: 1, seats: [] } }
}

/** Réservation en cours : trajet choisi, nombre de places, sièges. Survit à un rechargement de page. */
export const useBookingStore = defineStore('booking', () => {
  const init = read()
  const trip = ref<Trajet | null>(init.trip)
  const places = ref<number>(init.places || 1)
  const seats = ref<string[]>(init.seats || [])

  watch([trip, places, seats], () => {
    sessionStorage.setItem(K, JSON.stringify({ trip: trip.value, places: places.value, seats: seats.value }))
  }, { deep: true })

  const total = computed(() => (trip.value?.prix_adulte || 0) * places.value)

  /** Charge le trajet si besoin (détail complet avec car et arrêts) */
  async function ensureTrip(id: number | string, force = false) {
    if (!force && trip.value && String(trip.value.id) === String(id) && trip.value.bus) return trip.value
    const { data } = await trajetApi.show(id)
    if (!trip.value || String(trip.value.id) !== String(id)) seats.value = []
    trip.value = data
    return data
  }

  function start(t: Trajet, nbPlaces: number) {
    if (!trip.value || trip.value.id !== t.id) seats.value = []
    trip.value = { ...trip.value, ...t } as Trajet
    places.value = nbPlaces
  }

  function reset() {
    trip.value = null
    seats.value = []
    sessionStorage.removeItem(K)
  }

  return { trip, places, seats, total, ensureTrip, start, reset }
})
