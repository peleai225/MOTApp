<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { ArrowRight, Check } from 'lucide-vue-next'
import { haptic } from '@/lib/haptics'
import { addDays, dayLabel, isoDate } from '@/lib/format'

const router = useRouter()
const track = ref<HTMLElement | null>(null)
const index = ref(0)

const slides = [
  { title: 'Réservez votre car sans passer au guichet', text: 'Cherchez un départ, comparez les horaires et réservez en quelques gestes, où que vous soyez.' },
  { title: 'Choisissez votre place', text: 'Fenêtre ou couloir, à l’avant ou au fond : sélectionnez vos sièges sur le plan du car.' },
  { title: 'Votre billet reste dans votre poche', text: 'Le QR code s’affiche même sans connexion. Et si vos plans changent, annulez jusqu’à 2 h avant le départ.' },
]

// Mini plan de car pour la 2ᵉ vignette
const seatGrid = [
  ['t', 'f', 't', 'f'], ['f', 's', 's', 't'], ['t', 'f', 'f', 'f'], ['f', 't', 't', 'f'], ['t', 'f', 'f', 't'],
]

function onScroll() {
  const el = track.value
  if (!el) return
  const i = Math.round(el.scrollLeft / el.clientWidth)
  if (i !== index.value) { index.value = i; haptic.select() }
}

function go(i: number) {
  track.value?.scrollTo({ left: i * (track.value?.clientWidth || 0), behavior: 'smooth' })
}

function next() {
  if (index.value < slides.length - 1) go(index.value + 1)
  else finish()
}

function finish() {
  haptic.tap()
  localStorage.setItem('mot_onboarding_done', '1')
  router.replace(localStorage.getItem('mot_token') ? { name: 'home' } : { name: 'welcome' })
}
</script>

<template>
  <div class="view bg-surface">
    <header class="safe-top shrink-0">
      <div class="flex h-14 items-center justify-between px-5">
        <img src="/images/logo-mot.png" alt="MOT" class="h-7 w-auto dark:box-content dark:rounded-lg dark:bg-white dark:px-2 dark:py-1" />
        <button v-if="index < slides.length - 1" type="button" class="px-1 py-2 text-[15px] font-semibold text-asphalte" @click="finish">Passer</button>
      </div>
    </header>

    <div ref="track" class="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain" @scroll.passive="onScroll">
      <section v-for="(s, i) in slides" :key="i" class="flex w-full shrink-0 snap-center snap-always flex-col px-6" :aria-hidden="i !== index">
        <!-- Vignettes -->
        <div class="flex min-h-0 flex-1 items-center justify-center py-4">
          <div v-if="i === 0" class="relative w-full max-w-[330px]">
            <div class="h-[270px] overflow-hidden rounded-[30px] bg-[#2F6BD0]">
              <img src="/images/bus-720.jpg" alt="" class="h-full w-full scale-[1.4] object-cover object-[36%_62%]" />
            </div>
            <div class="absolute -bottom-6 left-4 right-4 rounded-[22px] bg-surface p-4 shadow-panel">
              <div class="flex items-center gap-2 text-[15px] font-semibold">
                <span class="h-3 w-3 rounded-full border-[3px] border-bleu-ink" />Yopougon
                <span class="h-px flex-1 border-t-2 border-dotted border-bleu-200" />
                <span class="h-3 w-3 rounded-full bg-rouge" />Bondoukou
              </div>
              <div class="mt-3 flex items-end justify-between">
                <p class="text-[13px] text-asphalte">{{ dayLabel(addDays(isoDate(), 1)) }}, <span class="num font-semibold text-encre">08:30</span></p>
                <p class="num font-display text-[22px] font-semibold leading-none text-bleu-ink">8 000 <span class="font-sans text-[12px]">FCFA</span></p>
              </div>
            </div>
          </div>

          <div v-else-if="i === 1" class="w-[230px] rounded-[40px_40px_22px_22px] bg-surface px-5 pb-5 pt-6 shadow-[0_0_0_3px_rgb(var(--c-ligne)),0_24px_48px_-20px_rgba(13,21,48,0.3)]">
            <div class="mb-4 border-b-2 border-dashed border-hairline pb-3 text-center text-[12px] font-semibold text-asphalte">Avant du car</div>
            <div class="space-y-2.5">
              <div v-for="(row, r) in seatGrid" :key="r" class="grid grid-cols-[1fr_1fr_14px_1fr_1fr] gap-2">
                <template v-for="(c, ci) in row" :key="ci">
                  <span v-if="ci === 2" />
                  <span
                    class="flex aspect-square items-center justify-center rounded-[9px_9px_6px_6px]"
                    :class="c === 's' ? 'bg-bleu text-white' : c === 't' ? 'seat-hatch' : 'bg-surface shadow-seat'"
                  >
                    <Check v-if="c === 's'" class="h-4 w-4" :stroke-width="3" />
                  </span>
                </template>
              </div>
            </div>
          </div>

          <div v-else class="w-[250px] -rotate-3 overflow-hidden rounded-[24px] bg-surface shadow-[0_24px_48px_-20px_rgba(13,21,48,0.35),0_0_0_1px_rgba(13,21,48,0.05)]">
            <div class="bg-bleu px-4 pb-4 pt-3 text-white">
              <div class="flex items-center justify-between text-[12px] text-white/75"><span>Billet de car</span><span class="num">MOT-4B7K</span></div>
              <div class="mt-3 flex items-end justify-between">
                <div><p class="num font-display text-[28px] font-semibold leading-none">08:30</p><p class="mt-1 text-[13px] font-semibold">Yopougon</p></div>
                <div class="text-right"><p class="num font-display text-[28px] font-semibold leading-none">16:00</p><p class="mt-1 text-[13px] font-semibold">Bondoukou</p></div>
              </div>
            </div>
            <div class="perforation bg-surface" style="--notch-bg:#fff"><span class="notch notch-l" /><span class="notch notch-r" /></div>
            <div class="flex justify-center px-4 pb-5">
              <QrcodeVue value="MOT-DEMO-ONBOARDING" :size="124" level="M" render-as="svg" foreground="#0D1530" />
            </div>
          </div>
        </div>

        <div class="shrink-0 pb-2 pt-6">
          <h2 class="font-display text-[36px] font-semibold leading-[1.02] text-encre">{{ s.title }}</h2>
          <p class="mt-3 text-[16px] leading-[24px] text-asphalte">{{ s.text }}</p>
        </div>
      </section>
    </div>

    <footer class="safe-bottom flex shrink-0 items-center justify-between gap-4 px-6 pt-4">
      <div class="flex items-center gap-2" role="tablist" aria-label="Étapes de la présentation">
        <button
          v-for="(_, i) in slides"
          :key="i"
          type="button"
          role="tab"
          :aria-selected="i === index"
          :aria-label="`Écran ${i + 1}`"
          class="h-2 rounded-full transition-all duration-300 ease-native"
          :class="i === index ? 'w-7 bg-bleu' : 'w-2 bg-chevron'"
          @click="go(i)"
        />
      </div>
      <button type="button" class="btn-primary min-w-[150px]" @click="next">
        {{ index < slides.length - 1 ? 'Suivant' : 'Commencer' }}
        <ArrowRight v-if="index < slides.length - 1" class="h-5 w-5" />
      </button>
    </footer>
  </div>
</template>
