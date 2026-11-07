<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowRight, Banknote, CreditCard, Smartphone, Ticket } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'
import { useTicketsStore } from '@/stores/tickets'
import { errorMessage, reservationApi } from '@/api'
import { fcfa, formatPhone, longDate, normalizePhone, plural } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import { BRAND } from '@/config'
import type { ModePaiement } from '@/types'

const router = useRouter()
const booking = useBookingStore()
const auth = useAuthStore()
const tickets = useTicketsStore()

const trip = computed(() => booking.trip)
const mode = ref<ModePaiement>('mobile_money')
const paying = ref(false)
const form = reactive({
  nom: auth.user ? `${auth.user.prenom} ${auth.user.nom}`.trim() : '',
  telephone: formatPhone(auth.user?.telephone),
})

const methods: { value: ModePaiement; label: string; sub: string; icon: typeof Smartphone }[] = [
  { value: 'mobile_money', label: 'Mobile Money', sub: 'Orange Money, MTN MoMo, Moov Money, Wave', icon: Smartphone },
  { value: 'carte_bancaire', label: 'Carte bancaire', sub: 'Visa, Mastercard', icon: CreditCard },
  { value: 'cash', label: 'Espèces au guichet', sub: 'Réglez en gare avant le départ', icon: Banknote },
]

const cta = computed(() => (mode.value === 'cash' ? 'Réserver mes places' : `Payer ${fcfa(booking.total)}`))

onMounted(() => {
  if (!trip.value) router.replace('/')
})

function pickMethod(v: ModePaiement) {
  if (mode.value !== v) haptic.select()
  mode.value = v
}

async function submit() {
  if (!trip.value || paying.value) return
  paying.value = true
  haptic.tap()
  try {
    const { data } = await reservationApi.store({
      depart_id: Number(trip.value.id),
      nombre_places: booking.places,
      mode_paiement: mode.value,
      ...(booking.seats.length ? { sieges: [...booking.seats] } : {}),
      ...(form.nom.trim() ? { nom_passager: form.nom.trim() } : {}),
      ...(form.telephone.trim() ? { telephone_passager: normalizePhone(form.telephone) } : {}),
    })
    tickets.add(data.reservation)
    haptic.success()
    router.replace({ name: 'confirmation', params: { reference: data.reservation.reference } })
  } catch (e) {
    haptic.warning()
    toast.error('Réservation non effectuée', { description: errorMessage(e) })
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="view">
    <AppBar title="Paiement" />

    <template v-if="trip">
      <div class="view-scroll pb-6">
        <!-- Récapitulatif du voyage -->
        <section class="px-4 pt-2">
          <div class="rounded-[24px] bg-surface p-4 shadow-outline">
            <p class="flex items-center gap-1.5 font-display text-[22px] font-semibold leading-7">
              <span class="truncate">{{ trip.origine.nom }}</span>
              <ArrowRight class="h-4 w-4 shrink-0 text-gravier" :stroke-width="2.4" />
              <span class="truncate">{{ trip.destination.nom }}</span>
            </p>
            <p class="mt-0.5 text-[14px] text-asphalte first-letter:uppercase">
              {{ longDate(trip.date_depart) }}, départ à <span class="num font-semibold text-encre">{{ trip.heure_depart }}</span>
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-full bg-ciel px-3 py-1 text-[13px] font-medium">{{ plural(booking.places, 'voyageur') }}</span>
              <span class="rounded-full bg-ciel px-3 py-1 text-[13px] font-medium">
                {{ booking.seats.length ? `Place${booking.seats.length > 1 ? 's' : ''} ${booking.seats.join(', ')}` : 'Places attribuées par MOT' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Passager -->
        <section class="mt-6 space-y-4 px-5">
          <h2 class="section-title">Passager principal</h2>
          <AppInput v-model="form.nom" label="Nom complet" autocomplete="name" placeholder="Prénom et nom" required />
          <AppInput
            v-model="form.telephone"
            label="Téléphone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="07 00 00 00 00"
            hint="Pour vous joindre en cas de changement d’horaire."
            required
            @blur="form.telephone = formatPhone(form.telephone)"
          />
        </section>

        <!-- Moyen de paiement -->
        <section class="mt-7 px-4">
          <h2 class="section-title px-1">Moyen de paiement</h2>
          <div class="group-list mt-3" role="radiogroup" aria-label="Moyen de paiement">
            <button
              v-for="m in methods"
              :key="m.value"
              type="button"
              role="radio"
              :aria-checked="mode === m.value"
              class="tap-row flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
              @click="pickMethod(m.value)"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-colors"
                :class="mode === m.value ? 'bg-bleu text-white' : 'bg-ciel text-asphalte'"
              >
                <component :is="m.icon" class="h-[22px] w-[22px]" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[16px] font-semibold">{{ m.label }}</span>
                <span class="block text-[13px] leading-[18px] text-asphalte">{{ m.sub }}</span>
              </span>
              <span
                class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full transition-colors"
                :class="mode === m.value ? 'bg-bleu' : 'shadow-radio'"
              >
                <span v-if="mode === m.value" class="h-2 w-2 rounded-full bg-surface" />
              </span>
            </button>
          </div>
          <p v-if="mode === 'cash'" class="px-1 pt-2 text-[13px] leading-[18px] text-asphalte">
            Vos places sont bloquées. Réglez {{ fcfa(booking.total) }} au guichet de {{ trip.origine.nom }} avant le départ.
          </p>
        </section>

        <!-- Total -->
        <section class="mt-7 px-4">
          <div class="group-list">
            <div class="flex items-center justify-between px-4 py-3.5">
              <span class="text-[15px]">{{ plural(booking.places, 'billet') }} adulte × <span class="num">{{ fcfa(trip.prix_adulte) }}</span></span>
              <span class="num text-[15px] font-semibold">{{ fcfa(booking.total) }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-4">
              <span class="text-[16px] font-semibold">Total</span>
              <span class="num font-display text-[28px] font-semibold leading-none text-bleu-ink">{{ fcfa(booking.total) }}</span>
            </div>
          </div>
          <p class="px-1 pt-3 text-[13px] leading-[18px] text-asphalte">
            Annulation possible depuis l’app jusqu’à {{ BRAND.cancelDelayHours }} h avant le départ.
          </p>
        </section>
      </div>

      <div class="safe-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
        <button type="button" class="btn-primary w-full" :disabled="paying" @click="submit">{{ cta }}</button>
        <p class="mt-2 flex items-center justify-center gap-1.5 text-[12.5px] text-asphalte">
          <Ticket class="h-3.5 w-3.5" /> Votre billet s’affiche dès la confirmation
        </p>
      </div>
    </template>

    <!-- Traitement -->
    <Transition name="fade">
      <div v-if="paying" class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-surface/95 px-10 text-center" role="alert" aria-busy="true">
        <span class="relative flex h-16 w-16 items-center justify-center">
          <span class="absolute inset-0 animate-spin rounded-full border-[3px] border-bleu-100 border-t-bleu" />
          <img src="/images/logo-mot.png" alt="" class="h-5 w-auto dark:box-content dark:rounded dark:bg-white dark:px-1 dark:py-0.5" />
        </span>
        <p class="mt-6 font-display text-[26px] font-semibold">Réservation en cours</p>
        <p class="mt-1 text-[15px] text-asphalte">Gardez l’application ouverte, cela ne prend que quelques secondes.</p>
      </div>
    </Transition>
  </div>
</template>
