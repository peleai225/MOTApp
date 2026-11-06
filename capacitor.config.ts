import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ci.motransport.app',
  appName: 'MOT',
  webDir: 'dist',
  backgroundColor: '#FFFFFF',
  plugins: {
    SplashScreen: {
      // Masqué par l'app dès qu'elle est prête (main.ts) ; 3 s maximum par sécurité
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    SystemBars: {
      // Plein écran bord à bord : l'app gère elle-même les zones sûres (--safe-area-inset-*)
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DEFAULT',
    },
  },
}

export default config
