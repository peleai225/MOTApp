<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { usePreferredReducedMotion } from '@vueuse/core'
import { WifiOff, ChevronLeft } from 'lucide-vue-next'
import { Toaster } from 'vue-sonner'
import { navDirection } from '@/router'
import { isDemo } from '@/api'
import { useAppStore } from '@/stores/app'
import { haptic } from '@/lib/haptics'
import { isDark } from '@/lib/theme'
import { isNative, platform } from '@/lib/native'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const motion = usePreferredReducedMotion()

const transitionName = computed(() => {
  if (motion.value === 'reduce' || navDirection.value === 'none') return 'fade'
  if (navDirection.value === 'push' && route.meta.enter === 'rise') return 'rise'
  return navDirection.value
})

/** Les onglets partagent la même coque ; les autres écrans sont identifiés par leur chemin */
function viewKey(r: typeof route) {
  return r.matched[0]?.path === '/' ? 'shell' : r.path
}

// ── Retour par glissement depuis le bord gauche ────────────────────────
const NO_SWIPE = new Set(['home', 'departures', 'tickets', 'profile', 'onboarding', 'welcome', 'confirmation'])
const swipe = ref({ active: false, x0: 0, y0: 0, dx: 0, cancelled: false })
const frame = ref<HTMLElement | null>(null)

function onTouchStart(e: TouchEvent) {
  // Android natif : le geste « retour » du système prend déjà en charge le bord de l'écran
  if (isNative && platform === 'android') return
  if (NO_SWIPE.has(String(route.name)) || window.history.length < 2) return
  const left = frame.value?.getBoundingClientRect().left ?? 0
  const t = e.touches[0]
  if (t.clientX - left > 24) return
  swipe.value = { active: true, x0: t.clientX, y0: t.clientY, dx: 0, cancelled: false }
}
function onTouchMove(e: TouchEvent) {
  const s = swipe.value
  if (!s.active) return
  const t = e.touches[0]
  if (Math.abs(t.clientY - s.y0) > 40 && s.dx < 30) { s.active = false; return }
  s.dx = Math.max(0, t.clientX - s.x0)
}
function onTouchEnd() {
  const s = swipe.value
  if (s.active && s.dx > 90) {
    haptic.tap()
    router.back()
  }
  swipe.value = { ...s, active: false, dx: 0 }
}
const swipeProgress = computed(() => Math.min(1, swipe.value.dx / 90))
</script>

<template>
  <div
    ref="frame"
    class="app-frame"
    :class="{ 'is-demo': isDemo }"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <RouterView v-slot="{ Component, route: r }">
      <Transition :name="transitionName">
        <KeepAlive :include="['AppShell', 'SearchResultsView']" :max="4">
          <component :is="Component" :key="viewKey(r)" />
        </KeepAlive>
      </Transition>
    </RouterView>

    <!-- Indicateur du geste retour -->
    <div
      v-if="swipe.active && swipe.dx > 4"
      class="pointer-events-none absolute left-0 top-1/2 z-[70] -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-bleu-ink shadow-panel"
      :style="{ transform: `translateX(${-48 + swipeProgress * 64}px)`, opacity: 0.4 + swipeProgress * 0.6 }"
    >
      <ChevronLeft class="h-6 w-6" :stroke-width="2.5" />
    </div>

    <!-- Hors connexion -->
    <Transition name="fade">
      <div
        v-if="!appStore.online"
        class="pointer-events-none absolute inset-x-0 top-0 z-[65] flex justify-center"
        :style="{ paddingTop: 'calc(var(--safe-top) + 6px)' }"
        role="status"
      >
        <div class="flex items-center gap-2 rounded-full bg-encre px-3.5 py-1.5 text-xs font-medium text-surface shadow-panel">
          <WifiOff class="h-3.5 w-3.5" />
          Hors connexion, vos billets restent disponibles
        </div>
      </div>
    </Transition>

    <!-- Mode démonstration -->
    <div
      v-if="isDemo"
      class="pointer-events-none absolute inset-x-0 top-0 z-[64] flex h-[22px] items-end justify-center bg-[#B26A00] pb-[3px] text-[12px] font-semibold leading-none text-white"
      :style="{ height: 'calc(env(safe-area-inset-top, 0px) + 22px)' }"
      role="status"
    >
      Mode démo : serveur injoignable, données simulées
    </div>

    <div id="overlay-root" class="pointer-events-none absolute inset-0 z-[60]" />

    <Toaster position="bottom-center" :offset="96" :visible-toasts="2" :theme="isDark ? 'dark' : 'light'" close-button />
  </div>
</template>
