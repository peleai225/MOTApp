<template>
  <div class="page-container bg-slate-50">
    <PageHeader title="Paiement" />

    <div class="flex-1 px-5 py-5 flex flex-col gap-5 overflow-y-auto">
      <!-- Récapitulatif -->
      <div class="card">
        <p class="section-title">Récapitulatif</p>
        <div class="flex flex-col gap-2 text-sm">
          <div class="flex items-center gap-3">
            <span class="text-xl">🚌</span>
            <span class="font-medium text-neutral-900">{{ recap.trajet }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xl">📅</span>
            <span class="text-slate-600">{{ recap.date }} · {{ recap.heure }}</span>
          </div>
          <div v-if="recap.sieges" class="flex items-center gap-3">
            <span class="text-xl">💺</span>
            <span class="text-slate-600">Siège(s) {{ recap.sieges }}</span>
          </div>
        </div>
        <div class="border-t border-slate-100 mt-4 pt-3 flex justify-between">
          <span class="text-sm text-slate-500">Total</span>
          <span class="font-bold text-base text-neutral-900">{{ fmt(total) }}</span>
        </div>
      </div>

      <!-- Mode de paiement -->
      <div class="card">
        <p class="section-title">Mode de paiement</p>
        <div class="flex flex-col gap-3">
          <label
            v-for="m in modes"
            :key="m.value"
            class="flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all"
            :class="mode === m.value ? 'border-primary bg-blue-50' : 'border-slate-100 bg-slate-50'"
          >
            <input type="radio" :value="m.value" v-model="mode" class="hidden" />
            <span class="text-2xl">{{ m.icon }}</span>
            <div class="flex-1">
              <p class="text-sm font-semibold text-neutral-900">{{ m.label }}</p>
              <p class="text-xs text-slate-400">{{ m.sub }}</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                 :class="mode === m.value ? 'border-primary' : 'border-slate-300'">
              <div v-if="mode === m.value" class="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
          </label>
        </div>
      </div>

      <!-- Nom passager (optionnel) -->
      <AppInput v-model="nomPassager" label="Nom du passager" placeholder="Koné Mamadou (facultatif)" />
    </div>

    <!-- CTA fixe -->
    <div class="px-5 py-4 bg-white border-t border-slate-100">
      <Button :loading="loading" @click="confirm">Confirmer la réservation</Button>
    </div>

    <!-- Overlay chargement -->
    <div v-if="loading" class="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center gap-4">
      <svg class="animate-spin h-10 w-10 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      <p class="text-white font-medium">Réservation en cours…</p>
      <p class="text-white/70 text-sm">Ne ferme pas l'application</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useAuthStore }   from '@/stores/auth'
import { reservationApi } from '@/api'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'
import AppInput   from '@/components/ui/AppInput.vue'

const route  = useRoute()
const router = useRouter()
const search = useSearchStore()
const auth   = useAuthStore()

const loading     = ref(false)
const mode        = ref<'mobile_money' | 'especes' | 'carte'>('mobile_money')
const nomPassager = ref('')

const departId = route.query.depart
const siegesParam = route.query.sieges ? route.query.sieges.split(',') : null

const trip = computed(() => search.results.find(t => t.id == departId))

const total = computed(() => (trip.value?.prix_adulte || 0) * search.params.places)

const recap = computed(() => ({
  trajet:  `${trip.value?.origine?.nom || '?'} → ${trip.value?.destination?.nom || '?'}`,
  date:    trip.value?.date_depart || '',
  heure:   trip.value?.heure_depart || '',
  sieges:  siegesParam?.join(', ') || null,
}))

const modes = [
  { value: 'mobile_money',   icon: '📱', label: 'Mobile Money',     sub: 'Orange Money / Wave / MTN' },
  { value: 'cash',           icon: '💵', label: 'Espèces à la gare', sub: 'Payer en arrivant' },
  { value: 'carte_bancaire', icon: '💳', label: 'Carte bancaire',    sub: 'Visa / Mastercard' },
]

function fmt(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA' }

async function confirm() {
  if (!auth.isLoggedIn) { router.push({ name: 'login', query: { redirect: route.fullPath } }); return }

  loading.value = true
  try {
    const payload = {
      depart_id:    parseInt(departId),
      nombre_places: search.params.places,
      mode_paiement: mode.value,
    }
    if (siegesParam?.length)  payload.sieges = siegesParam
    if (nomPassager.value)    payload.nom_passager = nomPassager.value

    const { data } = await reservationApi.store(payload)
    router.replace({ name: 'confirmation', params: { ref: data.reservation.reference } })
  } catch (e) {
    const msg = e.response?.data?.message || 'Erreur lors de la réservation.'
    toast.error(msg)
    loading.value = false
  }
}
</script>
