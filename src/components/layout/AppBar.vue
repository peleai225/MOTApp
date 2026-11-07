<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ChevronLeft, X } from 'lucide-vue-next'
import { haptic } from '@/lib/haptics'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  back?: boolean
  close?: boolean
  backTo?: RouteLocationRaw
  tone?: 'light' | 'blue' | 'night' | 'clear'
  elevated?: boolean
  /** Remplace le comportement du bouton retour (ex. étape précédente d'un formulaire) */
  backAction?: () => void
}>(), { back: true, tone: 'light', backTo: '/' })

const router = useRouter()

function goBack() {
  haptic.tap()
  if (props.backAction) props.backAction()
  else if (!props.close && window.history.state?.back) router.back()
  else router.replace(props.backTo)
}
</script>

<template>
  <header
    class="safe-top relative z-20 shrink-0 transition-shadow duration-200"
    :class="[
      tone === 'blue' ? 'bg-bleu text-white' : tone === 'night' ? 'bg-bleu-900 text-white' : tone === 'clear' ? 'bg-transparent' : 'bg-surface text-encre',
      elevated && tone === 'light' ? 'shadow-divider' : '',
    ]"
  >
    <div class="flex h-14 items-center gap-1 px-2">
      <button
        v-if="back || close"
        type="button"
        class="icon-btn shrink-0"
        :class="tone === 'blue' || tone === 'night' ? 'text-white active:bg-surface/15' : ''"
        :aria-label="close ? 'Fermer' : 'Retour'"
        @click="goBack"
      >
        <X v-if="close" class="h-6 w-6" :stroke-width="2" />
        <ChevronLeft v-else class="h-7 w-7" :stroke-width="2" />
      </button>
      <div v-else class="w-3" />

      <div class="min-w-0 flex-1 px-1">
        <slot name="title">
          <p v-if="title" class="truncate font-display text-[20px] font-semibold leading-6">{{ title }}</p>
          <p v-if="subtitle" class="truncate text-[13px] leading-4" :class="tone === 'blue' || tone === 'night' ? 'text-white/75' : 'text-asphalte'">{{ subtitle }}</p>
        </slot>
      </div>

      <div class="flex shrink-0 items-center gap-1 pr-1">
        <slot name="right" />
      </div>
    </div>
    <slot />
  </header>
</template>
