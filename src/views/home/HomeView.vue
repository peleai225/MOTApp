<template>
  <div class="flex flex-col min-h-dvh bg-brume">

    <!-- Header compact Nuit -->
    <div class="bg-nuit px-5 pt-safe pb-5">
      <div class="flex items-center justify-between mt-3">
        <div>
          <p class="font-sans text-white/50 text-xs tracking-wider">{{ greeting }}</p>
          <h1 class="font-display text-xl font-bold text-white leading-tight">
            {{ auth.user?.prenom || 'MoT Transport' }}
          </h1>
        </div>
        <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Card de recherche (flottante sur le header) -->
    <div class="px-4 -mt-2">
      <div class="card shadow-ticket">
        <h2 class="font-display text-base font-semibold text-encre mb-4">Rechercher un trajet</h2>

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
          <button
            class="flex items-center gap-2.5 h-12 bg-brume rounded-btn border border-slate-200/80 px-3 text-left hover:border-soleil transition-colors"
            @click="showDatePicker = true"
          >
            <svg class="w-4 h-4 text-pierre flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div>
              <p class="section-label mb-0">Date</p>
              <p class="font-sans text-xs font-semibold text-encre">{{ formatDate(search.params.date) }}</p>
            </div>
          </button>

          <div class="flex items-center gap-2.5 h-12 bg-brume rounded-btn border border-slate-200/80 px-3">
            <svg class="w-4 h-4 text-pierre flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="flex-1">
              <p class="section-label mb-0">Voyageurs</p>
              <p class="font-sans text-xs font-semibold text-encre">{{ search.params.places }}</p>
            </div>
            <div class="flex flex-col">
              <button class="text-route leading-none text-xs font-bold" @click="search.params.places = Math.min(10, search.params.places + 1)">▲</button>
              <button class="text-route leading-none text-xs font-bold" @click="search.params.places = Math.max(1, search.params.places - 1)">▼</button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <AppButton @click="doSearch">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Rechercher un trajet
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Destinations populaires -->
    <div class="px-5 mt-6 pb-28">
      <p class="section-label">Destinations populaires</p>
      <div class="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style="scrollbar-width: none;">
        <button
          v-for="t in popular"
          :key="t.label"
          class="flex-shrink-0 flex flex-col gap-1 bg-white rounded-xl px-4 py-3 shadow-card border border-slate-100 active:scale-[0.97] transition-transform"
          @click="quickSearch(t)"
        >
          <span class="font-sans text-xs text-pierre">{{ t.label }}</span>
          <span class="font-display text-sm font-bold text-encre">{{ t.prix }}</span>
        </button>
      </div>
    </div>

    <!-- Sélecteur ville (bottom sheet) -->
    <transition name="sheet">
      <div v-if="picker.open" class="fixed inset-0 z-50 flex flex-col" @click.self="picker.open = false">
        <div class="flex-1" />
        <div class="sheet-content bg-white rounded-t-3xl max-h-[78vh] flex flex-col shadow-ticket">
          <!-- Handle -->
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useAuthStore }   from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const search = useSearchStore()
const auth   = useAuthStore()
const today  = new Date().toISOString().slice(0, 10)
const showDatePicker = ref(false)
const picker = ref({ open: false, field: 'origine', query: '' })

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Bonjour,' : h < 18 ? 'Bon après-midi,' : 'Bonsoir,'
})

const popular = [
  { label: 'Abidjan → Bouaké',       prix: '5 500 FCFA', origine: 'Yopougon', destination: 'Bouaké' },
  { label: 'Abidjan → Yamoussoukro', prix: '3 500 FCFA', origine: 'Yopougon', destination: 'Yamoussoukro' },
  { label: 'Abidjan → San-Pédro',    prix: '6 000 FCFA', origine: 'Yopougon', destination: 'San-Pédro' },
  { label: 'Abidjan → Man',          prix: '7 500 FCFA', origine: 'Yopougon', destination: 'Man' },
]

const filteredGares = computed(() =>
  search.gares.filter(g =>
    g.nom.toLowerCase().includes(picker.value.query.toLowerCase()) ||
    (g.ville || '').toLowerCase().includes(picker.value.query.toLowerCase())
  )
)

function gareName(id) { return search.gares.find(g => g.id === id)?.nom }

function formatDate(d) {
  if (!d || d === today) return 'Aujourd\'hui'
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function openPicker(field) { picker.value = { open: true, field, query: '' } }

function selectGare(g) {
  search.params[picker.value.field] = g.id
  picker.value.open = false
}

function quickSearch(t) {
  const o = search.gares.find(g => g.nom.toLowerCase().includes(t.origine.toLowerCase()))
  const d = search.gares.find(g => g.nom.toLowerCase().includes(t.destination.toLowerCase()))
  if (o) search.params.origine      = o.id
  if (d) search.params.destination  = d.id
  router.push('/recherche')
}

function doSearch() { router.push('/recherche') }

onMounted(() => search.loadGares())
</script>
