<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { CloudOff, MessageCircle, Phone, Share2, SunMedium } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BoardingPass from '@/components/mot/BoardingPass.vue'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, trajetApi } from '@/api'
import { arrivalTime, minutesUntil } from '@/lib/format'
import { shareTicket } from '@/lib/share'
import { haptic } from '@/lib/haptics'
import { BRAND } from '@/config'
import type { Reservation } from '@/types'

const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()
const auth = useAuthStore()

const reference = route.params.reference as string
const ticket = ref<Reservation | null>(tickets.cached(reference))
const state = ref<'loading' | 'ready' | 'error'>(ticket.value ? 'ready' : 'loading')
const error = ref('')
const arrival = ref<string | null>(null)
const confirmCancel = ref(false)
const cancelling = ref(false)

const passenger = computed(() => (auth.user ? `${auth.user.prenom} ${auth.user.nom}` : ''))
const minutesLeft = computed(() => ticket.value?.trajet ? minutesUntil(ticket.value.trajet.date_depart, ticket.value.trajet.heure) : -1)
const canCancel = computed(() => ticket.value?.statut === 'valide' && minutesLeft.value > BRAND.cancelDelayHours * 60)
const tooLate = computed(() => ticket.value?.statut === 'valide' && minutesLeft.value > 0 && !canCancel.value)

async function load() {
  try {
    ticket.value = await tickets.fetchOne(reference)
    state.value = 'ready'
  } catch (e) {
    if (!ticket.value) { error.value = errorMessage(e, 'Ce billet est introuvable.'); state.value = 'error' }
  }
  // Heure d'arrivée : le billet ne la fournit pas, on la demande au trajet (si encore consultable)
  const id = ticket.value?.trajet?.id
  if (id && ticket.value?.statut === 'valide') {
    try {
      const { data } = await trajetApi.show(id)
      arrival.value = arrivalTime(data.heure_depart, data.heure_arrivee, data.duree_minutes)
    } catch { /* trajet clos : pas d'heure d'arrivée */ }
  }
}
onMounted(load)

async function cancel() {
  cancelling.value = true
  try {
    const msg = await tickets.cancel(reference)
    ticket.value = tickets.cached(reference)
    confirmCancel.value = false
    haptic.success()
    toast.success(msg || 'Réservation annulée')
  } catch (e) {
    haptic.warning()
    toast.error('Annulation impossible', { description: errorMessage(e) })
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="view bg-bleu-900">
    <AppBar tone="night" title="Billet" :back-to="{ name: 'tickets' }">
      <template #right>
        <button v-if="ticket" type="button" class="icon-btn text-white active:bg-surface/15" aria-label="Partager le billet" @click="shareTicket(ticket)">
          <Share2 class="h-5 w-5" />
        </button>
      </template>
    </AppBar>

    <div v-if="state === 'loading'" class="px-4 pt-3">
      <div class="h-[560px] animate-pulse rounded-[26px] bg-surface/15" />
    </div>

    <div v-else-if="state === 'error'" class="m-4 rounded-[26px] bg-surface">
      <EmptyState :icon="CloudOff" tone="error" title="Billet indisponible" :text="error">
        <button type="button" class="btn-primary" @click="load">Réessayer</button>
      </EmptyState>
    </div>

    <div v-else-if="ticket" class="view-scroll safe-bottom">
      <div class="px-4 pt-2">
        <BoardingPass :ticket="ticket" :passenger="passenger" :arrival="arrival" notch="#0F1A45" />
      </div>

      <p v-if="ticket.statut === 'valide'" class="flex items-start gap-2.5 px-6 pt-5 text-[14px] leading-5 text-white/85">
        <SunMedium class="mt-0.5 h-[18px] w-[18px] shrink-0" />
        Montrez ce QR code au contrôleur à l’embarquement. Augmentez la luminosité de l’écran si besoin.
      </p>

      <div class="mx-4 mt-6 rounded-[22px] bg-surface/10 p-4 text-white">
        <p class="text-[15px] font-semibold">Un souci avec ce billet&nbsp;?</p>
        <p class="mt-0.5 text-[14px] text-white/75">Le service client MOT peut vous aider.</p>
        <div class="mt-3 flex gap-2">
          <a :href="`tel:${BRAND.phone}`" class="btn btn-sm flex-1 bg-white text-[#1F3285]"><Phone class="h-4 w-4" />Appeler</a>
          <a :href="`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Bonjour, au sujet de mon billet ${ticket.reference}`)}`" target="_blank" rel="noopener" class="btn btn-sm flex-1 bg-surface/15 text-white"><MessageCircle class="h-4 w-4" />WhatsApp</a>
        </div>
      </div>

      <div class="px-4 pb-4 pt-4">
        <button v-if="canCancel" type="button" class="w-full py-3 text-[15px] font-semibold text-white/85 underline-offset-4 active:underline" @click="confirmCancel = true">
          Annuler cette réservation
        </button>
        <p v-else-if="tooLate" class="px-2 py-3 text-center text-[13px] text-white/65">
          L’annulation n’est plus possible à moins de {{ BRAND.cancelDelayHours }} h du départ.
        </p>
      </div>
    </div>

    <BottomSheet v-model:open="confirmCancel" title="Annuler cette réservation ?">
      <p class="text-[15px] leading-[22px] text-asphalte">
        Vos places sur le départ de {{ ticket?.trajet?.heure }} pour {{ ticket?.trajet?.destination }} seront libérées. Cette action est définitive.
      </p>
      <p v-if="ticket?.statut_paiement === 'paye'" class="mt-3 text-[14px] leading-5 text-asphalte">
        Pour toute question sur le remboursement, contactez le service client MOT au {{ BRAND.phoneDisplay }}.
      </p>
      <template #footer>
        <div class="flex flex-col gap-2">
          <button type="button" class="btn-danger w-full" :disabled="cancelling" @click="cancel">
            {{ cancelling ? 'Annulation…' : 'Oui, annuler' }}
          </button>
          <button type="button" class="btn-ghost w-full" @click="confirmCancel = false">Garder mon billet</button>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>
