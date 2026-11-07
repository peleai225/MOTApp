import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: { host: true },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'images/logo-mot.png', 'images/bus-720.jpg'],
      manifest: {
        id: '/',
        name: 'MOT — Mohamed Ouattara Transport',
        short_name: 'MOT',
        description: 'Réservez votre car MOT, choisissez votre place et gardez votre billet dans votre téléphone.',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'fr',
        categories: ['travel', 'navigation'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Mes billets', short_name: 'Billets', url: '/billets', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Départs du jour', short_name: 'Départs', url: '/departs', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,woff2}'],
        globIgnores: ['**/*vietnamese*'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/gares/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'mot-gares', expiration: { maxEntries: 5, maxAgeSeconds: 7 * 86400 } },
          },
          {
            urlPattern: /\/api\/trajets/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mot-trajets',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 60, maxAgeSeconds: 600 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
