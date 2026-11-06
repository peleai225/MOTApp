import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { toast } from 'vue-sonner'
import { registerSW } from 'virtual:pwa-register'

import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './assets/css/main.css'
import './lib/theme' // applique le thème clair / sombre avant le premier rendu

import App from './App.vue'
import router from './router'
import { onUnauthorized } from './api'
import { useAuthStore } from './stores/auth'
import { closeTopOverlay, isNative, routeExternalLinks } from './lib/native'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Session expirée côté serveur → retour à la connexion
onUnauthorized.handler = () => {
  const auth = useAuthStore(pinia)
  if (!auth.isLoggedIn) return
  auth.clear()
  toast('Votre session a expiré', { description: 'Reconnectez-vous pour continuer.' })
  const current = router.currentRoute.value
  router.replace({ name: 'login', query: { redirect: current.fullPath } })
}

router.isReady().then(() => {
  app.mount('#app')
  const splash = document.getElementById('splash')
  if (splash) {
    requestAnimationFrame(() => splash.classList.add('hide'))
    setTimeout(() => splash.remove(), 450)
  }
  if (isNative) setupNative()
})

/** Comportements propres à l'application Android / iPhone */
async function setupNative() {
  routeExternalLinks()

  const [{ App: CapApp }, { SplashScreen }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/splash-screen'),
  ])
  SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {})

  // Bouton / geste « retour » d'Android, comme une app native :
  // feuille ouverte → la fermer ; écran racine → mettre l'app en arrière-plan ;
  // autre onglet → revenir à l'Accueil ; sinon → écran précédent.
  CapApp.addListener('backButton', () => {
    if (closeTopOverlay()) return
    const r = router.currentRoute.value
    if (r.name === 'home' || r.name === 'onboarding' || r.name === 'welcome') { CapApp.minimizeApp(); return }
    if (r.name === 'confirmation' || r.meta.tab) { router.replace({ name: 'home' }); return }
    if (window.history.state?.back) router.back()
    else router.replace({ name: 'home' })
  })
}

// Mise à jour de la PWA (navigateur uniquement : l'app native est mise à jour par le Store)
if (!isNative) {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast('Une nouvelle version est disponible', {
        duration: Infinity,
        action: { label: 'Mettre à jour', onClick: () => updateSW(true) },
      })
    },
  })
}
