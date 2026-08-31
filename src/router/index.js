import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ── Auth / Onboarding ─────────────────────────────────────────────────────
  { path: '/onboarding', name: 'onboarding', component: () => import('@/views/onboarding/OnboardingView.vue'), meta: { guest: true } },
  { path: '/bienvenue',  name: 'welcome',    component: () => import('@/views/auth/WelcomeView.vue'),          meta: { guest: true } },
  { path: '/login',      name: 'login',      component: () => import('@/views/auth/LoginView.vue'),            meta: { guest: true } },
  { path: '/register',   name: 'register',   component: () => import('@/views/auth/RegisterView.vue'),         meta: { guest: true } },

  // ── App principal ─────────────────────────────────────────────────────────
  {
    path: '/',
    component: () => import('@/views/AppShell.vue'),
    children: [
      { path: '',        name: 'home',    component: () => import('@/views/home/HomeView.vue') },
      { path: 'billets', name: 'tickets', component: () => import('@/views/tickets/TicketsView.vue'), meta: { auth: true } },
      { path: 'profil',  name: 'profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { auth: true } },
    ],
  },

  // ── Tunnel de réservation ─────────────────────────────────────────────────
  { path: '/recherche',                    name: 'search',      component: () => import('@/views/search/SearchResultsView.vue') },
  { path: '/trajet/:id',                   name: 'trip',        component: () => import('@/views/trip/TripDetailView.vue') },
  { path: '/trajet/:id/sieges',            name: 'seats',       component: () => import('@/views/trip/SeatSelectionView.vue') },
  { path: '/paiement',                     name: 'payment',     component: () => import('@/views/payment/PaymentView.vue'),     meta: { auth: true } },
  { path: '/confirmation/:ref',            name: 'confirmation',component: () => import('@/views/payment/ConfirmationView.vue'),meta: { auth: true } },

  // ── Billets ───────────────────────────────────────────────────────────────
  { path: '/billet/:ref', name: 'ticket-detail', component: () => import('@/views/tickets/TicketDetailView.vue'), meta: { auth: true } },

  // ── Profil ────────────────────────────────────────────────────────────────
  { path: '/profil/modifier', name: 'edit-profile', component: () => import('@/views/profile/EditProfileView.vue'), meta: { auth: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Guards
router.beforeEach(to => {
  const token = localStorage.getItem('mot_token')
  const seen  = localStorage.getItem('mot_onboarding_done')

  // Premier lancement → onboarding
  if (!seen && to.name !== 'onboarding') {
    return { name: 'onboarding' }
  }
  // Route protégée sans token → login
  if (to.meta.auth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // Route guest avec token → accueil
  if (to.meta.guest && token) {
    return { name: 'home' }
  }
})

export default router
