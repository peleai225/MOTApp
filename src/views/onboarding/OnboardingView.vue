<template>
  <div class="page-dark select-none" @touchstart="onTouchStart" @touchend="onTouchEnd">

    <!-- Bouton Passer -->
    <button
      class="absolute top-12 right-5 z-10 font-sans text-sm text-white/50 hover:text-white/80 transition-colors pt-safe"
      @click="finish"
    >
      Passer
    </button>

    <!-- Slides -->
    <div class="flex-1 relative overflow-hidden">
      <transition :name="dir" mode="out-in">
        <div :key="current" class="absolute inset-0 flex flex-col items-center justify-end px-8 pb-0">

          <!-- Illustration -->
          <div class="flex-1 flex items-center justify-center w-full">
            <div class="relative">
              <!-- Cercle de fond -->
              <div class="w-56 h-56 rounded-full opacity-10" :class="slides[current].ring" />
              <!-- Icône centrale -->
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-28 h-28 text-white" fill="none" stroke="currentColor" :stroke-width="1.25" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="slides[current].icon" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Texte -->
          <div class="w-full pb-8 text-center">
            <!-- Numéro slide -->
            <p class="font-mono text-2xs text-white/30 tracking-widest mb-4">
              0{{ current + 1 }} — 0{{ slides.length }}
            </p>
            <h2 class="font-display text-[28px] font-bold text-white leading-tight mb-3">
              {{ slides[current].title }}
            </h2>
            <p class="font-sans text-[15px] text-white/60 leading-relaxed">
              {{ slides[current].body }}
            </p>
          </div>
        </div>
      </transition>
    </div>

    <!-- Footer : pagination + bouton -->
    <div class="px-6 pb-10 pt-6 flex flex-col items-center gap-6">
      <!-- Dots -->
      <div class="flex gap-2 items-center">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="rounded-full transition-all duration-300"
          :class="i === current ? 'w-6 h-2 bg-soleil' : 'w-2 h-2 bg-white/20'"
          @click="current = i"
        />
      </div>

      <!-- CTA -->
      <div class="w-full max-w-xs">
        <Button v-if="current < slides.length - 1" @click="next">
          Suivant
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Button>
        <Button v-else variant="outline" @click="finish">
          Commencer
        </Button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router  = useRouter()
const current = ref<number>(0)
const dir     = ref('slide')

const slides = [
  {
    title: 'Partez quand vous voulez',
    body:  'Cherchez et réservez votre place de bus depuis n\'importe où. La gare vient à vous.',
    icon:  'M8 17l4 4 4-4m-4-5v9M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29',
    ring:  'bg-voyage',
  },
  {
    title: 'Votre ticket sur votre téléphone',
    body:  'Recevez un QR code instantanément. Montrez-le à l\'entrée — c\'est tout ce qu\'il faut.',
    icon:  'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
    ring:  'bg-soleil',
  },
  {
    title: 'Annulez sans stress',
    body:  'Changement de plan ? Annulez jusqu\'à 2h avant le départ, sans frais cachés, sans questions.',
    icon:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    ring:  'bg-route',
  },
]

let touchX = 0
function onTouchStart(e) { touchX = e.touches[0].clientX }
function onTouchEnd(e) {
  const d = touchX - e.changedTouches[0].clientX
  if (d > 50 && current.value < slides.length - 1) next()
  else if (d < -50 && current.value > 0) current.value--
}

function next() { current.value++ }

function finish() {
  localStorage.setItem('mot_onboarding_done', '1')
  router.push('/bienvenue')
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.28s ease; }
.slide-enter-from { opacity: 0; transform: translateX(32px); }
.slide-leave-to   { opacity: 0; transform: translateX(-32px); }
</style>
