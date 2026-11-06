<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { duration, fcfa, minutesUntil } from '@/lib/format'
import type { Trajet } from '@/types'

const props = defineProps<{ trip: Trajet; showOrigin?: boolean }>()

const soon = computed(() => {
  const m = minutesUntil(props.trip.date_depart, props.trip.heure_depart)
  if (m < 0 || m > 180) return null
  if (m <= 45) return { label: 'Embarquement', live: true }
  const h = Math.floor(m / 60)
  return { label: `Dans ${h ? `${h} h ` : ''}${String(m % 60).padStart(2, '0')} min`, live: false }
})
const few = computed(() => props.trip.places_disponibles <= 5)
</script>

<template>
  <button type="button" class="tap-row flex w-full items-center gap-4 px-4 py-3.5 text-left">
    <p class="num w-[62px] shrink-0 font-display text-[27px] font-semibold leading-none">{{ trip.heure_depart }}</p>
    <div class="min-w-0 flex-1">
      <p class="truncate text-[17px] font-semibold leading-6">
        <template v-if="showOrigin">{{ trip.origine.nom }} – </template>{{ trip.destination.nom }}
      </p>
      <p v-if="soon" class="flex items-center gap-1.5 truncate text-[13px] font-semibold text-bleu-ink">
        <span v-if="soon.live" class="relative flex h-2 w-2 shrink-0">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-bleu-ink opacity-50" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-bleu-ink" />
        </span>
        {{ soon.label }}
      </p>
      <p v-else class="truncate text-[13px] text-asphalte">
        {{ duration(trip.duree_minutes) ? `${duration(trip.duree_minutes)} de route` : 'Durée non communiquée' }}
      </p>
    </div>
    <div class="shrink-0 text-right">
      <p class="num text-[15px] font-semibold">{{ fcfa(trip.prix_adulte) }}</p>
      <p class="num text-[13px]" :class="few ? 'font-semibold text-rouge' : 'text-asphalte'">
        {{ trip.places_disponibles }} place{{ trip.places_disponibles > 1 ? 's' : '' }}
      </p>
    </div>
    <ChevronRight class="-mr-1 h-5 w-5 shrink-0 text-chevron" />
  </button>
</template>
