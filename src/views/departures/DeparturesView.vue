<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, CloudOff, MapPin, MoonStar } from 'lucide-vue-next'
import PullToRefresh from '@/components/ui/PullToRefresh.vue'
import Segmented from '@/components/ui/Segmented.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import DepartureRow from '@/components/mot/DepartureRow.vue'
import StationSheet from '@/components/mot/StationSheet.vue'
import { useSearchStore } from '@/stores/search'
import { useBookingStore } from '@/stores/booking'
import { useTabReselect } from '@/composables/useTabReselect'
import { trajetApi } from '@/api'
import { addDays, isoDate, PERIOD_LABEL, period, type Period } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import type { Gare, Trajet } from '@/types'

defineOptions({ name: 'DeparturesView' })

const router = useRouter()
const search = useSearchStore()
const booking = useBookingStore()

const ptr = ref<InstanceType<typeof PullToRefresh> | null>(null)
useTabReselect('departures', computed(() => ptr.value?.el))

const day = ref<'today' | 'tomorrow'>('today')
const pickerOpen = ref(false)
const filter = ref<number | null>(null)
const trips = ref<Trajet[]>([])
const state = ref<'loading' | 'ready' | 'error' | 'nogare'>('loading')
let loadedAt = 0

const gare = computed<Gare | undefined>(() =>
  search.gareById(search.homeGare) ||
  search.gareById(search.origine) ||
  search.gares.find(g => /yopougon/i.test(g.nom)) ||
  search.gares[0],
)

async function load() {
  if (!gare.value) {
    try { await search.loadGares() } catch { state.value = 'error'; return }
    if (!gare.value) { state.value = search.garesLoaded ? 'nogare' : 'error'; return }
  }
  if (!trips.value.length) state.value = 'loading'
  try {
    const date = day.value === 'today' ? isoDate() : addDays(isoDate(), 1)
    const { data } = await trajetApi.rechercher({ origine: gare.value.id, date, places: 1 })
    trips.value = data.trajets || []
    state.value = 'ready'
    loadedAt = Date.now()
  } catch {
    state.value = trips.value.length ? 'ready' : 'error'
  }
}

watch([() => gare.value?.id, day], () => { trips.value = []; filter.value = null; load() })

const destinations = computed(() => {
  const map = new Map<number, string>()
  for (const t of trips.value) if (t.destination.id != null) map.set(t.destination.id, t.destination.nom)
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'fr'))
})

const groups = computed(() => {
  const list = filter.value ? trips.value.filter(t => t.destination.id === filter.value) : trips.value
  const out: { key: Period; label: string; items: Trajet[] }[] = []
  for (const t of list) {
    const p = period(t.heure_depart)
    let g = out.find(x => x.key === p)
    if (!g) { g = { key: p, label: PERIOD_LABEL[p], items: [] }; out.push(g) }
    g.items.push(t)
  }
  return out
})

function chooseGare(g: Gare) { search.homeGare = g.id }
function toggleFilter(id: number | null) { haptic.select(); filter.value = filter.value === id ? null : id }

function open(t: Trajet) {
  booking.start(t, 1)
  router.push({ name: 'trip', params: { id: t.id } })
}

onMounted(load)
onActivated(() => { if (loadedAt && Date.now() - loadedAt > 120_000) load() })
</script>

<template>
  <div class="view">
    <header class="safe-top shrink-0 bg-surface px-5 pb-3 shadow-divider">
      <h1 class="pt-4 font-display text-[36px] font-semibold leading-none">Départs</h1>
      <button
        type="button"
        class="tap mt-3 flex h-12 w-full items-center gap-2.5 rounded-2xl bg-ciel px-4 text-left"
        @click="pickerOpen = true"
      >
        <MapPin class="h-5 w-5 shrink-0 text-bleu-ink" />
        <span class="min-w-0 flex-1 truncate text-[16px] font-semibold">
          {{ gare ? `Gare de ${gare.nom}` : 'Choisir une gare' }}
        </span>
        <ChevronDown class="h-5 w-5 shrink-0 text-asphalte" />
      </button>
      <Segmented
        v-model="day"
        class="mt-3"
        :options="[{ value: 'today', label: 'Aujourd’hui' }, { value: 'tomorrow', label: 'Demain' }]"
      />
    </header>

    <PullToRefresh ref="ptr" class="tabbar-space" :on-refresh="load">
      <!-- Filtres destination -->
      <div v-if="destinations.length > 1" class="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4">
        <button
          type="button"
          class="tap h-9 shrink-0 rounded-full px-4 text-[14px] font-semibold"
          :class="filter === null ? 'bg-encre text-surface' : 'bg-surface text-encre shadow-field'"
          @click="toggleFilter(null)"
        >Toutes</button>
        <button
          v-for="[id, nom] in destinations"
          :key="id"
          type="button"
          class="tap h-9 shrink-0 rounded-full px-4 text-[14px] font-semibold"
          :class="filter === id ? 'bg-encre text-surface' : 'bg-surface text-encre shadow-field'"
          @click="toggleFilter(id)"
        >{{ nom }}</button>
      </div>

      <div v-if="state === 'loading'" class="px-4 pt-6">
        <div class="skeleton mb-3 h-4 w-20" />
        <div class="group-list">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-4">
            <div class="skeleton h-7 w-14" /><div class="flex-1 space-y-2"><div class="skeleton h-4 w-2/3" /><div class="skeleton h-3 w-1/3" /></div>
          </div>
        </div>
      </div>

      <EmptyState
        v-else-if="state === 'nogare'"
        :icon="MapPin"
        title="Aucune gare disponible"
        text="Les gares MOT ne sont pas encore ouvertes à la réservation en ligne. Le service client peut vous renseigner sur les horaires."
      />

      <EmptyState
        v-else-if="state === 'error'"
        :icon="CloudOff"
        tone="error"
        title="Horaires indisponibles"
        text="Nous n’arrivons pas à joindre le serveur. Vérifiez votre connexion puis réessayez."
      >
        <button type="button" class="btn-primary" @click="load">Réessayer</button>
      </EmptyState>

      <EmptyState
        v-else-if="!groups.length"
        :icon="MoonStar"
        :title="day === 'today' ? 'Plus de départ aujourd’hui' : 'Aucun départ prévu demain'"
        :text="day === 'today' ? `Les cars au départ de ${gare?.nom} sont tous partis. Regardez les horaires de demain.` : `Aucun car n’est programmé demain au départ de ${gare?.nom}.`"
      >
        <button v-if="day === 'today'" type="button" class="btn-secondary" @click="day = 'tomorrow'">Voir demain</button>
        <button type="button" class="btn-ghost" @click="pickerOpen = true">Changer de gare</button>
      </EmptyState>

      <template v-else>
        <section v-for="g in groups" :key="g.key" class="px-4 pt-5">
          <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">{{ g.label }}</h2>
          <div class="group-list">
            <DepartureRow v-for="t in g.items" :key="t.id" :trip="t" @click="open(t)" />
          </div>
        </section>
        <p class="px-6 pt-5 text-center text-[13px] text-gravier">Prix par adulte. Présentez-vous en gare 30 minutes avant le départ.</p>
      </template>
    </PullToRefresh>

    <StationSheet v-model:open="pickerOpen" title="Gare de départ" :selected="gare?.id" @select="chooseGare" />
  </div>
</template>
