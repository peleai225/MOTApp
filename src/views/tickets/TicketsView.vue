<template>
  <div class="page flex flex-col">
    <!-- Header Nuit -->
    <div class="bg-nuit px-5 pt-safe pb-5">
      <h1 class="font-display text-xl font-bold text-white mt-3 mb-4">Mes Billets</h1>
      <div class="flex gap-1 bg-white/10 rounded-xl p-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 py-2 rounded-lg font-sans text-sm font-semibold transition-all duration-200"
          :class="activeTab === tab.key ? 'bg-white text-encre shadow-sm' : 'text-white/50'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Contenu -->
    <div class="flex-1 px-4 py-5 overflow-y-auto pb-28">

      <!-- Skeleton -->
      <div v-if="loading" class="flex flex-col gap-4">
        <div v-for="i in 3" :key="i" class="skeleton h-32" />
      </div>

      <!-- Vide -->
      <div v-else-if="!filtered.length" class="flex flex-col items-center py-16 gap-4 text-center px-8">
        <svg class="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.25" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
        </svg>
        <p class="font-display text-lg font-semibold text-encre">
          {{ activeTab === 'avenir' ? 'Aucun voyage prévu' : 'Aucun voyage passé' }}
        </p>
        <p v-if="activeTab === 'avenir'" class="font-sans text-sm text-pierre leading-relaxed">
          Réserve ton prochain bus en quelques secondes.
        </p>
        <AppButton v-if="activeTab === 'avenir'" class="max-w-[220px]" @click="router.push('/')">
          Chercher un trajet
        </AppButton>
      </div>

      <!-- Liste tickets style physique -->
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="t in filtered"
          :key="t.reference"
          class="ticket-card cursor-pointer active:scale-[0.98] transition-transform"
          @click="router.push(`/billet/${t.reference}`)"
        >
          <!-- Header ticket -->
          <div class="ticket-header flex items-center justify-between">
            <div>
              <p class="font-mono text-2xs text-white/40 tracking-widest uppercase">MoT Transport</p>
              <p class="font-mono text-xs text-white/70 tracking-widest mt-0.5">{{ t.reference }}</p>
            </div>
            <AppBadge :status="t.statut" />
          </div>

          <!-- Ligne perforée -->
          <div class="ticket-tear" />

          <!-- Corps ticket -->
          <div class="ticket-body">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="font-mono text-2xs text-pierre uppercase tracking-widest">Départ</p>
                <p class="font-display text-lg font-bold text-encre uppercase leading-tight">
                  {{ t.trajet?.origine }}
                </p>
              </div>
              <svg class="w-5 h-5 text-route flex-shrink-0 mx-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
              </svg>
              <div class="text-right">
                <p class="font-mono text-2xs text-pierre uppercase tracking-widest">Arrivée</p>
                <p class="font-display text-lg font-bold text-encre uppercase leading-tight">
                  {{ t.trajet?.destination }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-200/60">
              <p class="font-sans text-xs text-pierre">
                {{ t.trajet?.date_depart }} · {{ t.trajet?.heure }}
              </p>
              <p class="font-display text-sm font-bold text-encre">{{ fmt(t.montant_total) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reservationApi } from '@/api'
import AppBadge  from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router    = useRouter()
const loading   = ref(true)
const tickets   = ref([])
const activeTab = ref('avenir')
const today     = new Date().toISOString().slice(0, 10)

const tabs = [{ key: 'avenir', label: 'À venir' }, { key: 'passes', label: 'Passés' }]

const filtered = computed(() =>
  activeTab.value === 'avenir'
    ? tickets.value.filter(t => t.statut === 'valide' && (t.trajet?.date_depart || '') >= today)
    : tickets.value.filter(t => t.statut !== 'valide' || (t.trajet?.date_depart || '') < today)
)

function fmt(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA' }

onMounted(async () => {
  try {
    const { data } = await reservationApi.index()
    tickets.value = data.reservations || []
  } finally {
    loading.value = false
  }
})
</script>
