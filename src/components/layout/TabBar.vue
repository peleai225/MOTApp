<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-nuit pb-safe max-w-[430px] mx-auto">
    <div class="flex">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex-1 flex flex-col items-center pt-3 pb-2 gap-1 relative transition-colors duration-200"
        :class="isActive(tab.to) ? 'text-white' : 'text-slate-500'"
      >
        <!-- Icône -->
        <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" :stroke-width="isActive(tab.to) ? '2' : '1.75'" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
        </svg>

        <span class="text-[10px] font-sans font-medium tracking-wide">{{ tab.label }}</span>

        <!-- Barre active Soleil -->
        <transition name="tab-bar">
          <span v-if="isActive(tab.to)" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-soleil" />
        </transition>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  {
    to: '/',
    label: 'Accueil',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    to: '/billets',
    label: 'Billets',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  },
  {
    to: '/profil',
    label: 'Profil',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<style scoped>
.tab-bar-enter-active, .tab-bar-leave-active { transition: transform 0.18s ease, opacity 0.15s ease; }
.tab-bar-enter-from, .tab-bar-leave-to       { transform: translateX(-50%) scaleX(0); opacity: 0; }
</style>
