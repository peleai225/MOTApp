<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import StatusPill from '@/components/ui/StatusPill.vue'
import { addDays, fcfa, isoDate, minutesUntil, parseDate } from '@/lib/format'
import type { Reservation } from '@/types'

const props = defineProps<{ ticket: Reservation; past?: boolean }>()

const d = computed(() => props.ticket.trajet?.date_depart ? parseDate(props.ticket.trajet.date_depart) : null)

const countdown = computed(() => {
  const tr = props.ticket.trajet
  if (props.past || !tr || props.ticket.statut !== 'valide') return ''
  const m = minutesUntil(tr.date_depart, tr.heure)
  if (m < 0) return 'Départ en cours'
  if (m <= 45) return 'Embarquement bientôt'
  if (m < 60 * 4) {
    const h = Math.floor(m / 60)
    return h ? `Départ dans ${h} h ${String(m % 60).padStart(2, '0')}` : `Départ dans ${m} min`
  }
  const t = isoDate()
  if (tr.date_depart === t) return Number(tr.heure.slice(0, 2)) >= 18 ? 'Départ ce soir' : 'Départ aujourd’hui'
  if (tr.date_depart === addDays(t, 1)) return 'Départ demain'
  const days = Math.round((parseDate(tr.date_depart).getTime() - parseDate(t).getTime()) / 86_400_000)
  return `Départ dans ${days} jours`
})
</script>

<template>
  <button
    type="button"
    class="tap relative flex w-full items-stretch rounded-[22px] bg-surface text-left shadow-lift"
    :aria-label="`Billet ${ticket.trajet?.origine} vers ${ticket.trajet?.destination}`"
  >
    <!-- Talon daté -->
    <div
      class="flex w-[78px] shrink-0 flex-col items-center justify-center rounded-l-[22px] py-4"
      :class="past ? 'bg-track text-asphalte' : 'bg-bleu text-white'"
    >
      <span class="text-[12.5px] font-medium capitalize leading-none opacity-80">{{ d?.toLocaleDateString('fr-FR', { weekday: 'short' }) }}</span>
      <span class="num mt-1 font-display text-[34px] font-semibold leading-none">{{ d?.getDate() }}</span>
      <span class="mt-1 text-[12.5px] leading-none opacity-80">{{ d?.toLocaleDateString('fr-FR', { month: 'short' }) }}</span>
    </div>

    <!-- Perforation verticale -->
    <div class="relative w-0" aria-hidden="true">
      <span class="absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full bg-ciel" />
      <span class="absolute bottom-3 top-3 border-l-2 border-dashed border-hairline" />
      <span class="absolute -bottom-[9px] -left-[9px] h-[18px] w-[18px] rounded-full bg-ciel" />
    </div>

    <div class="min-w-0 flex-1 py-3.5 pl-4 pr-4">
      <p class="flex items-center gap-1.5 font-display text-[21px] font-semibold leading-6" :class="past ? 'text-asphalte' : 'text-encre'">
        <span class="truncate">{{ ticket.trajet?.origine }}</span>
        <ArrowRight class="h-4 w-4 shrink-0 text-gravier" :stroke-width="2.4" />
        <span class="truncate">{{ ticket.trajet?.destination }}</span>
      </p>
      <p class="mt-0.5 text-[14px] text-asphalte">
        <span class="num font-semibold text-encre">{{ ticket.trajet?.heure }}</span>
        <template v-if="ticket.sieges?.length">, place{{ ticket.sieges.length > 1 ? 's' : '' }} {{ ticket.sieges.join(', ') }}</template>
        <template v-else>, {{ ticket.nombre_places }} place{{ ticket.nombre_places > 1 ? 's' : '' }}</template>
      </p>
      <div class="mt-2.5 flex items-center justify-between gap-2">
        <span v-if="countdown" class="truncate text-[13px] font-semibold text-bleu-ink">{{ countdown }}</span>
        <StatusPill v-else :statut="ticket.statut" />
        <span class="num shrink-0 text-[14px] font-semibold text-asphalte">{{ fcfa(ticket.montant_total) }}</span>
      </div>
    </div>
  </button>
</template>
