<template>
  <div class="flex flex-col min-h-dvh bg-gray-50">

    <!-- ── Hero ───────────────────────────────────────── -->
    <div class="relative bg-white overflow-hidden">
      <!-- Ciel dégradé -->
      <div class="absolute inset-0" style="background: linear-gradient(180deg,#D6EAF8 0%,#ffffff 65%)" />
      <!-- Photo bus (positionnée à droite) -->
      <img
        src="/images/bus-hero.jpg"
        alt=""
        class="absolute right-0 bottom-0 h-44 object-contain"
        style="max-width:60%; pointer-events:none;"
      />

      <!-- Barre logo + cloche -->
      <div class="relative flex items-center justify-between px-5 mt-3" style="padding-top:max(16px,env(safe-area-inset-top))">
        <img src="/images/logo-mot.png" alt="MoT Transport" class="h-10 object-contain" />
        <button class="relative w-10 h-10 rounded-full bg-nuit flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-route text-white text-[10px] font-bold flex items-center justify-center">2</span>
        </button>
      </div>

      <!-- Texte hero -->
      <div class="relative px-5 mt-4 pb-4" style="min-height:148px">
        <p class="font-sans text-sm text-pierre">{{ greeting }}</p>
        <h1 class="font-display text-[28px] font-bold text-nuit leading-tight mt-1">
          Où allez-vous<br>
          <span class="text-route">aujourd'hui ?</span>
        </h1>
        <p class="font-sans text-sm text-pierre mt-2 leading-snug">
          Voyagez autrement,<br>
          Voyagez avec <span class="text-route font-semibold">MOT</span>.
        </p>
      </div>

      <!-- Bandeau 3 atouts -->
      <div class="relative mx-4 mb-5 bg-nuit rounded-2xl px-3 py-3">
        <div class="flex divide-x divide-white/10">
          <div v-for="f in features" :key="f.title" class="flex-1 flex items-start gap-2 px-2.5 first:pl-1 last:pr-1">
            <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon" />
              </svg>
            </div>
            <div>
              <p class="font-sans font-bold text-white text-[10px] tracking-wider leading-tight">{{ f.title }}</p>
              <p class="font-sans text-white/55 text-[9px] leading-snug mt-0.5">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Contenu scrollable ────────────────────────── -->
    <div class="flex-1 px-4 pb-28 space-y-3.5 mt-1">

      <!-- Alerte réseau -->
      <div v-if="apiDown" class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <div>
          <p class="font-sans text-sm font-semibold text-amber-800">Service indisponible</p>
          <p class="font-sans text-xs text-amber-600 mt-0.5">Impossible de charger les gares. Vérifiez votre connexion.</p>
        </div>
      </div>

      <!-- ── Card recherche ─────────────────────────── -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 class="font-display text-[17px] font-bold text-nuit mb-4">Rechercher un trajet</h2>

        <!-- Départ -->
        <button
          class="w-full flex items-center gap-3 h-[56px] bg-gray-50 rounded-xl border border-slate-200 px-4 mb-2 text-left hover:border-route/60 transition-colors active:scale-[0.99]"
          @click="openPicker('origine')"
        >
          <svg class="w-5 h-5 text-nuit flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="flex-1 min-w-0">
            <p class="font-sans text-[10px] font-bold text-pierre uppercase tracking-wider">Départ</p>
            <p class="font-sans text-sm font-semibold text-nuit truncate">
              {{ gareName(search.params.origine) || 'Choisir une ville' }}
            </p>
          </div>
          <!-- Swap -->
          <span
            class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 hover:border-nuit transition-colors"
            @click.stop="search.swapVilles()"
          >
            <svg class="w-4 h-4 text-nuit" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </span>
        </button>

        <!-- Arrivée -->
        <button
          class="w-full flex items-center gap-3 h-[56px] bg-gray-50 rounded-xl border border-slate-200 px-4 mb-4 text-left hover:border-route/60 transition-colors active:scale-[0.99]"
          @click="openPicker('destination')"
        >
          <svg class="w-5 h-5 text-route flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="flex-1 min-w-0">
            <p class="font-sans text-[10px] font-bold text-pierre uppercase tracking-wider">Arrivée</p>
            <p class="font-sans text-sm font-semibold text-nuit truncate">
              {{ gareName(search.params.destination) || 'Choisir une ville' }}
            </p>
          </div>
          <svg class="w-4 h-4 text-pierre flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Date + Voyageurs -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <!-- Date native -->
          <label class="relative flex items-center gap-2.5 h-[52px] bg-gray-50 rounded-xl border border-slate-200 px-3 cursor-pointer hover:border-route/60 transition-colors">
            <svg class="w-4 h-4 text-nuit flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div class="flex-1 min-w-0 pointer-events-none">
              <p class="font-sans text-[10px] font-bold text-pierre uppercase tracking-wider">Date</p>
              <p class="font-sans text-xs font-semibold text-nuit truncate">{{ formatDate(search.params.date) }}</p>
            </div>
            <svg class="w-3.5 h-3.5 text-pierre flex-shrink-0 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
            <input type="date" :min="today" v-model="search.params.date" class="absolute inset-0 opacity-0 w-full cursor-pointer" />
          </label>

          <!-- Voyageurs → ouvre sheet -->
          <button
            class="flex items-center gap-2.5 h-[52px] bg-gray-50 rounded-xl border border-slate-200 px-3 text-left hover:border-route/60 transition-colors"
            @click="showPassengers = true"
          >
            <svg class="w-4 h-4 text-nuit flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="font-sans text-[10px] font-bold text-pierre uppercase tracking-wider">Voyageurs</p>
              <p class="font-sans text-xs font-semibold text-nuit">{{ search.params.places }} voyageur{{ search.params.places > 1 ? 's' : '' }}</p>
            </div>
            <svg class="w-3.5 h-3.5 text-pierre flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <!-- Bouton CTA -->
        <button
          class="w-full h-14 rounded-xl bg-route text-white font-sans font-bold text-sm flex items-center justify-center gap-2.5 uppercase tracking-widest active:scale-[0.98] transition-transform"
          style="box-shadow:0 4px 18px rgba(233,85,13,0.38)"
          @click="doSearch"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Rechercher un trajet
        </button>
      </div>

      <!-- ── Prochains départs ──────────────────────── -->
      <div class="relative rounded-2xl overflow-hidden" style="min-height:156px">
        <img src="/images/bus-interior.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-nuit/88" />
        <div class="relative px-5 py-4">
          <p class="font-sans text-[10px] font-bold text-white/55 uppercase tracking-widest mb-3">Prochains départs</p>
          <div class="flex items-end gap-7 mb-4">
            <div v-for="slot in timeSlots" :key="slot.time">
              <p class="font-display text-2xl font-bold text-route leading-none">{{ slot.time }}</p>
              <p class="font-sans text-xs text-white/55 mt-1">{{ slot.label }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <div>
                <p class="font-display text-sm font-bold text-white">Abidjan ↔ Bouaké</p>
                <p class="font-sans text-xs text-white/50">Départs tous les jours</p>
              </div>
            </div>
            <button
              class="h-9 px-3 rounded-xl border border-white/25 text-white font-sans text-[11px] font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
              @click="voirHoraires"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Voir les horaires
            </button>
          </div>
        </div>
      </div>

      <!-- ── Offre spéciale nuit ────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-7 h-7 text-route" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M17 17h.01M3 12a9 9 0 1018 0 9 9 0 00-18 0zM9.5 9.5l5 5m-5 0l5-5"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-sm font-bold text-route">Offre spécial nuit</p>
          <p class="font-sans text-[13px] font-semibold text-nuit">-15% sur tous les trajets de nuit</p>
          <p class="font-sans text-xs text-pierre mt-0.5">20H00 - 05H00</p>
        </div>
        <button class="flex-shrink-0 h-10 px-4 rounded-xl bg-nuit text-white font-sans text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform">
          J'en profite
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </div>

    <!-- ── Bottom sheet : sélecteur ville ─────────────── -->
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

    <!-- ── Bottom sheet : voyageurs ───────────────────── -->
    <transition name="sheet">
      <div v-if="showPassengers" class="fixed inset-0 z-50 flex flex-col" @click.self="showPassengers = false">
        <div class="flex-1" />
        <div class="sheet-content bg-white rounded-t-3xl shadow-ticket">
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-slate-200" />
          </div>
          <div class="px-5 pt-4 pb-8">
            <h3 class="font-display text-base font-semibold text-encre mb-6">Nombre de voyageurs</h3>
            <div class="flex items-center justify-between">
              <span class="font-sans text-sm text-encre">Adultes</span>
              <div class="flex items-center gap-5">
                <button
                  class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-route font-bold text-xl hover:border-route transition-colors active:scale-90"
                  @click="search.params.places = Math.max(1, search.params.places - 1)"
                >−</button>
                <span class="font-display text-xl font-bold text-encre w-5 text-center">{{ search.params.places }}</span>
                <button
                  class="w-10 h-10 rounded-xl bg-route flex items-center justify-center text-white font-bold text-xl active:scale-90 transition-transform"
                  @click="search.params.places = Math.min(10, search.params.places + 1)"
                >+</button>
              </div>
            </div>
            <button
              class="w-full mt-7 h-13 h-[52px] bg-route rounded-xl text-white font-bold font-sans text-sm uppercase tracking-wider"
              @click="showPassengers = false"
            >
              Confirmer
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
import { useAuthStore }   from '@/stores/auth'
import { toast } from 'vue-sonner'
import type { Gare } from '@/types'

const router = useRouter()
const search = useSearchStore()
const auth   = useAuthStore()
const today  = new Date().toISOString().slice(0, 10)

const picker         = ref({ open: false, field: 'origine' as 'origine' | 'destination', query: '' })
const showPassengers = ref(false)
const apiDown        = ref(false)

const features = [
  { title: 'SÉCURITÉ',     desc: 'Votre sécurité est notre priorité.',     icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { title: 'CONFORT',      desc: 'Des autocars modernes et tout confort.',  icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { title: 'PONCTUALITÉ',  desc: 'Des départs à l\'heure, à chaque trajet.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const timeSlots = [
  { time: '07:30', label: 'Matin' },
  { time: '14:00', label: 'Après-midi' },
  { time: '20:30', label: 'Soir' },
]

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

function doSearch() {
  localStorage.setItem('mot_last_search', JSON.stringify({
    origine: search.params.origine,
    destination: search.params.destination,
    date: search.params.date,
    places: search.params.places,
  }))
  router.push('/recherche')
}

function voirHoraires() {
  router.push('/recherche')
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
