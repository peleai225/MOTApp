<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { Siege } from '@/types'

defineProps<{ rows: (Siege | null)[][]; selected: string[] }>()
const emit = defineEmits<{ toggle: [Siege] }>()

function seatLabel(s: Siege, isSel: boolean) {
  const pos = s.position === 'fenetre' ? ', côté fenêtre' : s.position === 'couloir' ? ', côté couloir' : ''
  return `Place ${s.numero}${pos}, ${!s.disponible ? 'occupée' : isSel ? 'sélectionnée' : 'libre'}`
}
</script>

<template>
  <div class="mx-auto w-full max-w-[312px] rounded-[48px_48px_26px_26px] bg-surface px-5 pb-6 pt-5 shadow-[0_0_0_3px_rgb(var(--c-ligne))]">
    <!-- Avant du car -->
    <div class="mb-4 flex items-center justify-between border-b-2 border-dashed border-hairline px-1 pb-4">
      <span class="flex flex-col items-center gap-1 text-gravier">
        <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.4" />
          <path d="M12 14.4V21M9.7 11.3 3.4 9.6M14.3 11.3l6.3-1.7" stroke-linecap="round" />
        </svg>
        <span class="text-[11px] font-medium">Chauffeur</span>
      </span>
      <span class="text-[12.5px] font-semibold text-asphalte">Avant du car</span>
      <span class="flex flex-col items-center gap-1 text-gravier">
        <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <rect x="6" y="3" width="12" height="18" rx="1.5" /><path d="M12 3v18" /><path d="M10 12h.01M14 12h.01" stroke-linecap="round" stroke-width="2.4" />
        </svg>
        <span class="text-[11px] font-medium">Porte</span>
      </span>
    </div>

    <!-- Rangées 2 + 2 -->
    <div class="flex flex-col gap-2.5" role="group" aria-label="Plan des places">
      <div v-for="(row, ri) in rows" :key="ri" class="grid grid-cols-[1fr_1fr_26px_1fr_1fr] items-center gap-2">
        <template v-for="(seat, ci) in row" :key="ci">
          <span v-if="ci === 2" class="num text-center text-[11.5px] font-semibold text-gravier">{{ ri + 1 }}</span>
          <span v-if="!seat" class="aspect-square" />
          <button
            v-else
            type="button"
            class="seat relative flex aspect-square items-center justify-center rounded-[11px_11px_8px_8px] text-[13px] font-semibold"
            :class="!seat.disponible ? 'seat-taken' : selected.includes(seat.numero) ? 'seat-selected' : 'seat-free'"
            :disabled="!seat.disponible"
            :aria-pressed="selected.includes(seat.numero)"
            :aria-label="seatLabel(seat, selected.includes(seat.numero))"
            @click="emit('toggle', seat)"
          >
            <Check v-if="selected.includes(seat.numero)" class="h-[18px] w-[18px]" :stroke-width="3" />
            <span v-else-if="seat.disponible" class="num">{{ seat.numero }}</span>
          </button>
          <span v-if="ci === 1 && row.length === 2" class="text-center text-[11.5px] text-gravier">{{ ri + 1 }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seat { transition: transform 160ms cubic-bezier(0.32, 0.72, 0, 1), background-color 160ms, box-shadow 160ms, color 160ms; }
.seat::before {
  /* dossier */
  content: '';
  position: absolute;
  left: 18%; right: 18%; top: 4px;
  height: 3px;
  border-radius: 3px;
  background: currentColor;
  opacity: 0.35;
}
.seat-free { background: rgb(var(--c-surface)); color: rgb(var(--c-accent)); box-shadow: inset 0 0 0 2px rgb(var(--c-bleu-200)); }
.seat-free:active { transform: scale(0.92); }
.seat-selected { background: #1F3285; color: #fff; box-shadow: 0 6px 14px -6px rgba(31, 50, 133, 0.7); transform: scale(1.04); }
.seat-taken {
  color: rgb(var(--c-gravier));
  background: repeating-linear-gradient(135deg, rgb(var(--c-track)) 0 6px, rgb(var(--c-ciel)) 6px 12px);
  cursor: not-allowed;
}
.seat-taken::before { opacity: 0.25; }
</style>
