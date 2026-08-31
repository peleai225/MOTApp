<template>
  <div class="page flex flex-col">
    <!-- Header Nuit avec avatar -->
    <div class="bg-nuit px-5 pt-safe pb-6">
      <h1 class="font-display text-xl font-bold text-white mt-3 mb-5">Mon Profil</h1>
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-soleil to-route flex items-center justify-center flex-shrink-0">
          <span class="font-display text-xl font-bold text-white">{{ initials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-base font-bold text-white truncate">{{ auth.user?.nom_complet || auth.user?.prenom }}</p>
          <p class="font-sans text-sm text-white/50 mt-0.5">{{ auth.user?.telephone }}</p>
          <p class="font-mono text-xs text-white/30 mt-0.5 tracking-widest">{{ auth.user?.code }}</p>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div class="flex-1 px-4 py-5 flex flex-col gap-4 overflow-y-auto pb-28">

      <div class="card flex flex-col">
        <p class="section-label mb-3">Compte</p>
        <MenuItem icon-path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Modifier mon profil" @click="router.push('/profil/modifier')" />
        <MenuItem icon-path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" label="Changer de mot de passe" />
      </div>

      <div class="card flex flex-col">
        <p class="section-label mb-3">Aide</p>
        <MenuItem icon-path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" label="Comment ça marche ?" />
        <MenuItem icon-path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" label="Contacter le support" />
      </div>

      <div class="card flex flex-col">
        <p class="section-label mb-3">Application</p>
        <MenuItem icon-path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" label="Conditions d'utilisation" />
        <div class="flex items-center justify-between py-3 border-t border-slate-100">
          <span class="font-sans text-sm text-pierre">Version</span>
          <span class="font-mono text-xs text-pierre tracking-widest">1.0.0</span>
        </div>
      </div>

      <!-- Déconnexion -->
      <AppButton variant="outline" class="border-red-200 text-red-600" @click="logout">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Se déconnecter
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const auth   = useAuthStore()

const initials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  return ((u.prenom?.[0] || '') + (u.nom?.[0] || '')).toUpperCase()
})

const MenuItem = defineComponent({
  props: { iconPath: String, label: String },
  emits: ['click'],
  setup: (p, { emit }) => () => h('button', {
    class: 'flex items-center gap-3 w-full py-3 border-t border-slate-100 text-left group first:border-t-0 first:pt-0',
    onClick: () => emit('click'),
  }, [
    h('div', { class: 'w-8 h-8 rounded-xl bg-brume flex items-center justify-center flex-shrink-0' },
      h('svg', { class: 'w-4 h-4 text-pierre group-hover:text-route transition-colors', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' },
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: p.iconPath })
      )
    ),
    h('span', { class: 'flex-1 font-sans text-sm font-medium text-encre group-hover:text-route transition-colors' }, p.label),
    h('svg', { class: 'w-4 h-4 text-slate-300', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' },
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5l7 7-7 7' })
    ),
  ])
})

async function logout() {
  await auth.logout()
  router.push('/bienvenue')
}
</script>
