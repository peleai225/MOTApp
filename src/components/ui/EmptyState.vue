<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ icon: Component; title: string; text?: string; tone?: 'neutral' | 'error' }>()
</script>

<template>
  <div class="flex flex-col items-center px-8 py-14 text-center">
    <span
      class="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[22px]"
      :class="tone === 'error' ? 'bg-rouge-50 text-rouge' : 'bg-bleu-50 text-bleu-ink'"
    >
      <component :is="icon" class="h-8 w-8" :stroke-width="1.7" />
    </span>
    <h2 class="font-display text-[24px] font-semibold leading-7 text-encre">{{ title }}</h2>
    <p v-if="text" class="mt-2 max-w-[290px] text-[15px] leading-[22px] text-asphalte">{{ text }}</p>
    <div v-if="$slots.default" class="mt-6 flex w-full max-w-[280px] flex-col gap-2">
      <slot />
    </div>
  </div>
</template>
