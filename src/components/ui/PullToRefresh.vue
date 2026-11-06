<script setup lang="ts">
import { computed, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { haptic } from '@/lib/haptics'

const props = defineProps<{ onRefresh: () => Promise<unknown> }>()

const el = ref<HTMLElement | null>(null)
const pull = ref(0)
const refreshing = ref(false)
let y0 = 0
let tracking = false
let armed = false

const THRESHOLD = 70

function start(e: TouchEvent) {
  if (refreshing.value || (el.value?.scrollTop ?? 0) > 0) return
  y0 = e.touches[0].clientY
  tracking = true
  armed = false
}
function move(e: TouchEvent) {
  if (!tracking) return
  const dy = e.touches[0].clientY - y0
  if (dy <= 0 || (el.value?.scrollTop ?? 0) > 0) { pull.value = 0; return }
  if (e.cancelable) e.preventDefault()
  pull.value = Math.min(120, dy * 0.45)
  if (pull.value >= THRESHOLD && !armed) { armed = true; haptic.select() }
  if (pull.value < THRESHOLD) armed = false
}
async function end() {
  if (!tracking) return
  tracking = false
  if (pull.value >= THRESHOLD) {
    refreshing.value = true
    pull.value = 56
    try { await props.onRefresh() } finally {
      refreshing.value = false
      pull.value = 0
    }
  } else {
    pull.value = 0
  }
}

const progress = computed(() => Math.min(1, pull.value / THRESHOLD))
defineExpose({ el })
</script>

<template>
  <div
    ref="el"
    class="view-scroll relative"
    @touchstart.passive="start"
    @touchmove="move"
    @touchend="end"
    @touchcancel="end"
  >
    <div
      class="pointer-events-none flex items-end justify-center overflow-hidden"
      :class="tracking ? '' : 'transition-[height] duration-300 ease-native'"
      :style="{ height: `${pull}px` }"
      aria-hidden="true"
    >
      <span
        class="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-bleu-ink shadow-lift"
        :style="{ opacity: progress, transform: `rotate(${progress * 270}deg)` }"
      >
        <RefreshCw class="h-[18px] w-[18px]" :class="refreshing ? 'animate-spin' : ''" :stroke-width="2.4" />
      </span>
    </div>
    <slot />
  </div>
</template>
