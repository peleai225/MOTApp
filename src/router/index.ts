import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/onboarding', name: 'onboarding', component: () => import('@/views/onboarding/OnboardingView.vue'), meta: { guest: true } },
    { path: '/bienvenue', name: 'welcome', component: () => import('@/views/auth/WelcomeView.vue'), meta: { guest: true } },
    { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
    { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
    {
      path: '/',
      component: () => import('@/views/AppShell.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/home/HomeView.vue') },
        { path: 'billets', name: 'tickets', component: () => import('@/views/tickets/TicketsView.vue'), meta: { auth: true } },
        { path: 'profil', name: 'profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { auth: true } }
      ]
    },
    { path: '/recherche', name: 'search', component: () => import('@/views/search/SearchResultsView.vue') },
    { path: '/trajet/:id', name: 'trip', component: () => import('@/views/trip/TripDetailView.vue') },
    { path: '/trajet/:id/sieges', name: 'seats', component: () => import('@/views/trip/SeatSelectionView.vue') },
    { path: '/paiement', name: 'payment', component: () => import('@/views/payment/PaymentView.vue'), meta: { auth: true } },
    { path: '/confirmation/:ref', name: 'confirmation', component: () => import('@/views/payment/ConfirmationView.vue'), meta: { auth: true } },
    { path: '/billet/:ref', name: 'ticket-detail', component: () => import('@/views/tickets/TicketDetailView.vue'), meta: { auth: true } },
    { path: '/profil/modifier', name: 'edit-profile', component: () => import('@/views/profile/EditProfileView.vue'), meta: { auth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, _from, next) => {
  if (!localStorage.getItem('mot_onboarding_done') && to.name !== 'onboarding') return next({ name: 'onboarding' })
  if (to.meta.auth && !localStorage.getItem('mot_token')) return next({ name: 'login', query: { redirect: to.fullPath } })
  if (to.meta.guest && localStorage.getItem('mot_token')) return next({ name: 'home' })
  next()
})

export default router
