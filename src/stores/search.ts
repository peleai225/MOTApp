import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { isDemo, trajetApi } from '@/api'
import { isoDate } from '@/lib/format'
import type { Gare } from '@/types'

export interface RecentSearch { origine: number; destination: number; at: number }

const K_PARAMS = 'mot_search'
const K_RECENT = 'mot_recent_searches'
const K_GARES = 'mot_gares'
const K_HOME_GARE = 'mot_home_gare'

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

export const useSearchStore = defineStore('search', () => {
  const gares = ref<Gare[]>(read<Gare[]>(K_GARES, []))
  const garesError = ref(false)
  /** Vrai dès qu'une liste (même vide) a été reçue du serveur */
  const garesLoaded = ref(false)

  const saved = read<{ origine: number | null; destination: number | null; places: number }>(K_PARAMS, { origine: null, destination: null, places: 1 })
  const origine = ref<number | null>(saved.origine)
  const destination = ref<number | null>(saved.destination)
  const date = ref<string>(isoDate())
  const places = ref<number>(saved.places || 1)

  const recent = ref<RecentSearch[]>(read<RecentSearch[]>(K_RECENT, []))
  /** Gare favorite pour le tableau des départs */
  const homeGare = ref<number | null>(read<number | null>(K_HOME_GARE, null))

  watch([origine, destination, places], () => {
    localStorage.setItem(K_PARAMS, JSON.stringify({ origine: origine.value, destination: destination.value, places: places.value }))
  })
  watch(homeGare, v => localStorage.setItem(K_HOME_GARE, JSON.stringify(v)))

  let loadingGares: Promise<void> | null = null
  function loadGares(force = false) {
    if (gares.value.length && !force && !garesError.value) {
      // rafraîchit en arrière-plan sans bloquer l'affichage
      if (!loadingGares) loadingGares = fetchGares().finally(() => { loadingGares = null })
      return Promise.resolve()
    }
    if (!loadingGares) loadingGares = fetchGares().finally(() => { loadingGares = null })
    return loadingGares
  }

  async function fetchGares() {
    try {
      const { data } = await trajetApi.gares()
      gares.value = Array.isArray(data) ? data : []
      garesError.value = false
      garesLoaded.value = true
      // Les gares simulées ne sont jamais gardées : elles fausseraient le mode réel
      if (!isDemo.value) localStorage.setItem(K_GARES, JSON.stringify(gares.value))
    } catch (e) {
      garesError.value = true
      if (!gares.value.length) throw e
    }
  }

  const gareById = (id: number | string | null | undefined) =>
    id == null ? undefined : gares.value.find(g => String(g.id) === String(id))

  const garesByCity = computed(() => {
    const map = new Map<string, Gare[]>()
    for (const g of gares.value) {
      const k = g.ville || g.nom
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(g)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr'))
  })

  function swap() {
    const o = origine.value
    origine.value = destination.value
    destination.value = o
  }

  function remember(o: number, d: number) {
    const list = recent.value.filter(r => !(r.origine === o && r.destination === d))
    list.unshift({ origine: o, destination: d, at: Date.now() })
    recent.value = list.slice(0, 5)
    localStorage.setItem(K_RECENT, JSON.stringify(recent.value))
  }

  function forgetRecent() {
    recent.value = []
    localStorage.removeItem(K_RECENT)
  }

  return {
    gares, garesError, garesLoaded, garesByCity, gareById, loadGares,
    origine, destination, date, places, swap,
    recent, remember, forgetRecent, homeGare,
  }
})
