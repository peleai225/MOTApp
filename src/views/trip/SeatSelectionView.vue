<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Armchair, CloudOff } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SeatMap from '@/components/mot/SeatMap.vue'
import { useBookingStore } from '@/stores/booking'
import { errorMessage, trajetApi } from '@/api'
import { toSeatRows } from '@/lib/seats'
import { fcfa, plural } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import type { Siege } from '@/types'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()

const rows = ref<(Siege | null)[][]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const error = ref('')
const selected = ref<string[]>([...booking.seats])

const trip = computed(() => booking.trip)
const need = computed(() => booking.places)
const free = computed(() => rows.value.flat().filter(s => s?.disponible).length)

async function load() {
  state.value = 'loading'
  try {
    const [, seatsRes] = await Promise.all([
      booking.ensureTrip(route.params.id as string),
      trajetApi.sieges(route.params.id as string),
    ])
    rows.value = toSeatRows(seatsRes.data)
    // Retire les places déjà prises entre-temps
    const freeSet = new Set(rows.value.flat().filter(s => s?.disponible).map(s => s!.numero))
    selected.value = selected.value.filter(n => freeSet.has(n)).slice(0, need.value)
    state.value = 'ready'
  } catch (e) {
    error.value = errorMessage(e, 'Le plan du car ne se charge pas.')
    state.value = 'error'
  }
}
onMounted(load)

function toggle(s: Siege) {
  const i = selected.value.indexOf(s.numero)
  if (i >= 0) { selected.value.splice(i, 1); haptic.tap(); return }
  if (selected.value.length < need.value) { selected.value.push(s.numero); haptic.select(); return }
  if (need.value === 1) { selected.value = [s.numero]; haptic.select(); return }
  haptic.warning()
  toast(`Vous avez déjà choisi ${plural(need.value, 'place')}`, { description: 'Touchez une place choisie pour la libérer.' })
}

const complete = computed(() => selected.value.length === need.value)

function proceed(auto = false) {
  booking.seats = auto ? [] : [...selected.value]
  haptic.tap()
  router.push({ name: 'checkout' })
}
</script>

<template>
  <div class="view">
    <AppBar title="Choisissez vos places" :subtitle="trip ? `${trip.origine.nom} – ${trip.destination.nom}, ${trip.heure_depart}` : undefined" />

    <div v-if="state === 'loading'" class="flex flex-1 flex-col items-center px-5 pt-6">
      <div class="skeleton h-4 w-56" />
      <div class="skeleton mt-6 h-[460px] w-full max-w-[312px] rounded-[48px_48px_26px_26px]" />
    </div>

    <EmptyState v-else-if="state === 'error'" :icon="CloudOff" tone="error" title="Plan indisponible" :text="error">
      <button type="button" class="btn-primary" @click="load">Réessayer</button>
      <button type="button" class="btn-ghost" @click="proceed(true)">Continuer sans choisir</button>
    </EmptyState>

    <EmptyState
      v-else-if="!rows.length"
      :icon="Armchair"
      title="Placement à bord"
      text="Ce car n’a pas encore de plan de places. Votre place vous sera attribuée automatiquement."
    >
      <button type="button" class="btn-primary" @click="proceed(true)">Continuer</button>
    </EmptyState>

    <template v-else>
      <div class="view-scroll pb-6">
        <div class="px-5 pb-4 pt-3 text-center">
          <p class="text-[16px] font-semibold">
            {{ complete ? 'C’est noté' : `Choisissez ${plural(need, 'place')}` }}
            <span class="num ml-1 text-bleu-ink">{{ selected.length }}/{{ need }}</span>
          </p>
          <p class="mt-0.5 text-[14px] text-asphalte">{{ plural(free, 'place libre', 'places libres') }} dans ce car</p>
        </div>

        <div class="mb-5 flex items-center justify-center gap-5 text-[13px] text-asphalte">
          <span class="flex items-center gap-1.5"><span class="h-4 w-4 rounded-[5px] bg-surface shadow-seat" />Libre</span>
          <span class="flex items-center gap-1.5"><span class="h-4 w-4 rounded-[5px] bg-bleu" />Votre choix</span>
          <span class="flex items-center gap-1.5"><span class="h-4 w-4 rounded-[5px] seat-hatch" />Occupée</span>
        </div>

        <div class="px-5">
          <SeatMap :rows="rows" :selected="selected" @toggle="toggle" />
        </div>
      </div>

      <div class="safe-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
        <div class="flex items-center gap-4">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] text-asphalte">
              {{ selected.length ? `Place${selected.length > 1 ? 's' : ''} ${selected.join(', ')}` : 'Aucune place choisie' }}
            </p>
            <p class="num font-display text-[26px] font-semibold leading-7">{{ fcfa(booking.total) }}</p>
          </div>
          <button type="button" class="btn-primary" :disabled="!complete" @click="proceed()">Continuer</button>
        </div>
        <button type="button" class="mt-1 w-full py-2 text-[14px] font-semibold text-bleu-ink" @click="proceed(true)">
          Laisser MOT choisir mes places
        </button>
      </div>
    </template>
  </div>
</template>
