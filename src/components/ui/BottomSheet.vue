<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { registerOverlay } from '@/lib/native'

const props = defineProps<{ open: boolean; title?: string; description?: string; tall?: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; closed: [] }>()

const panel = ref<HTMLElement | null>(null)
const drag = ref({ active: false, y0: 0, dy: 0, t0: 0 })

function close() { emit('update:open', false) }

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

let unregister: (() => void) | null = null
watch(() => props.open, async v => {
  unregister?.(); unregister = null
  if (v) {
    // Le bouton retour Android ferme la feuille avant de quitter l'écran
    unregister = registerOverlay(close)
    document.addEventListener('keydown', onKey)
    await nextTick()
    panel.value?.focus({ preventScroll: true })
  } else {
    document.removeEventListener('keydown', onKey)
  }
})
onUnmounted(() => { document.removeEventListener('keydown', onKey); unregister?.() })

function start(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  drag.value = { active: true, y0: e.clientY, dy: 0, t0: performance.now() }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!drag.value.active) return
  drag.value.dy = Math.max(0, e.clientY - drag.value.y0)
}
function end() {
  if (!drag.value.active) return
  const { dy, t0 } = drag.value
  const velocity = dy / Math.max(1, performance.now() - t0)
  drag.value = { active: false, y0: 0, dy: 0, t0: 0 }
  if (dy > 110 || (dy > 30 && velocity > 0.6)) close()
}

const panelStyle = computed(() => drag.value.active
  ? { transform: `translateY(${drag.value.dy}px)`, transition: 'none' }
  : {})
</script>

<template>
  <Teleport defer to="#overlay-root">
    <Transition name="sheet-bg">
      <div v-if="open" class="pointer-events-auto absolute inset-0 bg-[#0D1530]/50 dark:bg-black/60" @click="close" />
    </Transition>
    <Transition name="sheet" @after-leave="emit('closed')">
      <div
        v-if="open"
        ref="panel"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="sheet-panel pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col rounded-t-[28px] bg-surface shadow-sheet outline-none"
        :class="tall ? 'h-[88%]' : 'max-h-[88%]'"
        :style="panelStyle"
      >
        <div
          class="shrink-0 cursor-grab touch-none select-none"
          @pointerdown="start" @pointermove="move" @pointerup="end" @pointercancel="end"
        >
          <div class="flex justify-center pb-2 pt-2.5">
            <span class="h-[5px] w-10 rounded-full bg-chevron" />
          </div>
          <div v-if="title || $slots.header" class="px-5 pb-3">
            <slot name="header">
              <h2 class="font-display text-[24px] font-semibold leading-7">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-sm text-asphalte">{{ description }}</p>
            </slot>
          </div>
        </div>
        <div class="view-scroll px-5" :class="$slots.footer ? 'pb-3' : 'safe-bottom'">
          <slot />
        </div>
        <div v-if="$slots.footer" class="safe-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-panel { transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-active, .sheet-leave-active { transition: transform 380ms cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
.sheet-bg-enter-active, .sheet-bg-leave-active { transition: opacity 300ms ease; }
.sheet-bg-enter-from, .sheet-bg-leave-to { opacity: 0; }
</style>
