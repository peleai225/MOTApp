import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { setRouteChrome } from '@/lib/theme'

/** Sens de la dernière navigation, pour les transitions push / pop */
export const navDirection = ref<'push' | 'pop' | 'none'>('none')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/onboarding', name: 'onboarding', component: () => import('@/views/onboarding/OnboardingView.vue') },
    { path: '/bienvenue', name: 'welcome', component: () => import('@/views/auth/WelcomeView.vue'), meta: { guest: true } },
    { path: '/connexion', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
    { path: '/inscription', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
    {
      path: '/',
      component: () => import('@/views/AppShell.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/home/HomeView.vue'), meta: { tab: true } },
        { path: 'departs', name: 'departures', component: () => import('@/views/departures/DeparturesView.vue'), meta: { tab: true } },
        { path: 'billets', name: 'tickets', component: () => import('@/views/tickets/TicketsView.vue'), meta: { tab: true } },
        { path: 'profil', name: 'profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { tab: true } },
      ],
    },
    { path: '/recherche', name: 'search', component: () => import('@/views/search/SearchResultsView.vue') },
    { path: '/trajet/:id', name: 'trip', component: () => import('@/views/trip/TripDetailView.vue') },
    { path: '/trajet/:id/places', name: 'seats', component: () => import('@/views/trip/SeatSelectionView.vue') },
    { path: '/paiement', name: 'checkout', component: () => import('@/views/trip/CheckoutView.vue'), meta: { auth: true } },
    { path: '/confirmation/:reference', name: 'confirmation', component: () => import('@/views/trip/ConfirmationView.vue'), meta: { auth: true, enter: 'rise' } },
    { path: '/billet/:reference', name: 'ticket', component: () => import('@/views/tickets/TicketDetailView.vue'), meta: { auth: true, theme: '#0F1A45' } },
    { path: '/profil/modifier', name: 'edit-profile', component: () => import('@/views/profile/EditProfileView.vue'), meta: { auth: true } },

    // anciennes adresses
    { path: '/login', redirect: to => ({ name: 'login', query: to.query }) },
    { path: '/register', redirect: { name: 'register' } },
    { path: '/trajet/:id/sieges', redirect: to => ({ name: 'seats', params: to.params }) },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(to => {
  const onboarded = localStorage.getItem('mot_onboarding_done')
  if (!onboarded && to.name !== 'onboarding') return { name: 'onboarding' }
  const logged = !!localStorage.getItem('mot_token')
  if (to.meta.auth && !logged) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guest && logged) return { name: 'home' }
})

let lastPosition: number = (window.history.state?.position as number) ?? 0
router.afterEach((to, from) => {
  const pos = (window.history.state?.position as number) ?? 0
  const bothTabs = !!to.meta.tab && !!from.meta.tab
  if (!from.matched.length || bothTabs) navDirection.value = 'none'
  else navDirection.value = pos < lastPosition ? 'pop' : 'push'
  lastPosition = pos

  setRouteChrome(to.meta.theme)
})

export default router
