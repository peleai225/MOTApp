<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CloudOff, History, Ticket, TicketPlus } from 'lucide-vue-next'
import PullToRefresh from '@/components/ui/PullToRefresh.vue'
import Segmented from '@/components/ui/Segmented.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TicketStub from '@/components/mot/TicketStub.vue'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { useTabReselect } from '@/composables/useTabReselect'
import { relativeTime } from '@/lib/format'
import type { Reservation } from '@/types'

defineOptions({ name: 'TicketsView' })

const router = useRouter()
const tickets = useTicketsStore()
const auth = useAuthStore()

const ptr = ref<InstanceType<typeof PullToRefresh> | null>(null)
useTabReselect('tickets', computed(() => ptr.value?.el))

const tab = ref<'upcoming' | 'past'>('upcoming')
const list = computed(() => (tab.value === 'upcoming' ? tickets.upcoming : tickets.past))
const firstLoad = computed(() => tickets.loading && !tickets.list.length)

function open(t: Reservation) {
  router.push({ name: 'ticket', params: { reference: t.reference } })
}

function sync() {
  if (!auth.isLoggedIn) return Promise.resolve()
  return tickets.refresh()
}

onMounted(() => { tickets.hydrate(); sync() })
onActivated(() => { if (!tickets.syncedAt || Date.now() - tickets.syncedAt > 60_000) sync() })
watch(() => auth.isLoggedIn, v => { if (v) { tickets.clear(); tickets.hydrate(); sync() } else tickets.clear() })
</script>

<template>
  <div class="view">
    <header class="safe-top shrink-0 bg-surface px-5 pb-3 shadow-divider">
      <h1 class="pt-4 font-display text-[36px] font-semibold leading-none">Mes billets</h1>
      <Segmented
        v-if="auth.isLoggedIn"
        v-model="tab"
        class="mt-4"
        :options="[
          { value: 'upcoming', label: 'À venir', count: tickets.upcoming.length },
          { value: 'past', label: 'Passés' },
        ]"
      />
    </header>

    <!-- Invité -->
    <div v-if="!auth.isLoggedIn" class="view-scroll tabbar-space">
      <EmptyState
        :icon="Ticket"
        title="Vos billets, toujours sur vous"
        text="Connectez-vous pour retrouver vos réservations. Elles restent consultables même sans connexion internet."
      >
        <button type="button" class="btn-primary" @click="router.push({ name: 'login', query: { redirect: '/billets' } })">Se connecter</button>
        <button type="button" class="btn-ghost" @click="router.push({ name: 'register' })">Créer un compte</button>
      </EmptyState>
    </div>

    <PullToRefresh v-else ref="ptr" class="tabbar-space" :on-refresh="sync">
      <div
        v-if="tickets.error === 'offline' && tickets.syncedAt"
        class="mx-4 mt-4 flex items-center gap-2.5 rounded-2xl bg-surface px-4 py-3 text-[14px] text-asphalte shadow-outline"
      >
        <CloudOff class="h-[18px] w-[18px] shrink-0" />
        Hors connexion. Billets mis à jour {{ relativeTime(tickets.syncedAt) }}.
      </div>

      <div v-if="firstLoad" class="space-y-3 px-4 pt-4">
        <div v-for="i in 3" :key="i" class="skeleton h-[108px] rounded-[22px]" />
      </div>

      <EmptyState
        v-else-if="tickets.error === 'failed'"
        :icon="CloudOff"
        tone="error"
        title="Billets indisponibles"
        text="Impossible de récupérer vos billets. Vérifiez votre connexion puis tirez l’écran vers le bas pour réessayer."
      >
        <button type="button" class="btn-primary" @click="sync">Réessayer</button>
      </EmptyState>

      <EmptyState
        v-else-if="!list.length && tab === 'upcoming'"
        :icon="TicketPlus"
        title="Aucun voyage prévu"
        text="Réservez votre prochain trajet : votre billet apparaîtra ici dès la confirmation."
      >
        <button type="button" class="btn-primary" @click="router.push('/')">Réserver un trajet</button>
      </EmptyState>

      <EmptyState
        v-else-if="!list.length"
        :icon="History"
        title="Pas encore d’historique"
        text="Vos voyages passés et billets annulés s’afficheront ici."
      />

      <div v-else class="space-y-3 px-4 pt-4">
        <TicketStub v-for="t in list" :key="t.reference" :ticket="t" :past="tab === 'past'" @click="open(t)" />
      </div>
    </PullToRefresh>
  </div>
</template>
