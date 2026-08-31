<template>
  <div class="page flex flex-col">
    <!-- Header Nuit -->
    <div class="bg-nuit px-5 pt-safe pb-5">
      <button @click="router.back()" class="mt-4 mb-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="font-display text-xl font-bold text-white leading-tight">
        {{ gareName(search.params.origine) }} → {{ gareName(search.params.destination) }}
      </h1>
      <p class="font-sans text-xs text-white/50 mt-1">
        {{ formatDate(search.params.date) }} · {{ search.params.places }} voyageur{{ search.params.places > 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Liste -->
    <div class="flex-1 px-4 py-5 overflow-y-auto pb-28">

      <!-- Skeleton -->
      <div v-if="search.loading" class="flex flex-col gap-4">
        <div v-for="i in 3" :key="i" class="skeleton h-[110px]" />
      </div>

      <!-- Erreur -->
      <div v-else-if="search.error" class="flex flex-col items-center py-20 gap-4 text-center">
        <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
        </svg>
        <p class="font-display text-base font-semibold text-encre">Impossible de charger les trajets</p>
        <p class="font-sans text-sm text-pierre">Vérifie ta connexion et réessaie.</p>
        <AppButton class="max-w-[200px]" @click="search.search()">Réessayer</AppButton>
      </div>

      <!-- Vide -->
      <div v-else-if="!search.results.length" class="flex flex-col items-center py-20 gap-4 text-center">
        <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
        </svg>
        <p class="font-display text-base font-semibold text-encre">Aucun bus disponible</p>
        <p class="font-sans text-sm text-pierre">Essaie une autre date ou une autre destination.</p>
        <AppButton variant="outline" class="max-w-[220px]" @click="router.back()">Modifier la recherche</AppButton>
      </div>

      <!-- Résultats -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="t in sorted"
          :key="t.id"
          class="bg-white rounded-card shadow-card overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          @click="router.push(`/trajet/${t.id}`)"
        >
          <!-- Bandeau urgence places -->
          <div
            v-if="t.places_disponibles <= 5"
            class="bg-braise px-4 py-1.5 flex items-center gap-2"
          >
            <svg class="w-3.5 h-3.5 text-yellow-700 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="font-sans text-2xs font-semibold text-yellow-800 uppercase tracking-wide">
              Plus que {{ t.places_disponibles }} place{{ t.places_disponibles > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="p-4">
            <!-- Horaires -->
            <div class="flex items-center gap-3">
              <div class="text-center w-14">
                <p class="font-display text-xl font-bold text-encre leading-none">{{ t.heure_depart }}</p>
                <p class="font-sans text-2xs text-pierre mt-1 truncate">{{ t.origine.nom?.split(' - ')[0] }}</p>
              </div>

              <div class="flex-1 flex flex-col items-center gap-1">
                <p class="font-mono text-2xs text-pierre">
                  {{ t.duree_minutes ? Math.floor(t.duree_minutes/60)+'h'+('0'+t.duree_minutes%60).slice(-2) : '' }}
                </p>
                <div class="flex items-center w-full gap-1">
                  <div class="w-1.5 h-1.5 rounded-full border-2 border-pierre" />
                  <div class="flex-1 border-t border-dashed border-slate-200" />
                  <svg class="w-3 h-3 text-route" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                  </svg>
                  <div class="flex-1 border-t border-dashed border-slate-200" />
                  <div class="w-1.5 h-1.5 rounded-full bg-route" />
                </div>
              </div>

              <div class="text-center w-14">
                <p class="font-display text-xl font-bold text-encre leading-none">{{ t.heure_arrivee || '—' }}</p>
                <p class="font-sans text-2xs text-pierre mt-1 truncate">{{ t.destination.nom?.split(' - ')[0] }}</p>
              </div>
            </div>

            <!-- Bas de card -->
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span class="font-sans text-xs text-pierre flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :class="t.places_disponibles > 5 ? 'bg-green-500' : 'bg-yellow-500'" />
                {{ t.places_disponibles }} places
              </span>
              <div class="flex items-center gap-1">
                <span class="font-display text-lg font-bold text-encre">{{ fmt(t.prix_adulte) }}</span>
                <svg class="w-4 h-4 text-route" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const search = useSearchStore()

const sorted = computed(() => [...search.results].sort((a, b) => a.heure_depart.localeCompare(b.heure_depart)))

function gareName(id) { return search.gares.find(g => g.id === id)?.nom || '?' }
function formatDate(d) {
  if (!d) return ''
  const today = new Date().toISOString().slice(0, 10)
  if (d === today) return 'Aujourd\'hui'
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
function fmt(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA' }

onMounted(() => search.search())
</script>
