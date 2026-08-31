<template>
  <div class="page-container bg-white">
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <svg class="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>

    <div v-else-if="reservation" class="flex-1 flex flex-col items-center px-6 py-8">
      <!-- Succès -->
      <div class="flex flex-col items-center gap-3 mb-8">
        <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">✅</div>
        <h1 class="text-2xl font-bold text-neutral-900">Réservation confirmée !</h1>
        <p class="text-slate-500 text-base">Bon voyage, {{ auth.user?.prenom }}.</p>
      </div>

      <!-- Carte billet -->
      <div class="w-full card border-2 border-primary/10 flex flex-col items-center gap-4 py-6">
        <!-- QR Code -->
        <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <QrcodeVue :value="reservation.qr_code || reservation.reference" :size="180" level="M" />
        </div>

        <p class="font-mono text-sm text-slate-600 tracking-wider">{{ reservation.reference }}</p>

        <div class="w-full border-t border-dashed border-slate-200 pt-4 flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Trajet</span>
            <span class="font-semibold text-right">{{ reservation.trajet?.origine }} → {{ reservation.trajet?.destination }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Départ</span>
            <span class="font-semibold">{{ reservation.trajet?.date_depart }} · {{ reservation.trajet?.heure }}</span>
          </div>
          <div v-if="reservation.sieges?.length" class="flex justify-between">
            <span class="text-slate-500">Siège(s)</span>
            <span class="font-semibold">{{ reservation.sieges.join(', ') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Montant</span>
            <span class="font-bold text-primary">{{ fmt(reservation.montant_total) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="w-full flex flex-col gap-3 mt-6">
        <AppButton variant="secondary" @click="router.push(`/billet/${reservation.reference}`)">
          📋 Voir mon billet
        </AppButton>
        <button class="text-slate-500 text-sm font-medium" @click="router.push('/')">
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reservationApi } from '@/api'
import { useAuthStore }   from '@/stores/auth'
import QrcodeVue from 'qrcode.vue'
import AppButton from '@/components/ui/AppButton.vue'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const loading     = ref(true)
const reservation = ref(null)

function fmt(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA' }

onMounted(async () => {
  try {
    const { data } = await reservationApi.show(route.params.ref)
    reservation.value = data
  } finally {
    loading.value = false
  }
})
</script>
