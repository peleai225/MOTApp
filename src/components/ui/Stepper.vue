<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'
import { haptic } from '@/lib/haptics'

const props = withDefaults(defineProps<{ modelValue: number; min?: number; max?: number; label?: string }>(), { min: 1, max: 10 })
const emit = defineEmits<{ 'update:modelValue': [number] }>()

function step(d: number) {
  const v = Math.min(props.max, Math.max(props.min, props.modelValue + d))
  if (v !== props.modelValue) { haptic.select(); emit('update:modelValue', v) }
}
</script>

<template>
  <div class="flex items-center gap-1" role="group" :aria-label="label">
    <button
      type="button"
      class="tap flex h-10 w-10 items-center justify-center rounded-full bg-bleu-50 text-bleu-ink disabled:opacity-35"
      :disabled="modelValue <= min"
      aria-label="Retirer un voyageur"
      @click="step(-1)"
    >
      <Minus class="h-[18px] w-[18px]" :stroke-width="2.5" />
    </button>
    <output class="num w-9 text-center font-display text-[24px] font-semibold leading-none" aria-live="polite">{{ modelValue }}</output>
    <button
      type="button"
      class="tap flex h-10 w-10 items-center justify-center rounded-full bg-bleu-50 text-bleu-ink disabled:opacity-35"
      :disabled="modelValue >= max"
      aria-label="Ajouter un voyageur"
      @click="step(1)"
    >
      <Plus class="h-[18px] w-[18px]" :stroke-width="2.5" />
    </button>
  </div>
</template>
