<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banknote, Share2, X } from 'lucide-vue-next'
import BoardingPass from '@/components/mot/BoardingPass.vue'
import { useTicketsStore } from '@/stores/tickets'
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'
import { arrivalTime, fcfa } from '@/lib/format'
import { shareTicket } from '@/lib/share'
import type { Reservation } from '@/types'

const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()
const booking = useBookingStore()
const auth = useAuthStore()

const reference = route.params.reference as string
const ticket = ref<Reservation | null>(tickets.cached(reference))

// L'heure d'arrivée vient du trajet réservé (le billet ne la contient pas)
const trip = booking.trip
const arrival = trip && ticket.value?.trajet && String(trip.id) === String(ticket.value.trajet.id)
  ? arrivalTime(trip.heure_depart, trip.heure_arrivee, trip.duree_minutes)
  : null

const passenger = computed(() => auth.user ? `${auth.user.prenom} ${auth.user.nom}` : '')
const toPay = computed(() => ticket.value?.statut_paiement === 'en_attente')

onMounted(async () => {
  booking.reset()
  if (!ticket.value) {
    try { ticket.value = await tickets.fetchOne(reference) } catch { router.replace({ name: 'tickets' }) }
  }
})

function close() { router.replace({ name: 'home' }) }

/** Le retour depuis le billet ramène à la liste des billets, pas au tunnel de réservation */
async function openTicket() {
  await router.replace({ name: 'tickets' })
  router.push({ name: 'ticket', params: { reference } })
}
</script>

<template>
  <div class="view bg-ciel">
    <header class="safe-top shrink-0">
      <div class="flex h-14 items-center justify-end px-2">
        <button type="button" class="icon-btn" aria-label="Fermer" @click="close"><X class="h-6 w-6" /></button>
      </div>
    </header>

    <div class="view-scroll pb-6">
      <div class="px-6 text-center">
        <span class="check mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#0E8F4E] text-white shadow-[0_10px_24px_-10px_rgba(14,143,78,0.7)]">
          <svg viewBox="0 0 24 24" class="h-9 w-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path class="check-path" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 class="mt-4 font-display text-[38px] font-semibold leading-none">C’est réservé&nbsp;!</h1>
        <p class="mx-auto mt-2 max-w-[300px] text-[15px] leading-[21px] text-asphalte">
          Votre billet est enregistré dans l’onglet Billets. Il reste disponible même sans connexion.
        </p>
      </div>

      <div v-if="toPay && ticket" class="mx-5 mt-5 flex gap-3 rounded-2xl bg-ambre-50 px-4 py-3">
        <Banknote class="mt-0.5 h-5 w-5 shrink-0 text-ambre" />
        <p class="text-[14px] leading-5 text-encre">
          Réglez <strong class="num">{{ fcfa(ticket.montant_total) }}</strong> au guichet de {{ ticket.trajet?.origine }} avant le départ pour valider votre voyage.
        </p>
      </div>

      <!-- Le billet sort de la fente -->
      <div class="relative mx-4 mt-7">
        <div class="relative z-10 mx-auto h-3 w-[calc(100%+8px)] -translate-x-1 rounded-full bg-[#0D1530] shadow-[0_4px_10px_rgba(13,21,48,0.3)] dark:bg-black dark:ring-1 dark:ring-white/10" aria-hidden="true" />
        <div class="-mx-3 -mt-1.5 overflow-hidden px-4 pb-8">
          <div v-if="ticket" class="print">
            <BoardingPass :ticket="ticket" :passenger="passenger" :arrival="arrival" notch="rgb(var(--c-ciel))" />
          </div>
          <div v-else class="skeleton h-[520px] rounded-[26px]" />
        </div>
      </div>
    </div>

    <div class="safe-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
      <div class="flex gap-2">
        <button
          type="button"
          class="btn-primary flex-1"
          :disabled="!ticket"
          @click="openTicket"
        >
          Voir mon billet
        </button>
        <button type="button" class="btn-soft w-[52px] px-0" :disabled="!ticket" aria-label="Partager le billet" @click="ticket && shareTicket(ticket)">
          <Share2 class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.check { animation: pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.check-path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: draw 420ms 260ms ease-out forwards; }
.print { animation: print 1300ms 450ms cubic-bezier(0.22, 0.75, 0.25, 1) both; }

@keyframes pop { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes print {
  0%   { transform: translateY(-100%); }
  55%  { transform: translateY(-38%); }
  62%  { transform: translateY(-36%); }
  100% { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .check, .check-path, .print { animation: none; stroke-dashoffset: 0; }
}
</style>
