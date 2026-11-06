<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Clock3, Ticket, CircleUserRound } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets'
import { haptic } from '@/lib/haptics'

const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()

const tabs = computed(() => [
  { name: 'home',       to: '/',        label: 'Accueil', icon: House },
  { name: 'departures', to: '/departs', label: 'Départs', icon: Clock3 },
  { name: 'tickets',    to: '/billets', label: 'Billets', icon: Ticket, badge: tickets.upcoming.length },
  { name: 'profile',    to: '/profil',  label: 'Profil',  icon: CircleUserRound },
])

function select(tab: { name: string; to: string }) {
  haptic.tap()
  if (route.name === tab.name) {
    // Comme sur une app native : toucher l'onglet actif remonte en haut
    window.dispatchEvent(new CustomEvent('mot:tab-reselect', { detail: tab.name }))
    return
  }
  router.push(tab.to)
}
</script>

<template>
  <nav
    class="absolute inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 backdrop-blur-xl"
    :style="{ paddingBottom: 'var(--safe-bottom)' }"
    aria-label="Navigation principale"
  >
    <div class="flex h-16 items-stretch">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="flex flex-1 flex-col items-center justify-center gap-1"
        :aria-current="route.name === tab.name ? 'page' : undefined"
        @click="select(tab)"
      >
        <span
          class="relative flex h-8 w-[58px] items-center justify-center rounded-full transition-colors duration-200"
          :class="route.name === tab.name ? 'bg-bleu-50 text-bleu-ink' : 'text-asphalte'"
        >
          <component :is="tab.icon" class="h-[22px] w-[22px]" :stroke-width="route.name === tab.name ? 2.2 : 1.8" />
          <span
            v-if="tab.badge"
            class="absolute right-2.5 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rouge px-1 text-[10.5px] font-bold leading-none text-white ring-2 ring-surface"
          >{{ tab.badge }}</span>
        </span>
        <span class="text-[12px] font-semibold leading-none" :class="route.name === tab.name ? 'text-bleu-ink' : 'text-asphalte'">
          {{ tab.label }}
        </span>
      </button>
    </div>
  </nav>
</template>
