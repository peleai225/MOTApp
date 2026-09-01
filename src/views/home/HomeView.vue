<template>
  <div class="flex flex-col min-h-dvh bg-brume">

    <!-- Hero Header -->
    <div class="relative bg-nuit pt-safe pb-8 px-5 overflow-hidden">
      <div class="absolute top-0 right-0 w-56 h-56 rounded-full bg-voyage/10 -translate-y-1/2 translate-x-1/3" />
      <div class="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-route/10 translate-y-1/2 -translate-x-1/4" />

      <div class="relative flex items-center justify-between mt-3">
        <div>
          <p class="font-sans text-white/50 text-xs tracking-wider">{{ greeting }}</p>
          <h1 class="font-display text-xl font-bold text-white leading-tight">
            {{ auth.user?.prenom || 'MoT Transport' }}
          </h1>
        </div>
        <button class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
      </div>

      <div class="relative mt-3">
        <p class="font-display text-2xl font-bold text-white leading-snug">
          Où allez-vous<br>aujourd'hui ?
        </p>
        <p class="font-sans text-white/50 text-sm mt-1">Réservez votre trajet en quelques secondes</p>
      </div>
    </div>

    <!-- Contenu scrollable -->
    <div class="flex-1 px-4 -mt-4 pb-28 space-y-4">

      <!-- Alerte réseau (persistante si API down) -->
      <div v-if="apiDown" class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <div>
          <p class="font-sans text-sm font-semibold text-amber-800">Service indisponible</p>
          <p class="font-sans text-xs text-amber-600 mt-0.5">Impossible de charger les gares. Vérifiez votre connexion.</p>
        </div>
      </div>

      <!-- Card de recherche -->
      <div class="card shadow-ticket">
        <h2 class="font-display text-base font-semibold text-encre mb-3">Rechercher un trajet</h2>

        <!-- Raccourcis villes -->
        <div class="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style="scrollbar-width: none;">
          <button
            v-for="c in cityShortcuts"
            :key="c"
            class="flex-shrink-0 font-sans text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 text-pierre bg-brume hover:border-route hover:text-route transition-colors active:scale-95"
            @click="quickCity(c)"
          >
            {{ c }}
          </button>
        </div>

        <!-- Départ / Destination -->
        <div class="relative flex flex-col gap-2">
          <button
            class="flex items-center gap-3 w-full h-[52px] bg-brume rounded-btn border border-slate-200/80 px-4 text-left transition-colors hover:border-soleil"
            @click="openPicker('origine')"
          >
            <span class="w-2 h-2 rounded-full bg-voyage flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="section-label mb-0">Départ</p>
              <p class="font-sans text-sm font-medium text-encre truncate">
                {{ gareName(search.params.origine) || 'Choisir une ville' }}
              </p>
            </div>
          </button>

          <!-- Swap -->
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-lg bg-route flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            @click="search.swapVilles()"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>

          <button
            class="flex items-center gap-3 w-full h-[52px] bg-brume rounded-btn border border-slate-200/80 px-4 text-left transition-colors hover:border-soleil"
            @click="openPicker('destination')"
          >
            <span class="w-2 h-2 rounded-full bg-route flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="section-label mb-0">Arrivée</p>
              <p class="font-sans text-sm font-medium text-encre truncate">
                {{ gareName(search.params.destination) || 'Choisir une ville' }}
              </p>
            </div>
          </button>
        </div>

        <!-- Date + Voyageurs -->
        <div class="grid grid-cols-2 gap-3 mt-3">
          <!-- Date native fonctionnelle -->
          <label class="relative flex items-center gap-2.5 h-12 bg-brume rounded-btn border border-slate-200/80 px-3 cursor-pointer hover:border-soleil transition-colors">
            <svg class="w-4 h-4 text-pierre flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div class="flex-1 min-w-0 pointer-events-none">
              <p class="section-label mb-0">Date</p>
              <p class="font-sans text-xs font-semibold text-encre">{{ formatDate(search.params.date) }}</p>
            </div>
            <input
              type="date"
              :min="today"
              v-model="search.params.date"
              class="absolute inset-0 opacity-0 w-full cursor-pointer"
            />
          </label>

          <!-- Voyageurs stepper -->
          <div class="flex items-center gap-2 h-12 bg-brume rounded-btn border border-slate-200/80 px-3">
            <svg class="w-4 h-4 text-pierre flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="section-label mb-0">Voyageurs</p>
              <p class="font-sans text-xs font-semibold text-encre">{{ search.params.places }}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                class="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-route font-bold text-base leading-none hover:border-route transition-colors active:scale-90"
                @click="search.params.places = Math.max(1, search.params.places - 1)"
              >−</button>
              <button
                class="w-7 h-7 rounded-lg bg-route flex items-center justify-center text-white font-bold text-base leading-none active:scale-90 transition-transform"
                @click="search.params.places = Math.min(10, search.params.places + 1)"
              >+</button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <Button class="w-full" @click="doSearch">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Rechercher un trajet
          </Button>
        </div>
      </div>

      <!-- Dernier trajet -->
      <div v-if="lastSearch" class="card">
        <div class="flex items-center justify-between mb-3">
          <p class="section-label mb-0">Dernier trajet</p>
          <button class="font-sans text-xs text-pierre hover:text-route transition-colors" @click="clearLastSearch">
            Effacer
          </button>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-brume flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-voyage" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-display text-sm font-bold text-encre truncate">
              {{ gareName(lastSearch.origine) || '?' }} → {{ gareName(lastSearch.destination) || '?' }}
            </p>
            <p class="font-sans text-xs text-pierre mt-0.5">
              {{ formatDate(lastSearch.date) }} · {{ lastSearch.places }} voyageur{{ lastSearch.places > 1 ? 's' : '' }}
            </p>
          </div>
          <Button variant="outline" class="h-9 px-3 text-xs flex-shrink-0" @click="relancerSearch">
            Relancer
          </Button>
        </div>
      </div>

      <!-- Bannière promo -->
      <div class="rounded-2xl overflow-hidden relative" style="background: linear-gradient(135deg, #1D4ED8 0%, #0F1829 100%);">
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div class="px-5 py-5 relative">
          <p class="font-sans text-white/60 text-xs font-semibold tracking-wider uppercase mb-1">Offre spéciale</p>
          <p class="font-display text-lg font-bold text-white leading-tight">
            −15% sur tous<br>les trajets de nuit
          </p>
          <p class="font-sans text-white/60 text-xs mt-2">
            Code : <span class="font-bold text-soleil">NUIT15</span>
          </p>
        </div>
        <div class="absolute right-5 bottom-4 opacity-15">
          <svg class="w-20 h-20 text-white" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        </div>
      </div>

    </div>

    <!-- Sélecteur ville (bottom sheet) -->
    <transition name="sheet">
      <div v-if="picker.open" class="fixed inset-0 z-50 flex flex-col" @click.self="picker.open = false">
        <div class="flex-1" />
        <div class="sheet-content bg-white rounded-t-3xl max-h-[78vh] flex flex-col shadow-ticket">
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-slate-200" />
          </div>
          <div class="px-5 pt-2 pb-3 border-b border-slate-100">
            <h3 class="font-display text-base font-semibold text-encre mb-3">
              {{ picker.field === 'origine' ? 'Ville de départ' : 'Ville d\'arrivée' }}
            </h3>
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pierre" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input v-model="picker.query" type="text" placeholder="Rechercher…" class="input-field pl-10 h-11 text-sm" autofocus />
            </div>
          </div>
          <div class="overflow-y-auto flex-1 divide-y divide-slate-50/80">
            <button
              v-for="g in filteredGares"
              :key="g.id"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-brume transition-colors"
              @click="selectGare(g)"
            >
              <div class="w-8 h-8 rounded-lg bg-brume flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-voyage" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p class="font-sans text-sm font-semibold text-encre">{{ g.nom }}</p>
                <p class="font-sans text-xs text-pierre">{{ g.ville }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import type { Gare } from '@/types'

const router = useRouter()
const search = useSearchStore()
const auth   = useAuthStore()
const today  = new Date().toISOString().slice(0, 10)
const picker = ref({ open: false, field: 'origine' as 'origine' | 'destination', query: '' })
const apiDown = ref(false)

const cityShortcuts = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Man', 'Daloa', 'Korhogo']

interface LastSearch { origine: any; destination: any; date: string; places: number }
const lastSearch = ref<LastSearch | null>(null)
try {
  const saved = localStorage.getItem('mot_last_search')
  if (saved) lastSearch.value = JSON.parse(saved)
} catch {}

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Bonjour,' : h < 18 ? 'Bon après-midi,' : 'Bonsoir,'
})

const filteredGares = computed(() =>
  search.gares.filter(g =>
    g.nom.toLowerCase().includes(picker.value.query.toLowerCase()) ||
    (g.ville || '').toLowerCase().includes(picker.value.query.toLowerCase())
  )
)

function gareName(id: any): string | undefined {
  // eslint-disable-next-line eqeqeq
  return search.gares.find(g => g.id == id)?.nom
}

function formatDate(d: string): string {
  if (!d || d === today) return "Aujourd'hui"
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function openPicker(field: 'origine' | 'destination') {
  picker.value = { open: true, field, query: '' }
}

function selectGare(g: Gare) {
  search.params[picker.value.field] = g.id as any
  picker.value.open = false
}

function quickCity(nom: string) {
  const g = search.gares.find(gare => gare.nom.toLowerCase().includes(nom.toLowerCase()))
  if (!g) return
  if (!search.params.origine) {
    search.params.origine = g.id as any
  } else {
    search.params.destination = g.id as any
  }
}

function doSearch() {
  localStorage.setItem('mot_last_search', JSON.stringify({
    origine: search.params.origine,
    destination: search.params.destination,
    date: search.params.date,
    places: search.params.places,
  }))
  router.push('/recherche')
}

function relancerSearch() {
  if (!lastSearch.value) return
  search.params.origine      = lastSearch.value.origine
  search.params.destination  = lastSearch.value.destination
  search.params.date         = lastSearch.value.date
  search.params.places       = lastSearch.value.places
  router.push('/recherche')
}

function clearLastSearch() {
  lastSearch.value = null
  localStorage.removeItem('mot_last_search')
}

onMounted(async () => {
  try {
    await search.loadGares()
  } catch {
    apiDown.value = true
    toast.error('Service temporairement indisponible', { description: 'Vérifiez votre connexion réseau' })
  }
})
</script>
