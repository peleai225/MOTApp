<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative overflow-hidden flex items-center justify-center font-sans font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed"
    :class="[variantClass, sizeClass, block ? 'w-full' : 'px-6']"
    v-bind="$attrs"
  >
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </span>
    <span :class="loading ? 'opacity-0' : 'flex items-center justify-center gap-2'">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'route' },
  type:    { type: String, default: 'button' },
  block:   { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  disabled:{ type: Boolean, default: false },
  size:    { type: String, default: 'md' },
})
defineOptions({ inheritAttrs: false })

const variantClass = computed(() => ({
  route:         'bg-route text-white rounded-btn shadow-btn disabled:bg-slate-300 disabled:shadow-none',
  outline:       'border-[1.5px] border-route text-route rounded-btn bg-transparent',
  'outline-white':'border-[1.5px] border-white/40 text-white rounded-btn bg-transparent',
  danger:        'bg-red-600 text-white rounded-btn shadow-sm',
  ghost:         'text-route bg-transparent',
  secondary:     'border-[1.5px] border-slate-200 text-encre rounded-btn bg-white',
  // legacy
  primary:       'bg-route text-white rounded-btn shadow-btn disabled:bg-slate-300 disabled:shadow-none',
}[props.variant]))

const sizeClass = computed(() => ({
  sm: 'h-10 text-sm',
  md: 'h-[52px] text-base',
  lg: 'h-14 text-lg',
}[props.size]))
</script>
