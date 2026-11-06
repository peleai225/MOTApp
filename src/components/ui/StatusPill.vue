<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ statut?: string | null; tone?: 'light' | 'onDark' }>()

const MAP: Record<string, { label: string; cls: string; dot: string }> = {
  valide:  { label: 'Valide',  cls: 'bg-vert-50 text-vert',      dot: 'bg-vert' },
  utilise: { label: 'Utilisé', cls: 'bg-track text-asphalte', dot: 'bg-gravier' },
  annule:  { label: 'Annulé',  cls: 'bg-rouge-50 text-rouge',    dot: 'bg-rouge' },
  expire:  { label: 'Expiré',  cls: 'bg-ambre-50 text-ambre',    dot: 'bg-ambre' },
}
const s = computed(() => MAP[props.statut || ''] ?? { label: props.statut || '—', cls: 'bg-track text-asphalte', dot: 'bg-gravier' })
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold leading-none" :class="s.cls">
    <span class="h-1.5 w-1.5 rounded-full" :class="s.dot" />
    {{ s.label }}
  </span>
</template>
