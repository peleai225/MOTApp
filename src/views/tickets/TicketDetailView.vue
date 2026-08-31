<template>
  <div class="page-white flex flex-col">
    <!-- Header Nuit -->
    <div class="bg-nuit px-5 pt-safe pb-5">
      <div class="flex items-center justify-between mt-4">
        <button @click="router.back()" class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="font-display text-base font-semibold text-white">Mon Billet</h1>
        <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Contenu -->
    <div v-if="loading" class="flex-1 px-4 py-6 flex flex-col gap-4">
      <div class="skeleton h-64" />
      <div class="skeleton h-48" />
    </div>

    <div v-else-if="ticket" class="flex-1 overflow-y-auto pb-28">

      <!-- Badge statut centré -->
      <div class="flex justify-center py-4">
        <AppBadge :status="ticket.statut" />
      </div>

      <!-- Carte ticket physique -->
      <div class="mx-4 ticket-card">
        <!-- Header ticket -->
        <div class="ticket-header">
          <div class="flex items-center justify-between mb-1">
            <p class="font-mono text-2xs text-white/40 tracking-widest uppercase">MoT Transport</p>
            <p class="font-mono text-xs text-white/60 tracking-widest">{{ ticket.reference }}</p>
          </div>
          <div class="flex items-end justify-between mt-2">
            <div>
              <p class="font-mono text-2xs text-white/40 tracking-widest">DÉPART</p>
              <p class="font-display text-2xl font-bold text-white uppercase leading-none mt-1">
                {{ ticket.trajet?.origine }}
              </p>
            </div>
            <svg class="w-6 h-6 text-soleil mb-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
            </svg>
            <div class="text-right">
              <p class="font-mono text-2xs text-white/40 tracking-widest">ARRIVÉE</p>
              <p class="font-display text-2xl font-bold text-white uppercase leading-none mt-1">
                {{ ticket.trajet?.destination }}
              </p>
            </div>
          </div>
        </div>

        <!-- Ligne perforée -->
        <div class="ticket-tear" />

        <!-- Corps ticket avec QR -->
        <div class="ticket-body flex flex-col items-center gap-4 py-5">
          <!-- QR Code -->
          <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <QrcodeVue :value="ticket.qr_code || ticket.reference" :size="180" level="M" />
          </div>

          <!-- Référence copiable -->
          <button
            class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 active:scale-95 transition-transform"
            @click="copyRef"
          >
            <p class="font-mono text-xs text-pierre tracking-widest">{{ ticket.reference }}</p>
            <svg class="w-3.5 h-3.5 text-pierre" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
          </button>

          <!-- Détails -->
          <div class="w-full flex flex-col gap-2.5 pt-2 border-t border-slate-200/60">
            <InfoRow label="Date" :value="ticket.trajet?.date_depart" />
            <InfoRow label="Départ" :value="ticket.trajet?.heure" />
            <InfoRow v-if="ticket.sieges?.length" label="Siège(s)" :value="ticket.sieges.join(', ')" />
            <InfoRow v-if="ticket.bus" label="Bus" :value="ticket.bus.numero" />
            <InfoRow label="Paiement" :value="modeLabel(ticket.mode_paiement)" />
            <div class="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span class="font-mono text-2xs text-pierre tracking-widest uppercase">Montant</span>
              <span class="font-display text-lg font-bold text-route">{{ fmt(ticket.montant_total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Annulation -->
      <div v-if="canCancel" class="px-4 mt-5 pb-4">
        <AppButton variant="outline" @click="showCancel = true">
          Annuler la réservation
        </AppButton>
      </div>
    </div>

    <!-- Modal annulation -->
    <transition name="fade">
      <div v-if="showCancel" class="fixed inset-0 bg-black/60 z-50 flex items-end max-w-[430px] mx-auto">
        <div class="bg-white w-full rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-4">
          <div class="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-2" />
          <div class="text-center mb-2">
            <p class="font-display text-xl font-bold text-encre">Annuler ce billet ?</p>
            <p class="font-sans text-sm text-pierre mt-2 leading-relaxed">
              Ta place sera libérée et la réservation sera définitivement annulée.
            </p>
          </div>
          <AppButton variant="danger" :loading="cancelling" @click="cancelTicket">Confirmer l'annulation</AppButton>
          <AppButton variant="secondary" @click="showCancel = false">Garder mon billet</AppButton>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reservationApi } from '@/api'
import { useToast } from '@/composables/useToast'
import QrcodeVue from 'qrcode.vue'
import AppBadge  from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'

const route      = useRoute()
const router     = useRouter()
const toast      = useToast()
const loading    = ref(true)
const cancelling = ref(false)
const showCancel = ref(false)
const ticket     = ref(null)

const InfoRow = defineComponent({
  props: { label: String, value: String },
  setup: p => () => h('div', { class: 'flex justify-between items-center' }, [
    h('span', { class: 'font-mono text-2xs text-pierre tracking-widest uppercase' }, p.label),
    h('span', { class: 'font-sans text-sm font-medium text-encre' }, p.value || '—'),
  ])
})

const canCancel = computed(() =>
  ticket.value?.statut === 'valide' &&
  (ticket.value?.trajet?.date_depart || '') >= new Date().toISOString().slice(0, 10)
)

function fmt(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA' }
function modeLabel(m) {
  return { mobile_money: 'Mobile Money', cash: 'Espèces en gare', carte_bancaire: 'Carte bancaire' }[m] || m
}
function copyRef() {
  navigator.clipboard?.writeText(ticket.value.reference)
  toast.success('Référence copiée !')
}
async function cancelTicket() {
  cancelling.value = true
  try {
    await reservationApi.cancel(route.params.ref)
    ticket.value.statut = 'annule'
    showCancel.value = false
    toast.success('Réservation annulée.')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Impossible d\'annuler.')
  } finally {
    cancelling.value = false
  }
}
onMounted(async () => {
  try {
    const { data } = await reservationApi.show(route.params.ref)
    ticket.value = data
  } finally {
    loading.value = false
  }
})
</script>
