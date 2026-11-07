<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowRight, ArrowUpDown, ChevronRight, History, MessageCircle, Phone, Search, UserRound } from 'lucide-vue-next'
import PullToRefresh from '@/components/ui/PullToRefresh.vue'
import DayStrip from '@/components/ui/DayStrip.vue'
import Stepper from '@/components/ui/Stepper.vue'
import StationSheet from '@/components/mot/StationSheet.vue'
import DepartureRow from '@/components/mot/DepartureRow.vue'
import TicketStub from '@/components/mot/TicketStub.vue'
import LiveryStripes from '@/components/mot/LiveryStripes.vue'
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from '@/stores/auth'
import { useTicketsStore } from '@/stores/tickets'
import { useBookingStore } from '@/stores/booking'
import { useTabReselect } from '@/composables/useTabReselect'
import { trajetApi } from '@/api'
import { initials, isoDate, longDate } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import { BRAND } from '@/config'
import type { Gare, Trajet } from '@/types'

defineOptions({ name: 'HomeView' })

const router = useRouter()
const search = useSearchStore()
const auth = useAuthStore()
const tickets = useTicketsStore()
const booking = useBookingStore()

const ptr = ref<InstanceType<typeof PullToRefresh> | null>(null)
const scroller = computed(() => ptr.value?.el)
useTabReselect('home', scroller)

const greeting = computed(() => {
  const h = new Date().getHours()
  const word = h >= 18 || h < 4 ? 'Bonsoir' : 'Bonjour'
  return auth.firstName ? `${word} ${auth.firstName}` : word
})

// ── Itinéraire ──────────────────────────────────────────────────────────
const picker = ref<{ open: boolean; field: 'origine' | 'destination' }>({ open: false, field: 'origine' })
const origine = computed(() => search.gareById(search.origine))
const destination = computed(() => search.gareById(search.destination))

function openPicker(field: 'origine' | 'destination') {
  haptic.tap()
  picker.value = { open: true, field }
}
function onPick(g: Gare) {
  search[picker.value.field] = g.id
  // Enchaîne naturellement : après le départ, on demande l'arrivée
  if (picker.value.field === 'origine' && !search.destination) {
    setTimeout(() => openPicker('destination'), 380)
  }
}
const swapTurn = ref(0)
function swap() {
  haptic.select()
  swapTurn.value += 180
  search.swap()
}

if (search.date < isoDate()) search.date = isoDate()

function doSearch() {
  if (!search.origine) { haptic.warning(); openPicker('origine'); return }
  if (!search.destination) { haptic.warning(); openPicker('destination'); return }
  if (search.origine === search.destination) { toast.error('Choisissez deux gares différentes.'); return }
  haptic.tap()
  search.remember(search.origine, search.destination)
  router.push({ name: 'search', query: { de: search.origine, a: search.destination, date: search.date, places: search.places } })
}

function repeat(o: number, d: number) {
  search.origine = o
  search.destination = d
  doSearch()
}

const recentList = computed(() =>
  search.recent
    .map(r => ({ ...r, o: search.gareById(r.origine), d: search.gareById(r.destination) }))
    .filter(r => r.o && r.d)
    .slice(0, 3),
)

// ── Prochains départs ───────────────────────────────────────────────────
const boardGare = computed<Gare | undefined>(() =>
  search.gareById(search.homeGare) ||
  origine.value ||
  search.gares.find(g => /yopougon/i.test(g.nom)) ||
  search.gares[0],
)
const departures = ref<Trajet[]>([])
const boardState = ref<'idle' | 'loading' | 'error'>('idle')
let boardLoadedAt = 0

async function loadBoard() {
  if (!boardGare.value) { boardState.value = 'idle'; return }
  const gareId = boardGare.value.id
  boardState.value = departures.value.length ? 'idle' : 'loading'
  try {
    const { data } = await trajetApi.rechercher({ origine: gareId, date: isoDate(), places: 1 })
    if (boardGare.value?.id !== gareId) return // réponse périmée : la gare a changé entre-temps
    departures.value = (data.trajets || []).slice(0, 4)
    boardState.value = 'idle'
    boardLoadedAt = Date.now()
  } catch {
    if (boardGare.value?.id !== gareId) return
    boardState.value = departures.value.length ? 'idle' : 'error'
  }
}
watch(() => boardGare.value?.id, () => { departures.value = []; loadBoard() })

function openTrip(t: Trajet) {
  booking.start(t, 1)
  router.push({ name: 'trip', params: { id: t.id } })
}

async function refreshAll() {
  await Promise.allSettled([search.loadGares(true), loadBoard(), auth.isLoggedIn ? tickets.refresh() : null])
}

onMounted(async () => {
  try { await search.loadGares() } catch { /* état d'erreur affiché plus bas */ }
  loadBoard()
  if (auth.isLoggedIn) { tickets.hydrate(); tickets.refresh() }
})
onActivated(() => {
  if (Date.now() - boardLoadedAt > 120_000) loadBoard()
})
</script>

<template>
  <div class="view bg-surface">
    <PullToRefresh ref="ptr" class="tabbar-space" :on-refresh="refreshAll">
      <!-- ── Photo du car ── -->
      <section class="relative h-[300px] overflow-hidden bg-[#2F6BD0]">
        <img
          src="/images/bus-720.jpg"
          srcset="/images/bus-720.jpg 720w, /images/bus-1280.jpg 1280w"
          sizes="(min-width: 430px) 430px, 100vw"
          alt="Car MOT aux couleurs de la compagnie"
          class="absolute inset-0 h-full w-full scale-[1.35] object-cover object-[38%_62%]"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-[#0D1530]/80 from-10% via-[#0D1530]/40 via-55% to-transparent" />
        <div class="safe-top relative">
          <div class="flex items-center justify-between px-4 pt-3">
            <span class="rounded-[12px] bg-white px-2.5 py-1.5 shadow-lift">
              <img src="/images/logo-mot.png" alt="MOT" class="h-6 w-auto" />
            </span>
            <RouterLink
              to="/profil"
              class="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface text-bleu-ink shadow-lift"
              :aria-label="auth.isLoggedIn ? 'Mon profil' : 'Se connecter'"
            >
              <span v-if="auth.user" class="font-display text-[17px] font-semibold">{{ initials(auth.user.prenom, auth.user.nom) }}</span>
              <UserRound v-else class="h-5 w-5" />
            </RouterLink>
          </div>
          <div class="px-5 pt-7 text-white">
            <p class="text-[16px] font-medium text-white/90">{{ greeting }}</p>
            <h1 class="mt-0.5 font-display text-[44px] font-semibold leading-[0.98] [text-shadow:0_2px_16px_rgba(13,21,48,0.35)]">
              Où allez-vous&nbsp;?
            </h1>
          </div>
        </div>
      </section>

      <!-- ── Recherche ── -->
      <section class="relative z-10 -mt-[60px] overflow-hidden rounded-t-[30px] bg-surface px-5 pb-2 pt-6">
        <LiveryStripes class="pointer-events-none absolute right-0 top-0 h-[38px] w-[150px] -scale-y-100" />

        <div class="relative rounded-[22px] bg-ciel">
          <span class="absolute bottom-[34px] left-[27px] top-[34px] border-l-2 border-dotted border-bleu-200" aria-hidden="true" />
          <button type="button" class="tap flex w-full items-center gap-3.5 py-3 pl-[21px] pr-16 text-left" @click="openPicker('origine')">
            <span class="relative h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-bleu-ink bg-surface" />
            <span class="min-w-0 flex-1">
              <span class="block text-[13px] text-asphalte">Départ</span>
              <span class="block truncate text-[19px] font-semibold leading-6" :class="origine ? 'text-encre' : 'font-medium text-gravier'">
                {{ origine?.nom || 'Choisir une gare' }}
              </span>
            </span>
          </button>
          <div class="ml-[54px] mr-16 h-px bg-hairline" />
          <button type="button" class="tap flex w-full items-center gap-3.5 py-3 pl-[21px] pr-16 text-left" @click="openPicker('destination')">
            <span class="relative h-3.5 w-3.5 shrink-0 rounded-full bg-rouge" />
            <span class="min-w-0 flex-1">
              <span class="block text-[13px] text-asphalte">Arrivée</span>
              <span class="block truncate text-[19px] font-semibold leading-6" :class="destination ? 'text-encre' : 'font-medium text-gravier'">
                {{ destination?.nom || 'Choisir une gare' }}
              </span>
            </span>
          </button>
          <button
            type="button"
            class="tap absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-bleu-ink shadow-lift"
            aria-label="Inverser départ et arrivée"
            @click="swap"
          >
            <ArrowUpDown class="h-5 w-5 transition-transform duration-300 ease-native" :style="{ transform: `rotate(${swapTurn}deg)` }" :stroke-width="2.2" />
          </button>
        </div>

        <div class="mt-6 flex items-baseline justify-between gap-3">
          <p class="text-[16px] font-semibold">Date du voyage</p>
          <p class="truncate text-[13.5px] text-asphalte first-letter:uppercase">{{ longDate(search.date) }}</p>
        </div>
        <DayStrip v-model="search.date" class="mt-2.5" />

        <div class="mt-5 flex items-center justify-between rounded-[22px] bg-ciel py-2.5 pl-4 pr-2.5">
          <div>
            <p class="text-[16px] font-semibold">Voyageurs</p>
            <p class="text-[13px] text-asphalte">Jusqu'à 10 par réservation</p>
          </div>
          <Stepper v-model="search.places" label="Nombre de voyageurs" />
        </div>

        <button type="button" class="btn-primary mt-5 w-full" @click="doSearch">
          <Search class="h-5 w-5" :stroke-width="2.4" />
          Voir les départs
        </button>
      </section>

      <!-- ── Prochain voyage ── -->
      <section v-if="auth.isLoggedIn && tickets.next" class="mt-8 bg-ciel px-5 py-6">
        <h2 class="section-title">Votre prochain voyage</h2>
        <TicketStub class="mt-3" :ticket="tickets.next" @click="router.push({ name: 'ticket', params: { reference: tickets.next!.reference } })" />
      </section>

      <!-- ── Prochains départs ── -->
      <section class="mt-8 px-5">
        <div class="flex items-end justify-between">
          <h2 class="section-title">Prochains départs</h2>
          <RouterLink to="/departs" class="text-[15px] font-semibold text-bleu-ink">Tout voir</RouterLink>
        </div>
        <p v-if="boardGare" class="mt-1.5 text-[14px] text-asphalte">Au départ de {{ boardGare.nom }}, aujourd'hui</p>

        <div v-if="boardState === 'loading' || (!boardGare && !search.garesError && !search.garesLoaded)" class="group-list mt-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-4 py-4">
            <div class="skeleton h-7 w-14" /><div class="flex-1 space-y-2"><div class="skeleton h-4 w-2/3" /><div class="skeleton h-3 w-1/3" /></div>
          </div>
        </div>
        <div v-else-if="!boardGare && search.garesLoaded" class="mt-3 rounded-2xl bg-ciel px-4 py-5">
          <p class="text-[15px] text-asphalte">Aucune gare n’est encore ouverte à la réservation en ligne. Le service client MOT peut vous renseigner sur les horaires.</p>
        </div>
        <div v-else-if="boardState === 'error' || search.garesError" class="mt-3 rounded-2xl bg-ciel px-4 py-5 text-center">
          <p class="text-[15px] text-asphalte">Les horaires ne se chargent pas pour le moment.</p>
          <button type="button" class="btn-ghost btn-sm mt-1" @click="refreshAll">Réessayer</button>
        </div>
        <div v-else-if="!departures.length" class="mt-3 rounded-2xl bg-ciel px-4 py-5">
          <p class="text-[15px] text-asphalte">Plus aucun départ aujourd'hui depuis {{ boardGare?.nom }}.</p>
          <RouterLink to="/departs" class="mt-1 inline-block text-[15px] font-semibold text-bleu-ink">Voir les départs de demain</RouterLink>
        </div>
        <div v-else class="group-list mt-3">
          <DepartureRow v-for="t in departures" :key="t.id" :trip="t" @click="openTrip(t)" />
        </div>
      </section>

      <!-- ── Recherches récentes ── -->
      <section v-if="recentList.length" class="mt-8 px-5">
        <div class="flex items-end justify-between">
          <h2 class="section-title">Recherches récentes</h2>
          <button type="button" class="text-[14px] font-medium text-asphalte" @click="search.forgetRecent()">Effacer</button>
        </div>
        <div class="group-list mt-3">
          <button
            v-for="r in recentList"
            :key="`${r.origine}-${r.destination}`"
            type="button"
            class="tap-row flex w-full items-center gap-3 px-4 py-3.5 text-left"
            @click="repeat(r.origine, r.destination)"
          >
            <History class="h-5 w-5 shrink-0 text-gravier" />
            <span class="flex min-w-0 flex-1 items-center gap-2 text-[16px] font-semibold">
              <span class="truncate">{{ r.o!.nom }}</span>
              <ArrowRight class="h-4 w-4 shrink-0 text-gravier" />
              <span class="truncate">{{ r.d!.nom }}</span>
            </span>
            <ChevronRight class="h-5 w-5 shrink-0 text-chevron" />
          </button>
        </div>
      </section>

      <!-- ── Aide ── -->
      <section class="mt-8 px-5">
        <div class="relative overflow-hidden rounded-[26px] bg-bleu p-5 text-white">
          <LiveryStripes variant="on-blue" class="pointer-events-none absolute -right-2 bottom-0 h-[64px] w-[210px]" />
          <p class="relative font-display text-[26px] font-semibold leading-7">Une question avant de partir&nbsp;?</p>
          <p class="relative mt-1.5 max-w-[260px] text-[15px] leading-[21px] text-white/80">Le service client MOT vous répond par téléphone ou sur WhatsApp.</p>
          <div class="relative mt-4 flex gap-2">
            <a :href="`tel:${BRAND.phone}`" class="btn btn-sm bg-white text-[#1F3285]"><Phone class="h-4 w-4" />Appeler</a>
            <a :href="`https://wa.me/${BRAND.whatsapp}`" target="_blank" rel="noopener" class="btn btn-sm bg-surface/15 text-white"><MessageCircle class="h-4 w-4" />WhatsApp</a>
          </div>
        </div>
        <p class="mt-6 text-center text-[13px] text-gravier">{{ BRAND.fullName }}, {{ BRAND.tagline.toLowerCase() }}</p>
      </section>
    </PullToRefresh>

    <StationSheet
      v-model:open="picker.open"
      :title="picker.field === 'origine' ? 'Gare de départ' : 'Gare d’arrivée'"
      :selected="picker.field === 'origine' ? search.origine : search.destination"
      :exclude="picker.field === 'origine' ? search.destination : search.origine"
      @select="onPick"
    />
  </div>
</template>
