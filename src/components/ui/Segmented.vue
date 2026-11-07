<script setup lang="ts" generic="T extends string">
import { computed } from 'vue'
import { haptic } from '@/lib/haptics'

const props = defineProps<{ modelValue: T; options: { value: T; label: string; count?: number }[] }>()
const emit = defineEmits<{ 'update:modelValue': [T] }>()

const index = computed(() => Math.max(0, props.options.findIndex(o => o.value === props.modelValue)))

function pick(v: T) {
  if (v === props.modelValue) return
  haptic.select()
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="relative flex rounded-[14px] bg-track p-1" role="tablist">
    <span
      class="absolute bottom-1 top-1 rounded-[11px] bg-surface shadow-[0_1px_3px_rgba(13,21,48,0.12)] dark:bg-[#2E3960] dark:shadow-none transition-transform duration-300 ease-native"
      :style="{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }"
      aria-hidden="true"
    />
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      role="tab"
      :aria-selected="o.value === modelValue"
      class="relative z-10 flex h-9 flex-1 items-center justify-center gap-1.5 text-[15px] font-semibold transition-colors"
      :class="o.value === modelValue ? 'text-encre' : 'text-asphalte'"
      @click="pick(o.value)"
    >
      {{ o.label }}
      <span
        v-if="o.count"
        class="num rounded-full px-1.5 text-[11.5px] leading-[18px]"
        :class="o.value === modelValue ? 'bg-bleu text-white' : 'bg-surface/70 text-asphalte'"
      >{{ o.count }}</span>
    </button>
  </div>
</template>
