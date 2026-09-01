import { ref } from 'vue'
import { defineStore } from 'pinia'
import { trajetApi } from '@/api'
import type { Gare, Trajet, SearchParams } from '@/types'

export const useSearchStore = defineStore('search', () => {
  const gares = ref<Gare[]>([])
  const results = ref<Trajet[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const params = ref<SearchParams>({ origine: '', destination: '', date: '', places: 1 })

  async function loadGares() {
    if (gares.value.length > 0) return
    const { data } = await trajetApi.gares()
    gares.value = data
  }

  async function search() {
    loading.value = true; error.value = null
    try {
      const { data } = await trajetApi.rechercher(params.value)
      results.value = data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function swapVilles() {
    const tmp = params.value.origine
    params.value.origine = params.value.destination
    params.value.destination = tmp
  }

  return { gares, results, loading, error, params, loadGares, search, swapVilles }
})
