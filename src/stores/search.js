import { defineStore } from 'pinia'
import { ref } from 'vue'
import { trajetApi } from '@/api'

export const useSearchStore = defineStore('search', () => {
  const gares      = ref([])
  const results    = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  const params = ref({
    origine:     null,
    destination: null,
    date:        new Date().toISOString().slice(0, 10),
    places:      1,
  })

  async function loadGares() {
    if (gares.value.length) return
    const { data } = await trajetApi.gares()
    gares.value = data
  }

  async function search() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await trajetApi.rechercher(params.value)
      results.value  = data.trajets || []
    } catch (e) {
      error.value   = e.response?.data?.message || 'Erreur réseau'
      results.value = []
    } finally {
      loading.value = false
    }
  }

  function swapVilles() {
    const tmp        = params.value.origine
    params.value.origine     = params.value.destination
    params.value.destination = tmp
  }

  return { gares, results, loading, error, params, loadGares, search, swapVilles }
})
