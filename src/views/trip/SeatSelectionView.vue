<template>
  <div class="page-container bg-slate-50">
    <PageHeader title="Choix des sièges" />

    <div v-if="loading" class="flex-1 px-5 py-6 flex flex-col gap-4">
      <div class="skeleton h-64" />
    </div>

    <div v-else class="flex-1 flex flex-col">
      <div class="px-5 py-4 flex-1 overflow-y-auto">
        <!-- Légende -->
        <div class="flex items-center gap-4 mb-4 text-xs text-slate-500">
          <span class="flex items-center gap-1.5"><span class="w-5 h-5 rounded border-2 border-slate-200 bg-white inline-block" /> Libre</span>
          <span class="flex items-center gap-1.5"><span class="w-5 h-5 rounded bg-slate-300 inline-block" /> Occupé</span>
          <span class="flex items-center gap-1.5"><span class="w-5 h-5 rounded bg-primary inline-block" /> Sélectionné</span>
        </div>

        <!-- Avant du bus -->
        <div class="text-center text-xs text-slate-400 mb-3 flex items-center gap-2">
          <div class="flex-1 h-px bg-slate-200" />
          <span>🚌 Avant du bus</span>
          <div class="flex-1 h-px bg-slate-200" />
        </div>

        <!-- Plan des sièges -->
        <div class="bg-white rounded-2xl p-4 shadow-sm overflow-x-auto">
          <div class="flex flex-col gap-2 min-w-[200px]">
            <div v-for="(rangee, ri) in rangees" :key="ri" class="flex items-center justify-center gap-2">
              <div class="flex gap-1">
                <button
                  v-for="siege in rangee.slice(0, 2)"
                  :key="siege?.numero"
                  :disabled="!siege || !siege.disponible"
                  class="w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center"
                  :class="siegeClass(siege)"
                  @click="toggleSiege(siege)"
                >
                  {{ siege?.numero?.replace(/[A-Z]/g, '') || '' }}
                </button>
              </div>
              <div class="w-4" />
              <div class="flex gap-1">
                <button
                  v-for="siege in rangee.slice(2)"
                  :key="siege?.numero"
                  :disabled="!siege || !siege.disponible"
                  class="w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center"
                  :class="siegeClass(siege)"
                  @click="toggleSiege(siege)"
                >
                  {{ siege?.numero?.replace(/[A-Z]/g, '') || '' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Attribution auto -->
        <button class="mt-4 w-full text-center text-sm text-primary font-medium" @click="autoAssign">
          Attribution automatique
        </button>
      </div>

      <!-- Résumé + CTA -->
      <div class="px-5 py-4 bg-white border-t border-slate-100">
        <div class="flex justify-between text-sm mb-3">
          <span class="text-slate-500">
            {{ selected.length ? `Siège(s) : ${selected.join(', ')}` : 'Aucun siège sélectionné' }}
          </span>
          <span class="font-bold text-neutral-900">{{ fmt(total) }}</span>
        </div>
        <Button class="w-full" :disabled="!canProceed" @click="proceed">
          Passer au paiement →
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trajetApi } from '@/api'
import { useSearchStore } from '@/stores/search'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'

const route  = useRoute()
const router = useRouter()
const search = useSearchStore()

const loading  = ref(true)
const config   = ref(null)
const selected = ref<string[]>([])

const rangees = computed(() => config.value?.rangees || [])

const total = computed(() => {
  const trip = search.results.find(t => t.id == route.params.id)
  return (trip?.prix_adulte || 0) * search.params.places
})

const canProceed = computed(() => selected.value.length === search.params.places || selected.value.length === 0)

function siegeClass(siege) {
  if (!siege) return 'opacity-0 pointer-events-none'
  if (!siege.disponible) return 'bg-slate-200 text-slate-400 cursor-not-allowed'
  if (selected.value.includes(siege.numero)) return 'bg-primary text-white scale-105 shadow-sm'
  return 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-primary'
}

function toggleSiege(siege) {
  if (!siege?.disponible) { toast.info('Siège déjà réservé'); return }
  const idx = selected.value.indexOf(siege.numero)
  if (idx >= 0) {
    selected.value.splice(idx, 1)
  } else if (selected.value.length < search.params.places) {
    selected.value.push(siege.numero)
  } else {
    toast.info(`Tu peux sélectionner ${search.params.places} siège(s) maximum`)
  }
}

function autoAssign() {
  selected.value = []
  router.push({ name: 'payment', query: { depart: route.params.id } })
}

function proceed() {
  const q = { depart: route.params.id }
  if (selected.value.length) q.sieges = selected.value.join(',')
  router.push({ name: 'payment', query: q })
}

function fmt(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA' }

onMounted(async () => {
  try {
    const { data } = await trajetApi.sieges(route.params.id)
    config.value = data
  } finally {
    loading.value = false
  }
})
</script>
