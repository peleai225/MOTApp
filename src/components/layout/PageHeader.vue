<template>
  <header class="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100/80">
    <button
      v-if="back"
      @click="router.back()"
      class="w-9 h-9 -ml-1 flex items-center justify-center rounded-xl hover:bg-slate-50 text-encre transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    <div class="flex-1 min-w-0">
      <h1 class="font-display font-semibold text-lg text-encre leading-tight truncate">{{ title }}</h1>
      <p v-if="subtitle" class="font-sans text-xs text-pierre mt-0.5 truncate">{{ subtitle }}</p>
    </div>
    <slot name="right" />
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<{ title: string; subtitle?: string; back?: boolean }>(), { back: true })
const router = useRouter()
</script>
