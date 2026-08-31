<template>
  <teleport to="body">
    <div class="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 px-5 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="w-full max-w-[390px] rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg pointer-events-auto border-l-4"
          :class="styles[t.type]"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path v-if="t.type === 'success'" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            <path v-else-if="t.type === 'error'" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="font-sans text-sm font-medium flex-1 leading-snug">{{ t.message }}</p>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()

const styles = {
  success: 'bg-green-50 text-green-900 border-green-500',
  error:   'bg-red-50 text-red-900 border-red-500',
  info:    'bg-blue-50 text-blue-900 border-voyage',
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.22s ease; }
.toast-enter-from { opacity: 0; transform: translateY(10px) scale(0.97); }
.toast-leave-to   { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
