<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, BusFront, CloudOff, SlidersHorizontal } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import DayStrip from '@/components/ui/DayStrip.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TripCard from '@/components/mot/TripCard.vue'
import { useSearchStore } from '@/stores/search'
import { useBookingStore } from '@/stores/booking'
import { errorMessage, trajetApi } from '@/api'
import { addDays, dayLabel, isoDate, PERIOD_LABEL, period, plural, type Period } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import type { Trajet } from '@/types'

defineOptions({ name: 'SearchResultsView' })

const route = useRoute()
const router = useRouter()
const search = useSearchStore()
const booking = useBookingStore()

const q = computed(() => ({
  de: Number(route.query.de) || null,
  a: Number(route.query.a) || null,
  date: (route.query.date as string) || isoDate(),
  places: Math.min(10, Math.max(1, Number(route.query.places) || 1)),
}))

const from = computed(() => search.gareById(q.value.de))
const to = computed(() => search.gareById(q.value.a))

const trips = ref<Trajet[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const error = ref('')
const filter = ref<Period | 'all'>('all')
const scrolled = ref(false)
let lastKey = ''

async function load(force = false) {
  if (route.name !== 'search') return
  const key = JSON.stringify(q.value)
  if (!force && key === lastKey && state.value === 'ready') return
  lastKey = key
  state.value = 'loading'
  filter.value = 'all'
  try {
    const { data } = await trajetApi.rechercher({ origine: q.value.de, destination: q.value.a, date: q.value.date, places: q.value.places })
    trips.value = (data.trajets || []).slice().sort((a, b) => a.heure_depart.localeCompare(b.heure_depart))
    state.value = 'ready'
  } catch (e) {
    error.value = errorMessage(e)
    state.value = 'error'
  }
}

const date = computed({
  get: () => q.value.date,
  set: v => {
    search.date = v
    router.replace({ query: { ...route.query, date: v } })
  },
})

watch(() => route.query, () => load(), { deep: true })
onMounted(() => { search.loadGares().catch(() => {}); load() })
onActivated(() => load())

const periods = computed(() => {
  const counts: Partial<Record<Period, number>> = {}
  for (const t of trips.value) { const p = period(t.heure_depart); counts[p] = (counts[p] || 0) + 1 }
  return (['matin', 'apres-midi', 'soir'] as Period[]).filter(p => counts[p]).map(p => ({ key: p, label: PERIOD_LABEL[p], count: counts[p]! }))
})
const shown = computed(() => filter.value === 'all' ? trips.value : trips.value.filter(t => period(t.heure_depart) === filter.value))

function pickFilter(f: Period | 'all') { haptic.select(); filter.value = f }

function choose(t: Trajet) {
  booking.start(t, q.value.places)
  router.push({ name: 'trip', params: { id: t.id } })
}

function nextDay() { date.value = addDays(q.value.date, 1) }

const when = computed(() => {
  const t = isoDate()
  if (q.value.date === t) return 'aujourd’hui'
  if (q.value.date === addDays(t, 1)) return 'demain'
  return `le ${dayLabel(q.value.date)}`
})
</script>

<template>
  <div class="view">
    <AppBar :elevated="scrolled" back-to="/">
      <template #title>
        <p class="flex items-center gap-1.5 font-display text-[20px] font-semibold leading-6">
          <span class="truncate">{{ from?.nom || 'Départ' }}</span>
          <ArrowRight class="h-4 w-4 shrink-0 text-gravier" :stroke-width="2.4" />
          <span class="truncate">{{ to?.nom || 'Arrivée' }}</span>
        </p>
        <p class="truncate text-[13px] leading-4 text-asphalte">{{ dayLabel(q.date) }}, {{ plural(q.places, 'voyageur') }}</p>
      </template>
      <template #right>
        <button type="button" class="btn-ghost btn-sm px-3" @click="router.back()">Modifier</button>
      </template>
      <div class="bg-surface px-5 pb-3 pt-1">
        <DayStrip v-model="date" dense />
      </div>
    </AppBar>

    <div class="view-scroll pb-10" @scroll.passive="scrolled = ($event.target as HTMLElement).scrollTop > 4">
      <!-- Chargement -->
      <div v-if="state === 'loading'" class="space-y-3 px-4 pt-4">
        <div v-for="i in 4" :key="i" class="rounded-[24px] bg-surface p-4 shadow-lift">
          <div class="flex items-center justify-between"><div class="skeleton h-8 w-20" /><div class="skeleton h-2 w-24" /><div class="skeleton h-8 w-20" /></div>
          <div class="mt-5 flex justify-between"><div class="skeleton h-4 w-28" /><div class="skeleton h-6 w-24" /></div>
        </div>
      </div>

      <EmptyState v-else-if="state === 'error'" :icon="CloudOff" tone="error" title="Recherche impossible" :text="error">
        <button type="button" class="btn-primary" @click="load(true)">Réessayer</button>
      </EmptyState>

      <EmptyState
        v-else-if="!trips.length"
        :icon="BusFront"
        title="Aucun car ce jour-là"
        :text="`Pas de départ disponible ${when} pour ${plural(q.places, 'voyageur')} sur ce trajet.`"
      >
        <button type="button" class="btn-primary" @click="nextDay">Voir le jour suivant</button>
        <button type="button" class="btn-ghost" @click="router.back()">Modifier la recherche</button>
      </EmptyState>

      <template v-else>
        <div class="flex items-center gap-2 px-5 pb-1 pt-4">
          <p class="flex-1 text-[14px] text-asphalte">{{ plural(trips.length, 'départ') }}, prix par adulte</p>
          <SlidersHorizontal v-if="periods.length > 1" class="h-4 w-4 text-gravier" />
        </div>
        <div v-if="periods.length > 1" class="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 pt-2">
          <button
            type="button"
            class="tap h-9 shrink-0 rounded-full px-4 text-[14px] font-semibold"
            :class="filter === 'all' ? 'bg-encre text-surface' : 'bg-surface text-encre shadow-field'"
            @click="pickFilter('all')"
          >Tous</button>
          <button
            v-for="p in periods"
            :key="p.key"
            type="button"
            class="tap h-9 shrink-0 rounded-full px-4 text-[14px] font-semibold"
            :class="filter === p.key ? 'bg-encre text-surface' : 'bg-surface text-encre shadow-field'"
            @click="pickFilter(p.key)"
          >{{ p.label }} <span class="num opacity-60">{{ p.count }}</span></button>
        </div>

        <div class="space-y-3 px-4 pt-3">
          <TripCard v-for="t in shown" :key="t.id" :trip="t" @click="choose(t)" />
        </div>
        <p class="px-8 pt-6 text-center text-[13px] leading-[19px] text-gravier">
          Les horaires peuvent varier selon la circulation. Présentez-vous en gare 30 minutes avant le départ.
        </p>
      </template>
    </div>
  </div>
</template>
