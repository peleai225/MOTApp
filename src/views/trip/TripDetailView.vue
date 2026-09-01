<template>
  <div class="page-container bg-slate-50">
    <PageHeader title="Détail du trajet">
      <template #right>
        <button class="text-slate-500 p-1">📤</button>
      </template>
    </PageHeader>

    <div v-if="loading" class="flex-1 px-5 py-6 flex flex-col gap-4">
      <Skeleton class="h-28" />
      <Skeleton class="h-40" />
      <Skeleton class="h-32" />
    </div>

    <div v-else-if="trip" class="flex-1 px-5 py-5 flex flex-col gap-4">
      <!-- Timeline -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-2xl font-bold text-neutral-900">{{ trip.heure_depart }}</p>
            <p class="text-sm text-slate-500">{{ trip.origine.nom }}</p>
          </div>
          <div class="flex-1 flex flex-col items-center px-4">
            <p class="text-xs text-slate-400 mb-2">{{ dureeFmt }}</p>
            <div class="relative w-full flex items-center">
              <div class="w-3 h-3 rounded-full border-2 border-primary bg-white z-10" />
              <div class="flex-1 border-t-2 border-dashed border-primary/30" />
              <div class="w-3 h-3 rounded-full bg-primary z-10" />
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-neutral-900">{{ trip.heure_arrivee || '—' }}</p>
            <p class="text-sm text-slate-500">{{ trip.destination.nom }}</p>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Infos -->
      <div class="card">
        <p class="section-title">Infos trajet</p>
        <div class="flex flex-col gap-2">
          <InfoRow icon="📅" :value="formatDate(trip.date_depart)" />
          <InfoRow icon="🚌" :value="`Bus N°${trip.bus?.numero || '?'} · ${trip.bus?.capacite} sièges`" />
          <InfoRow v-if="trip.distance_km" icon="📍" :value="`${trip.distance_km} km`" />
          <InfoRow icon="💺" :value="`${trip.places_disponibles} places disponibles`" :class="trip.places_disponibles <= 5 ? 'text-amber-600' : 'text-green-600'" />
        </div>
      </div>

      <Separator />

      <!-- Tarifs -->
      <Card>
        <CardContent class="pt-5">
          <p class="section-title">Tarifs</p>
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-500">Adulte</span><span class="font-semibold">{{ fmt(trip.prix_adulte) }}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Enfant</span><span class="font-semibold">{{ fmt(trip.prix_enfant) }}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Étudiant</span><span class="font-semibold">{{ fmt(trip.prix_etudiant) }}</span></div>
          </div>
        </CardContent>
      </Card>

      <Separator v-if="trip.arrets?.length" />

      <!-- Arrêts -->
      <div v-if="trip.arrets?.length" class="card">
        <p class="section-title">Arrêts</p>
        <div class="flex flex-col gap-3">
          <div v-for="(a, i) in trip.arrets" :key="i" class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full flex-shrink-0" :class="i === 0 || i === trip.arrets.length-1 ? 'bg-primary' : 'border-2 border-primary bg-white'" />
            <p class="text-sm text-neutral-900 flex-1">{{ a.nom || a }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA fixe -->
    <div class="px-5 py-4 bg-white border-t border-slate-100">
      <Button @click="router.push(`/trajet/${route.params.id}/sieges`)">
        Choisir mes sièges →
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trajetApi } from '@/api'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import type { Trajet } from '@/types'

const route  = useRoute()
const router = useRouter()
const trip   = ref<Trajet | null>(null)
const loading = ref(true)

const InfoRow = defineComponent({
  props: { icon: String, value: String },
  setup: (p) => () => h('div', { class: 'flex items-center gap-3 text-sm' }, [
    h('span', { class: 'text-base w-6' }, p.icon),
    h('span', { class: 'text-neutral-800' }, p.value),
  ])
})

const dureeFmt = computed(() => {
  const m = trip.value?.duree_minutes
  if (!m) return ''
  return `${Math.floor(m/60)}h${('0'+m%60).slice(-2)}`
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmt(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

onMounted(async () => {
  try {
    const { data } = await trajetApi.show(route.params.id)
    trip.value = data
  } finally {
    loading.value = false
  }
})
</script>
