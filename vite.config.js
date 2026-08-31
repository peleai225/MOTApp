import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'MoT Transport',
        short_name: 'MoT',
        description: 'Réservez vos billets de bus en quelques taps',
        theme_color: '#1D4ED8',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'fr',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/gares/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gares-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /\/api\/trajets/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'trajets-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /\/api\/reservations/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'reservations-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 3600 },
              networkTimeoutSeconds: 8
            }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
