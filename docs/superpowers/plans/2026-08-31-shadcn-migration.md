# Shadcn/vue + TypeScript Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate MoT Transport PWA from Vue 3 + JS to Vue 3 + TypeScript + shadcn/vue, replacing all custom UI components, adopting shadcn CSS variable tokens remapped on the MoT brand palette, and fixing 3 console bugs.

**Architecture:** TypeScript is layered first (tsconfig, types, stores, router, api), then shadcn/vue is initialized with CSS variables remapped on the MoT palette. Custom UI components (Button, Input, Badge, Toast) are replaced by shadcn primitives; all 20+ views are migrated to `lang="ts"`; layout components (TabBar, PageHeader) are kept with TypeScript props.

**Tech Stack:** Vue 3.5, TypeScript (strict: false), Vite 5, shadcn-vue, radix-vue, class-variance-authority, clsx, tailwind-merge, @vueuse/core, vue-sonner, Tailwind CSS 3, Pinia 2, Vue Router 4, Axios 1.7

**Spec:** `docs/superpowers/specs/2026-08-31-shadcn-migration-design.md`

## Global Constraints
- Working directory: `C:\laragon\www\MOT App`
- TypeScript strict mode OFF: `"strict": false`
- No new features — migration + bug fixes only
- All pages max-width 430px, mobile-first layout preserved
- Backend URL: `http://agare.test/api` (may be offline — errors must be caught gracefully)
- Tailwind CSS 3 (NOT v4 — do not upgrade)
- Run `npm run dev` after each task before committing

---

## File Map

**Created:** `tsconfig.json`, `tsconfig.node.json`, `components.json`, `src/lib/utils.ts`, `src/types/index.ts`, `src/components/ui/button/`, `src/components/ui/input/`, `src/components/ui/label/`, `src/components/ui/badge/`, `src/components/ui/sonner/Sonner.vue`, `src/components/ui/select/`, `src/components/ui/sheet/`, `src/components/ui/tabs/`, `src/components/ui/skeleton/`, `src/components/ui/alert-dialog/`, `src/components/ui/card/`, `src/components/ui/separator/`, `src/components/ui/avatar/`

**Renamed to .ts:** `vite.config.ts`, `tailwind.config.ts`, `src/main.ts`, `src/api/index.ts`, `src/stores/auth.ts`, `src/stores/search.ts`, `src/composables/useToast.ts`, `src/router/index.ts`

**Modified:** `package.json`, `index.html`, `src/assets/css/main.css`, `src/App.vue`, `src/components/ui/AppInput.vue` (rebuilt), all 20 view `.vue` files, `src/components/layout/TabBar.vue`, `src/components/layout/PageHeader.vue`

**Deleted:** `src/components/ui/AppButton.vue`, `src/components/ui/AppBadge.vue`, `src/components/ui/AppToast.vue` (+ old .js files)

---

### Task 1: TypeScript Setup

**Files:** `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.ts`, `src/main.ts`, `index.html`, `package.json`

- [ ] **Step 1: Install TypeScript**
```bash
cd "C:\laragon\www\MOT App"
npm install -D typescript vue-tsc @types/node
```

- [ ] **Step 2: Create `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": false,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": false
  },
  "include": ["vite.config.ts", "tailwind.config.ts"]
}
```

- [ ] **Step 4: Read current `vite.config.js`, then delete it and create `vite.config.ts`**

Read the file first, then recreate with identical content but typed:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MoT Transport',
        short_name: 'MoT',
        theme_color: '#1D4ED8',
        display: 'standalone',
        lang: 'fr',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/gares/,
            handler: 'CacheFirst',
            options: { cacheName: 'gares-cache', expiration: { maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: /\/api\/trajets/,
            handler: 'NetworkFirst',
            options: { cacheName: 'trajets-cache', networkTimeoutSeconds: 5, expiration: { maxAgeSeconds: 300 } }
          },
          {
            urlPattern: /\/api\/reservations/,
            handler: 'NetworkFirst',
            options: { cacheName: 'reservations-cache', networkTimeoutSeconds: 8, expiration: { maxAgeSeconds: 3600 } }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
```

- [ ] **Step 5: Read current `tailwind.config.js`, delete it, create `tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nuit: '#0F1829', sable: '#FDF6EC', soleil: '#F59E0B',
        route: '#E9550D', voyage: '#1D4ED8', brume: '#EFF3FF',
        encre: '#1A1A2E', pierre: '#6B7280', braise: '#FEF3C7'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: { card: '16px', btn: '12px', '2xl': '20px', '3xl': '24px' },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.12)',
        btn: '0 4px 16px rgba(233,85,13,0.3)',
        ticket: '0 2px 12px rgba(0,0,0,0.16)'
      },
      fontSize: { '2xs': ['10px', '14px'] }
    }
  },
  plugins: []
} satisfies Config
```

- [ ] **Step 6: Rename `src/main.js` → `src/main.ts`** (content identical)

- [ ] **Step 7: Update `index.html`** — change `src="/src/main.js"` → `src="/src/main.ts"`

- [ ] **Step 8: Verify**
```bash
npm run dev
```
Expected: app loads at `http://localhost:5173`.

- [ ] **Step 9: Commit**
```bash
git add -A && git commit -m "chore: add TypeScript setup"
```

---

### Task 2: shadcn-vue Initialization

**Files:** `components.json`, `src/lib/utils.ts`, `package.json`, `tailwind.config.ts` (update), `src/assets/css/main.css` (update)

**Produces:** `cn(...inputs: ClassValue[]) => string` from `@/lib/utils` — used by all shadcn components

- [ ] **Step 1: Install dependencies**
```bash
npm install radix-vue class-variance-authority clsx tailwind-merge @vueuse/core vue-sonner
npm install -D tailwindcss-animate
```

- [ ] **Step 2: Create `components.json`**
```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tsConfigPath": "./tsconfig.json",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/assets/css/main.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "framework": "vite",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 3: Create `src/lib/utils.ts`**
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Update `tailwind.config.ts`** — add animate plugin and shadcn color tokens

Replace the entire file content:
```typescript
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nuit: '#0F1829', sable: '#FDF6EC', soleil: '#F59E0B',
        route: '#E9550D', voyage: '#1D4ED8', brume: '#EFF3FF',
        encre: '#1A1A2E', pierre: '#6B7280', braise: '#FEF3C7',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' }
      },
      borderRadius: {
        lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)',
        card: '16px', btn: '12px', '2xl': '20px', '3xl': '24px'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.12)',
        btn: '0 4px 16px rgba(233,85,13,0.3)',
        ticket: '0 2px 12px rgba(0,0,0,0.16)'
      },
      fontSize: { '2xs': ['10px', '14px'] },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [animate]
} satisfies Config
```

- [ ] **Step 5: Add CSS variables to `src/assets/css/main.css`**

Insert this block at the very top of the file, before any existing content:
```css
@layer base {
  :root {
    --background: 222 47% 11%;
    --foreground: 40 80% 96%;
    --card: 222 47% 11%;
    --card-foreground: 40 80% 96%;
    --popover: 227 26% 15%;
    --popover-foreground: 40 80% 96%;
    --primary: 20 89% 48%;
    --primary-foreground: 0 0% 100%;
    --secondary: 224 76% 48%;
    --secondary-foreground: 0 0% 100%;
    --muted: 227 26% 15%;
    --muted-foreground: 220 9% 46%;
    --accent: 38 92% 50%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 227 26% 20%;
    --input: 227 26% 20%;
    --ring: 20 89% 48%;
    --radius: 0.75rem;
  }
}
```

- [ ] **Step 6: Verify**
```bash
npm run dev
```

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "chore: initialize shadcn-vue (deps, CSS variables, tailwind animate)"
```

---

### Task 3: Shared Types + API Layer

**Files:** `src/types/index.ts` (create), `src/api/index.ts` (create), delete `src/api/index.js`

**Produces:** `Gare`, `Trajet`, `Reservation`, `User`, `SearchParams` interfaces + typed axios API functions

- [ ] **Step 1: Create `src/types/index.ts`**
```typescript
export interface Gare { id: number; nom: string; ville: string }

export interface Arret { gare: Gare; heure: string }

export interface Trajet {
  id: number
  origine: Gare
  destination: Gare
  depart_at: string
  arrivee_at: string
  prix_adulte: number
  prix_enfant: number
  prix_etudiant: number
  places_disponibles: number
  bus: { immatriculation: string; capacite: number }
  arrets: Arret[]
}

export interface Reservation {
  ref: string
  trajet: Trajet
  sieges: string[]
  statut: 'valide' | 'utilise' | 'annule' | 'expire'
  nom_passager?: string
  mode_paiement: 'mobile_money' | 'especes' | 'carte'
  created_at: string
}

export interface User {
  id: number; nom: string; prenom: string; telephone: string
  email?: string; date_naissance?: string; ville?: string; adresse?: string
}

export interface SearchParams { origine: string; destination: string; date: string; places: number }
```

- [ ] **Step 2: Create `src/api/index.ts`**, then delete `src/api/index.js`
```typescript
import axios from 'axios'
import type { Gare, Trajet, Reservation, User, SearchParams } from '@/types'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 12000 })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('mot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) { localStorage.clear(); window.location.href = '/login' }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: Omit<User, 'id'> & { password: string; password_confirmation: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  login: (data: { telephone: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  update: (data: Partial<User>) => api.put<User>('/auth/me', data)
}

export const trajetApi = {
  gares: () => api.get<Gare[]>('/gares'),
  rechercher: (params: SearchParams) => api.get<Trajet[]>('/trajets', { params }),
  show: (id: number | string) => api.get<Trajet>(`/trajets/${id}`),
  sieges: (id: number | string) =>
    api.get<{ sieges: { numero: string; disponible: boolean }[] }>(`/trajets/${id}/sieges`)
}

export const reservationApi = {
  index: () => api.get<Reservation[]>('/reservations'),
  store: (data: { trajet_id: number; sieges: string[]; mode_paiement: string; nom_passager?: string }) =>
    api.post<Reservation>('/reservations', data),
  show: (ref: string) => api.get<Reservation>(`/reservations/${ref}`),
  cancel: (ref: string) => api.delete(`/reservations/${ref}`)
}

export default api
```

- [ ] **Step 3: Create `src/stores/auth.ts`**, delete `src/stores/auth.js`
```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(
    localStorage.getItem('mot_user') ? JSON.parse(localStorage.getItem('mot_user')!) : null
  )
  const token = ref<string | null>(localStorage.getItem('mot_token'))
  const isLoggedIn = computed(() => !!token.value)

  function _persist() {
    if (user.value) localStorage.setItem('mot_user', JSON.stringify(user.value))
    if (token.value) localStorage.setItem('mot_token', token.value)
  }

  async function login(telephone: string, password: string) {
    const { data } = await authApi.login({ telephone, password })
    token.value = data.token; user.value = data.user; _persist()
  }

  async function register(payload: Parameters<typeof authApi.register>[0]) {
    const { data } = await authApi.register(payload)
    token.value = data.token; user.value = data.user; _persist()
  }

  function logout() {
    authApi.logout().catch(() => {})
    token.value = null; user.value = null
    localStorage.removeItem('mot_token'); localStorage.removeItem('mot_user')
  }

  async function fetchMe() {
    const { data } = await authApi.me()
    user.value = data; localStorage.setItem('mot_user', JSON.stringify(data))
  }

  return { user, token, isLoggedIn, login, register, logout, fetchMe }
})
```

- [ ] **Step 4: Create `src/stores/search.ts`**, delete `src/stores/search.js`
```typescript
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { trajetApi } from '@/api'
import type { Gare, Trajet, SearchParams } from '@/types'

export const useSearchStore = defineStore('search', () => {
  const gares = ref<Gare[]>([])
  const results = ref<Trajet[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const params = ref<SearchParams>({ origine: '', destination: '', date: '', places: 1 })

  async function loadGares() {
    if (gares.value.length > 0) return
    const { data } = await trajetApi.gares()
    gares.value = data
  }

  async function search() {
    loading.value = true; error.value = null
    try {
      const { data } = await trajetApi.rechercher(params.value)
      results.value = data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function swapVilles() {
    const tmp = params.value.origine
    params.value.origine = params.value.destination
    params.value.destination = tmp
  }

  return { gares, results, loading, error, params, loadGares, search, swapVilles }
})
```

- [ ] **Step 5: Create `src/composables/useToast.ts`**, delete `.js`
```typescript
import { ref } from 'vue'

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string; duration: number }

const toasts = ref<Toast[]>([])
let nextId = 0

function add(type: Toast['type'], message: string, duration = 3000) {
  const id = nextId++
  toasts.value.push({ id, type, message, duration })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, duration)
}

export function useToast() {
  return {
    toasts,
    success: (m: string, d?: number) => add('success', m, d),
    error: (m: string, d?: number) => add('error', m, d),
    info: (m: string, d?: number) => add('info', m, d)
  }
}
```

- [ ] **Step 6: Create `src/router/index.ts`**, delete `src/router/index.js`
```typescript
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
```

- [ ] **Step 7: Verify**
```bash
npm run dev
```

- [ ] **Step 8: Commit**
```bash
git add -A && git commit -m "chore: migrate types, api, stores, composables, router to TypeScript"
```

---

### Task 4: Generate shadcn Components

**Files:** `src/components/ui/button/`, `badge/`, `input/`, `label/`, `select/`, `sheet/`, `tabs/`, `skeleton/`, `alert-dialog/`, `card/`, `separator/`, `avatar/`

Note: the CLI may ask whether to overwrite existing files — answer **yes** each time.

- [ ] **Step 1: Generate all components**
```bash
npx shadcn-vue@latest add button badge input label select sheet tabs skeleton alert-dialog card separator avatar
```
If the above runs interactively with prompts, run each separately:
```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add badge
npx shadcn-vue@latest add input
npx shadcn-vue@latest add label
npx shadcn-vue@latest add select
npx shadcn-vue@latest add sheet
npx shadcn-vue@latest add tabs
npx shadcn-vue@latest add skeleton
npx shadcn-vue@latest add alert-dialog
npx shadcn-vue@latest add card
npx shadcn-vue@latest add separator
npx shadcn-vue@latest add avatar
```

- [ ] **Step 2: Create `src/components/ui/sonner/Sonner.vue`**
```vue
<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <Toaster
    position="bottom-center"
    rich-colors
    :toast-options="{
      style: {
        background: 'hsl(222 47% 11%)',
        color: 'hsl(40 80% 96%)',
        border: '1px solid hsl(227 26% 20%)'
      }
    }"
  />
</template>
```

- [ ] **Step 3: Verify build**
```bash
npm run dev
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: add all shadcn components (button, badge, input, label, select, sheet, tabs, skeleton, alert-dialog, card, separator, avatar, sonner)"
```

---

### Task 5: Replace AppToast + Rebuild AppInput

**Files:** `src/App.vue`, `src/components/ui/AppInput.vue`, delete `src/components/ui/AppToast.vue`

- [ ] **Step 1: Read `src/App.vue`**, then update it**
```vue
<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Sonner from '@/components/ui/sonner/Sonner.vue'

const route = useRoute()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <Sonner />
</template>
```

- [ ] **Step 2: Delete `src/components/ui/AppToast.vue`**

- [ ] **Step 3: Read `src/components/ui/AppInput.vue`**, then replace it**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  prefix?: string
  error?: string
  required?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type || 'text'
})
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="label" :class="error ? 'text-destructive' : ''">
      {{ label }}<span v-if="required" class="text-destructive ml-0.5">*</span>
    </Label>
    <div class="relative">
      <span v-if="prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
        {{ prefix }}
      </span>
      <Input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          error ? 'border-destructive focus-visible:ring-destructive' : '',
          prefix ? 'pl-8' : '',
          type === 'password' ? 'pr-10' : ''
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        @click="showPassword = !showPassword"
      >
        <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
```

- [ ] **Step 4: Verify login page renders correctly**
```bash
npm run dev
```
Navigate to `/login` — input fields and label should render.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: replace AppToast with Sonner, rebuild AppInput on shadcn primitives"
```

---

### Task 6: Fix HomeView Bug + Migrate Auth Views

**Files:** `src/views/home/HomeView.vue`, `src/views/auth/WelcomeView.vue`, `src/views/auth/LoginView.vue`, `src/views/auth/RegisterView.vue`

**Bug fixed:** HomeView `onMounted` crashes when `agare.test` is unreachable.

For each file: read it first, then apply the changes.

- [ ] **Step 1: Read and update `HomeView.vue`**

Changes:
- Add `lang="ts"` to `<script setup>`
- Replace `useToast()` import with `import { toast } from 'vue-sonner'`
- Wrap `onMounted` in try/catch:
```typescript
onMounted(async () => {
  try {
    await searchStore.loadGares()
  } catch {
    toast.error('Service temporairement indisponible', { description: 'Vérifiez votre connexion réseau' })
  }
})
```
- Replace all `<AppButton>` with `<Button>` from `@/components/ui/button`
- Mapping: `variant="route"` → `variant="default"`, `variant="outline"` → `variant="outline"`, `variant="ghost"` → `variant="ghost"`
- Remove `import AppButton from '@/components/ui/AppButton.vue'`
- Add `import { Button } from '@/components/ui/button'`

- [ ] **Step 2: Read and update `WelcomeView.vue`**

- Add `lang="ts"`
- Replace `AppButton` → `Button`
- `variant="route"` → `variant="default"`, `variant="outline-white"` → `variant="outline"` + add `class="border-white/50 text-white hover:bg-white/10"`

- [ ] **Step 3: Read and update `LoginView.vue`**

- Add `lang="ts"`
- Replace `AppButton` → `Button`, `variant="route"` → `variant="default"`
- Replace `useToast().error(msg)` → `toast.error(msg)` from vue-sonner
- Type refs: `const phone = ref<string>('')`, `const password = ref<string>('')`, `const loading = ref<boolean>(false)`

- [ ] **Step 4: Read and update `RegisterView.vue`**

- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Replace `useToast` → `toast` from vue-sonner
- Type step: `const step = ref<1 | 2>(1)`

- [ ] **Step 5: Verify — app loads without crash when backend down**
```bash
npm run dev
```
Open app, confirm: no Vue warn in console, toast error appears instead of crash.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "fix: catch HomeView API error, migrate auth views to TypeScript + shadcn Button"
```

---

### Task 7: Migrate Search, Trip, Payment, Confirmation Views

For each file: read first, then apply.

- [ ] **Step 1: Update `SearchResultsView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Replace skeleton divs: `<div class="skeleton h-24 w-full rounded-card">` → `<Skeleton class="h-24 w-full rounded-card" />`
- Add: `import { Skeleton } from '@/components/ui/skeleton'`
- Type results: `const trips = computed<Trajet[]>(() => searchStore.results)`

- [ ] **Step 2: Update `TripDetailView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Replace skeleton → `<Skeleton>`
- Add `Separator` between sections: `import { Separator } from '@/components/ui/separator'`
- Use `Card, CardContent` for tariff block: `import { Card, CardContent } from '@/components/ui/card'`
- Type: `const trajet = ref<Trajet | null>(null)`

- [ ] **Step 3: Update `SeatSelectionView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Type: `const selectedSeats = ref<string[]>([])`

- [ ] **Step 4: Update `PaymentView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Replace `useToast` → `toast` from vue-sonner
- Type: `const mode = ref<'mobile_money' | 'especes' | 'carte'>('mobile_money')`

- [ ] **Step 5: Update `ConfirmationView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Replace skeleton → `<Skeleton>`
- Type: `const reservation = ref<Reservation | null>(null)`

- [ ] **Step 6: Verify**
```bash
npm run dev
```

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "chore: migrate search, trip, payment, confirmation views to TypeScript + shadcn"
```

---

### Task 8: Migrate Tickets Views

- [ ] **Step 1: Read and update `TicketsView.vue`**

Replace manual tab state with shadcn `Tabs`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { reservationApi } from '@/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Reservation } from '@/types'

const reservations = ref<Reservation[]>([])
const loading = ref(true)

const upcoming = computed(() =>
  reservations.value.filter(r => r.statut === 'valide' && new Date(r.trajet.depart_at) > new Date())
)
const past = computed(() =>
  reservations.value.filter(r => r.statut !== 'valide' || new Date(r.trajet.depart_at) <= new Date())
)

reservationApi.index().then(({ data }) => { reservations.value = data }).finally(() => { loading.value = false })
</script>

<template>
  <div class="page page-dark">
    <!-- PageHeader here -->
    <Tabs default-value="avenir" class="w-full">
      <TabsList class="w-full bg-muted mx-4 mt-4" style="width: calc(100% - 2rem)">
        <TabsTrigger value="avenir" class="flex-1">À venir ({{ upcoming.length }})</TabsTrigger>
        <TabsTrigger value="passes" class="flex-1">Passés</TabsTrigger>
      </TabsList>
      <TabsContent value="avenir" class="px-4 pt-3">
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-card" />
        </div>
        <div v-else-if="upcoming.length === 0" class="text-center text-muted-foreground py-12">
          Aucun billet à venir
        </div>
        <div v-else class="space-y-3">
          <!-- ticket cards here — keep existing ticket-card CSS classes -->
        </div>
      </TabsContent>
      <TabsContent value="passes" class="px-4 pt-3">
        <!-- past tickets -->
      </TabsContent>
    </Tabs>
  </div>
</template>
```

Keep the existing `.ticket-card`, `.ticket-header`, `.ticket-tear`, `.ticket-body` CSS classes — they are in `main.css` and must not be removed.

Replace `<AppBadge :status="r.statut" />` with:
```vue
<Badge
  :variant="r.statut === 'valide' ? 'default' : r.statut === 'annule' ? 'destructive' : 'secondary'"
>
  {{ { valide: 'Valide', utilise: 'Utilisé', annule: 'Annulé', expire: 'Expiré' }[r.statut] }}
</Badge>
```

- [ ] **Step 2: Read and update `TicketDetailView.vue`**

Replace bottom-sheet cancel confirmation with `AlertDialog`:
```vue
<AlertDialog v-model:open="showCancelDialog">
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Annuler ce billet ?</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action est irréversible. Le montant ne sera pas remboursé automatiquement.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Retour</AlertDialogCancel>
      <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmCancel">
        Confirmer l'annulation
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Replace `AppBadge` with `Badge` (same as above).
Add `Separator` between info rows.
Replace `useToast` → `toast` from vue-sonner.

- [ ] **Step 3: Verify**
```bash
npm run dev
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "chore: migrate tickets views, shadcn Tabs + AlertDialog + Badge"
```

---

### Task 9: Migrate Profile Views + Layout Components

- [ ] **Step 1: Read and update `ProfileView.vue`**

Replace initials avatar with shadcn Avatar:
```vue
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// In template:
<Avatar class="w-20 h-20">
  <AvatarFallback class="bg-gradient-to-br from-accent to-primary text-primary-foreground text-2xl font-bold font-display">
    {{ initials }}
  </AvatarFallback>
</Avatar>
```

Replace inline section divs with `Card > CardContent`.
Replace `AppButton` → `Button` for logout.
Add `lang="ts"`, type `initials` as `computed<string>`.

- [ ] **Step 2: Read and update `EditProfileView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Replace `useToast` → `toast`
- Type: `const form = ref<Partial<User>>({ ... })`

- [ ] **Step 3: Read and update `OnboardingView.vue`**
- Add `lang="ts"`
- Replace `AppButton` → `Button`
- Type: `const currentSlide = ref<number>(0)`

- [ ] **Step 4: Read and update `AppShell.vue`**
- Add `lang="ts"` to `<script setup>`

- [ ] **Step 5: Read and update `TabBar.vue`**
- Add `lang="ts"` to `<script setup>`
- `const route = useRoute()` (already typed via Vue Router types)

- [ ] **Step 6: Read and update `PageHeader.vue`**
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  subtitle?: string
  back?: boolean
}>()

withDefaults(defineProps<{ back?: boolean }>(), { back: true })

const router = useRouter()
</script>
```
Note: merge the two `defineProps` into one — only call `defineProps` once:
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{ title: string; subtitle?: string; back?: boolean }>()
const router = useRouter()
</script>
```

- [ ] **Step 7: Verify**
```bash
npm run dev
```
Navigate to profile page — Avatar and Card sections should render.

- [ ] **Step 8: Commit**
```bash
git add -A && git commit -m "chore: migrate profile views and layout components to TypeScript + shadcn Avatar/Card"
```

---

### Task 10: Cleanup + Final Verification

- [ ] **Step 1: Scan for remaining old component references**
```bash
grep -r "AppButton\|AppBadge\|AppToast\|useToast" src/ --include="*.vue" --include="*.ts"
```
For each hit: replace `AppButton` → `Button`, `AppBadge` → `Badge`, `AppToast` → (should be gone), `useToast().*error\|success\|info` → `toast.error/success/info` from vue-sonner.

- [ ] **Step 2: Delete remaining old files**
```bash
rm "src/components/ui/AppButton.vue" 2>/dev/null
rm "src/components/ui/AppBadge.vue" 2>/dev/null
```

- [ ] **Step 3: TypeScript check**
```bash
npx vue-tsc --noEmit
```
Common fixes:
- Route params: `route.params.id as string`
- Non-null: `reservation.value!.trajet`
- Event target: `($event.target as HTMLInputElement).value`

- [ ] **Step 4: Production build**
```bash
npm run build
```
Expected: exits 0. If it fails on TS errors, fix them and rerun.

- [ ] **Step 5: Preview and visually verify**
```bash
npm run preview
```
Check:
- Onboarding slides render
- Login/Register forms render with Labels
- Home loads (toast error if backend down, no crash)
- TabBar active state works
- Buttons use the orange-red primary color (`--primary: 20 89% 48%`)
- Badge statuses are color-coded

- [ ] **Step 6: Place PWA icons (manual)**

Copy your `icon-192.png` and `icon-512.png` files into `public/icons/`.
In DevTools → Application → Manifest — icon errors should be gone.

- [ ] **Step 7: Final commit**
```bash
git add -A && git commit -m "chore: cleanup old components, verify TypeScript build and production bundle"
```

---

## Bug Fix Summary

| Bug | Task | Fix |
|---|---|---|
| HomeView crash (`agare.test` refused) | Task 6 | try/catch in onMounted, `toast.error()` instead of crash |
| PWA icon 404 | Task 10 Step 6 | Place icon files in `public/icons/` |
| `No Listener: tabs:outgoing.message.ready` | — | Browser extension — not fixable in app code |
