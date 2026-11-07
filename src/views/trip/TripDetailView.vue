<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BusFront, CalendarX2, Clock, CloudOff, QrCode, Share2 } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Stepper from '@/components/ui/Stepper.vue'
import { useBookingStore } from '@/stores/booking'
import { errorMessage } from '@/api'
import { arrivalTime, arrivesNextDay, duration, fcfa, longDate, plural } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import { shareText, shareableUrl } from '@/lib/share'
import { BRAND } from '@/config'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()

const state = ref<'loading' | 'ready' | 'error'>(booking.trip && String(booking.trip.id) === route.params.id ? 'ready' : 'loading')
const error = ref('')
const scrolled = ref(false)

const trip = computed(() => (booking.trip && String(booking.trip.id) === route.params.id ? booking.trip : null))
const arr = computed(() => trip.value ? arrivalTime(trip.value.heure_depart, trip.value.heure_arrivee, trip.value.duree_minutes) : null)
const stops = computed(() => (trip.value?.arrets || []).map(a => (typeof a === 'string' ? a : a.nom)).filter(Boolean))
const maxPlaces = computed(() => Math.max(1, Math.min(10, trip.value?.places_disponibles ?? 10)))

async function load() {
  if (!trip.value) state.value = 'loading'
  try {
    await booking.ensureTrip(route.params.id as string, true)
    if (booking.places > maxPlaces.value) booking.places = maxPlaces.value
    state.value = 'ready'
  } catch (e) {
    if (!trip.value) { error.value = errorMessage(e, "Ce trajet n'est plus disponible."); state.value = 'error' }
  }
}
onMounted(load)

async function share() {
  if (!trip.value) return
  haptic.tap()
  const text = `Car MOT ${trip.value.origine.nom} – ${trip.value.destination.nom}, ${longDate(trip.value.date_depart)} à ${trip.value.heure_depart}`
  await shareText('Trajet MOT', text, shareableUrl())
}

function next() {
  haptic.tap()
  router.push({ name: 'seats', params: { id: route.params.id } })
}
</script>

<template>
  <div class="view">
    <AppBar title="Votre trajet" :elevated="scrolled" back-to="/">
      <template #right>
        <button v-if="trip" type="button" class="icon-btn" aria-label="Partager ce trajet" @click="share"><Share2 class="h-5 w-5" /></button>
      </template>
    </AppBar>

    <div v-if="state === 'loading'" class="space-y-4 px-5 pt-4">
      <div class="skeleton h-5 w-48" />
      <div class="skeleton h-44 w-full rounded-3xl" />
      <div class="skeleton h-32 w-full rounded-3xl" />
    </div>

    <EmptyState v-else-if="state === 'error'" :icon="CloudOff" tone="error" title="Trajet indisponible" :text="error">
      <button type="button" class="btn-primary" @click="load">Réessayer</button>
      <button type="button" class="btn-ghost" @click="router.replace('/')">Nouvelle recherche</button>
    </EmptyState>

    <template v-else-if="trip">
      <div class="view-scroll pb-6" @scroll.passive="scrolled = ($event.target as HTMLElement).scrollTop > 4">
        <!-- Itinéraire -->
        <section class="bg-surface px-5 pb-6 pt-2">
          <p class="text-[15px] font-medium text-asphalte first-letter:uppercase">{{ longDate(trip.date_depart) }}</p>
          <ol class="mt-4">
            <li class="grid grid-cols-[58px_22px_1fr] gap-x-3">
              <p class="num pt-0.5 font-display text-[28px] font-semibold leading-none">{{ trip.heure_depart }}</p>
              <div class="flex flex-col items-center">
                <span class="mt-2 h-3.5 w-3.5 rounded-full border-[3px] border-bleu-ink bg-surface" />
                <span class="w-[3px] flex-1 rounded bg-bleu-100" />
              </div>
              <div class="pb-6">
                <p class="text-[19px] font-semibold leading-7">{{ trip.origine.nom }}</p>
                <p class="text-[14px] text-asphalte">Gare de départ</p>
              </div>
            </li>
            <li v-for="s in stops" :key="s" class="grid grid-cols-[58px_22px_1fr] gap-x-3">
              <span />
              <div class="flex flex-col items-center">
                <span class="w-[3px] flex-1 rounded bg-bleu-100" />
                <span class="h-2.5 w-2.5 rounded-full bg-bleu-200" />
                <span class="w-[3px] flex-1 rounded bg-bleu-100" />
              </div>
              <p class="py-2 text-[15px] text-asphalte">{{ s }}</p>
            </li>
            <li class="grid grid-cols-[58px_22px_1fr] gap-x-3">
              <span />
              <div class="flex justify-center"><span class="h-full w-[3px] rounded bg-bleu-100" /></div>
              <p class="flex flex-wrap gap-x-3 py-2 text-[14px] font-medium text-bleu-ink">
                <span v-if="trip.duree_minutes">{{ duration(trip.duree_minutes) }} de route</span>
                <span v-if="trip.distance_km">{{ trip.distance_km }} km</span>
              </p>
            </li>
            <li class="grid grid-cols-[58px_22px_1fr] gap-x-3">
              <p class="num pt-0.5 font-display text-[28px] font-semibold leading-none" :class="arr ? '' : 'text-gravier'">
                {{ arr || '--:--' }}
              </p>
              <div class="flex flex-col items-center">
                <span class="h-2 w-[3px] rounded bg-bleu-100" />
                <span class="h-3.5 w-3.5 rounded-full bg-rouge" />
              </div>
              <div>
                <p class="text-[19px] font-semibold leading-7">{{ trip.destination.nom }}</p>
                <p class="text-[14px] text-asphalte">
                  {{ arr ? (arrivesNextDay(trip.heure_depart, trip.duree_minutes) ? 'Arrivée prévue le lendemain' : 'Arrivée prévue') : 'Heure d’arrivée non communiquée' }}
                </p>
              </div>
            </li>
          </ol>
        </section>

        <!-- Voyageurs -->
        <section class="mt-4 px-4">
          <div class="flex items-center justify-between rounded-2xl bg-surface py-3 pl-4 pr-3 shadow-outline">
            <div>
              <p class="text-[16px] font-semibold">Voyageurs</p>
              <p class="text-[13px]" :class="trip.places_disponibles <= 5 ? 'font-semibold text-rouge' : 'text-asphalte'">
                {{ plural(trip.places_disponibles, 'place libre', 'places libres') }}
              </p>
            </div>
            <Stepper v-model="booking.places" :max="maxPlaces" label="Nombre de voyageurs" />
          </div>
        </section>

        <!-- Car -->
        <section v-if="trip.bus?.numero || trip.bus?.modele" class="mt-6 px-4">
          <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">Votre car</h2>
          <div class="group-list">
            <div class="flex items-center gap-3 px-4 py-3.5">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-bleu-50 text-bleu-ink"><BusFront class="h-5 w-5" /></span>
              <div class="min-w-0 flex-1">
                <p class="text-[16px] font-semibold">{{ trip.bus?.numero || 'Car MOT' }}</p>
                <p class="truncate text-[13px] text-asphalte">{{ [trip.bus?.modele, trip.bus?.capacite ? `${trip.bus.capacite} places` : null].filter(Boolean).join(', ') }}</p>
              </div>
              <span v-if="trip.bus?.immatriculation" class="num rounded-md border border-ligne px-2 py-1 text-[12.5px] font-semibold text-asphalte">{{ trip.bus.immatriculation }}</span>
            </div>
          </div>
        </section>

        <!-- Tarifs -->
        <section class="mt-6 px-4">
          <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">Tarifs</h2>
          <div class="group-list">
            <div class="flex items-center justify-between px-4 py-3.5"><span class="text-[15px]">Adulte</span><span class="num text-[15px] font-semibold">{{ fcfa(trip.prix_adulte) }}</span></div>
            <div v-if="trip.prix_enfant" class="flex items-center justify-between px-4 py-3.5"><span class="text-[15px]">Enfant</span><span class="num text-[15px] font-semibold text-asphalte">{{ fcfa(trip.prix_enfant) }}</span></div>
            <div v-if="trip.prix_etudiant" class="flex items-center justify-between px-4 py-3.5"><span class="text-[15px]">Étudiant</span><span class="num text-[15px] font-semibold text-asphalte">{{ fcfa(trip.prix_etudiant) }}</span></div>
          </div>
          <p class="px-1 pt-2 text-[13px] leading-[18px] text-asphalte">La réservation en ligne se fait au tarif adulte. Les tarifs enfant et étudiant s’obtiennent au guichet, sur justificatif.</p>
        </section>

        <!-- Bon à savoir -->
        <section class="mt-6 px-4">
          <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">Bon à savoir</h2>
          <div class="group-list">
            <div class="flex gap-3 px-4 py-3.5"><Clock class="mt-0.5 h-5 w-5 shrink-0 text-bleu-ink" /><p class="text-[15px] leading-[21px]">Présentez-vous en gare {{ BRAND.boardingAdviceMinutes }} minutes avant le départ.</p></div>
            <div class="flex gap-3 px-4 py-3.5"><QrCode class="mt-0.5 h-5 w-5 shrink-0 text-bleu-ink" /><p class="text-[15px] leading-[21px]">Le QR code de votre billet suffit pour embarquer, même sans connexion.</p></div>
            <div class="flex gap-3 px-4 py-3.5"><CalendarX2 class="mt-0.5 h-5 w-5 shrink-0 text-bleu-ink" /><p class="text-[15px] leading-[21px]">Annulation possible depuis l’app jusqu’à {{ BRAND.cancelDelayHours }} h avant le départ.</p></div>
          </div>
        </section>
      </div>

      <!-- Barre d'action -->
      <div class="safe-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
        <div class="flex items-center gap-4">
          <div class="min-w-0 flex-1">
            <p class="text-[13px] text-asphalte">{{ plural(booking.places, 'billet') }} adulte</p>
            <p class="num font-display text-[26px] font-semibold leading-7">{{ fcfa(booking.total) }}</p>
          </div>
          <button type="button" class="btn-primary" :disabled="!trip.disponible || trip.places_disponibles < booking.places" @click="next">
            Choisir mes places
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
