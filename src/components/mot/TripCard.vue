<script setup lang="ts">
import { computed } from 'vue'
import { arrivalTime, arrivesNextDay, duration, fcfa } from '@/lib/format'
import type { Trajet } from '@/types'

const props = defineProps<{ trip: Trajet }>()

const arr = computed(() => arrivalTime(props.trip.heure_depart, props.trip.heure_arrivee, props.trip.duree_minutes))
const nextDay = computed(() => arrivesNextDay(props.trip.heure_depart, props.trip.duree_minutes))
const few = computed(() => props.trip.places_disponibles <= 5)
</script>

<template>
  <button
    type="button"
    class="tap w-full rounded-[24px] bg-surface p-4 pb-3.5 text-left shadow-lift"
    :aria-label="`Départ ${trip.heure_depart} pour ${trip.destination.nom}, ${fcfa(trip.prix_adulte)}`"
  >
    <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <p class="num font-display text-[32px] font-semibold leading-none">{{ trip.heure_depart }}</p>
      <div class="flex flex-col items-center gap-1.5 px-1">
        <span class="text-[12.5px] font-medium text-asphalte">{{ duration(trip.duree_minutes) || 'Durée n.c.' }}</span>
        <span class="relative block h-[2px] w-full rounded bg-ligne">
          <span class="absolute -left-0.5 -top-[3px] h-2 w-2 rounded-full border-2 border-bleu-ink bg-surface" />
          <span class="absolute -right-0.5 -top-[3px] h-2 w-2 rounded-full bg-bleu-ink" />
        </span>
      </div>
      <p class="num font-display text-[32px] font-semibold leading-none" :class="arr ? 'text-encre' : 'text-gravier'">
        {{ arr || '--:--' }}<sup v-if="nextDay" class="ml-0.5 text-[13px] font-semibold text-rouge">+1</sup>
      </p>
    </div>
    <div class="mt-1.5 flex justify-between gap-4 text-[14px] text-asphalte">
      <span class="truncate">{{ trip.origine.nom }}</span>
      <span class="truncate text-right">{{ trip.destination.nom }}</span>
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-dashed border-hairline pt-3">
      <span class="text-[14px]" :class="few ? 'font-semibold text-rouge' : 'text-asphalte'">
        {{ few ? `Plus que ${trip.places_disponibles} place${trip.places_disponibles > 1 ? 's' : ''}` : `${trip.places_disponibles} places libres` }}
      </span>
      <span class="num font-display text-[24px] font-semibold leading-none text-bleu-ink">
        {{ fcfa(trip.prix_adulte, false) }}<span class="ml-1 font-sans text-[12.5px] font-semibold">FCFA</span>
      </span>
    </div>
  </button>
</template>
