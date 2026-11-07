<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  BookOpenText, ChevronRight, Download, FlaskConical, Globe, LogOut, Mail, MessageCircle, Phone, RotateCcw, Share, SquarePen, UserRound,
} from 'lucide-vue-next'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import Segmented from '@/components/ui/Segmented.vue'
import LiveryStripes from '@/components/mot/LiveryStripes.vue'
import { useAuthStore } from '@/stores/auth'
import { useTicketsStore } from '@/stores/tickets'
import { useAppStore } from '@/stores/app'
import { useTabReselect } from '@/composables/useTabReselect'
import { isDemo } from '@/api'
import { DEMO_ACCOUNT } from '@/api/demo'
import { formatPhone, initials, plural } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import { BRAND } from '@/config'
import { themePref, type ThemePref } from '@/lib/theme'

const themeOptions: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
]

defineOptions({ name: 'ProfileView' })

const router = useRouter()
const auth = useAuthStore()
const tickets = useTicketsStore()
const appStore = useAppStore()

const scroller = ref<HTMLElement | null>(null)
useTabReselect('profile', scroller)

const confirmLogout = ref(false)
const howTo = ref(false)
const iosInstall = ref(false)

const u = computed(() => auth.user)
const stats = computed(() => {
  const parts: string[] = []
  if (u.value?.nombre_voyages != null) parts.push(plural(u.value.nombre_voyages, 'voyage'))
  if (u.value?.points_fidelite != null) parts.push(plural(u.value.points_fidelite, 'point fidélité', 'points fidélité'))
  return parts.join(', ')
})

async function logout() {
  await auth.logout()
  tickets.clear()
  confirmLogout.value = false
  haptic.success()
  toast('Vous êtes déconnecté')
  router.replace({ name: 'home' })
}

async function install() {
  const r = await appStore.install()
  if (r === 'ios') iosInstall.value = true
  else if (r === 'accepted') toast.success('Application installée')
}

function replayIntro() {
  localStorage.removeItem('mot_onboarding_done')
  router.push({ name: 'onboarding' })
}

const steps = [
  { t: 'Cherchez votre départ', d: 'Choisissez la gare de départ, l’arrivée, la date et le nombre de voyageurs.' },
  { t: 'Choisissez vos places', d: 'Sélectionnez vos sièges sur le plan du car ou laissez MOT les attribuer.' },
  { t: 'Payez', d: 'Par Mobile Money, carte bancaire ou en espèces au guichet avant le départ.' },
  { t: 'Embarquez', d: 'Présentez le QR code de votre billet au contrôleur, 30 minutes avant le départ.' },
]
</script>

<template>
  <div class="view">
    <div ref="scroller" class="view-scroll tabbar-space">
      <!-- En-tête -->
      <header class="safe-top relative overflow-hidden bg-surface px-5 pb-6">
        <LiveryStripes class="pointer-events-none absolute -right-2 bottom-0 h-[54px] w-[190px]" />
        <h1 class="pt-4 font-display text-[36px] font-semibold leading-none">Profil</h1>

        <div v-if="u" class="relative mt-5 flex items-center gap-4">
          <span class="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-bleu font-display text-[28px] font-semibold text-white">
            {{ initials(u.prenom, u.nom) }}
          </span>
          <div class="min-w-0 pr-4">
            <p class="truncate font-display text-[26px] font-semibold leading-7">{{ u.prenom }} {{ u.nom }}</p>
            <p class="num text-[15px] text-asphalte">{{ formatPhone(u.telephone) }}</p>
            <p v-if="stats" class="mt-0.5 text-[13px] font-medium text-bleu-ink">{{ stats }}</p>
          </div>
        </div>

        <div v-else class="relative mt-5 pr-10">
          <p class="text-[16px] leading-[23px] text-asphalte">Connectez-vous pour réserver plus vite et retrouver vos billets sur tous vos appareils.</p>
          <div class="mt-4 flex gap-2">
            <button type="button" class="btn-primary flex-1" @click="router.push({ name: 'login', query: { redirect: '/profil' } })">Se connecter</button>
            <button type="button" class="btn-secondary flex-1" @click="router.push({ name: 'register' })">Créer un compte</button>
          </div>
        </div>
      </header>

      <!-- Compte -->
      <section v-if="u" class="mt-6 px-4">
        <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">Mon compte</h2>
        <div class="group-list">
          <button type="button" class="tap-row flex w-full items-center gap-3.5 px-4 py-3.5 text-left" @click="router.push({ name: 'edit-profile' })">
            <SquarePen class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Mes informations</span>
            <ChevronRight class="h-5 w-5 text-chevron" />
          </button>
          <div v-if="u.code" class="flex items-center gap-3.5 px-4 py-3.5">
            <UserRound class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Numéro client</span>
            <span class="num text-[15px] text-asphalte">{{ u.code }}</span>
          </div>
        </div>
      </section>

      <!-- Aide -->
      <section class="mt-6 px-4">
        <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">Aide</h2>
        <div class="group-list">
          <button type="button" class="tap-row flex w-full items-center gap-3.5 px-4 py-3.5 text-left" @click="howTo = true">
            <BookOpenText class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Comment réserver</span>
            <ChevronRight class="h-5 w-5 text-chevron" />
          </button>
          <a :href="`tel:${BRAND.phone}`" class="tap-row flex items-center gap-3.5 px-4 py-3.5">
            <Phone class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Appeler le service client</span>
            <span class="num text-[14px] text-asphalte">{{ BRAND.phoneDisplay }}</span>
          </a>
          <a :href="`https://wa.me/${BRAND.whatsapp}`" target="_blank" rel="noopener" class="tap-row flex items-center gap-3.5 px-4 py-3.5">
            <MessageCircle class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Écrire sur WhatsApp</span>
            <ChevronRight class="h-5 w-5 text-chevron" />
          </a>
          <a :href="`mailto:${BRAND.email}`" class="tap-row flex items-center gap-3.5 px-4 py-3.5">
            <Mail class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Envoyer un e-mail</span>
            <ChevronRight class="h-5 w-5 text-chevron" />
          </a>
          <a :href="BRAND.website" target="_blank" rel="noopener" class="tap-row flex items-center gap-3.5 px-4 py-3.5">
            <Globe class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Site motransport.ci</span>
            <ChevronRight class="h-5 w-5 text-chevron" />
          </a>
        </div>
      </section>

      <!-- Application -->
      <section class="mt-6 px-4">
        <h2 class="px-1 pb-2 text-[14px] font-semibold text-asphalte">Application</h2>
        <div class="group-list">
          <button v-if="appStore.canInstall" type="button" class="tap-row flex w-full items-center gap-3.5 px-4 py-3.5 text-left" @click="install">
            <Download class="h-5 w-5 text-bleu-ink" />
            <span class="min-w-0 flex-1">
              <span class="block text-[16px] font-medium">Installer l’application</span>
              <span class="block text-[13px] text-asphalte">Accès direct depuis l’écran d’accueil, même hors connexion</span>
            </span>
          </button>
          <div class="px-4 py-3.5">
            <p class="text-[16px] font-medium">Apparence</p>
            <p class="mb-3 text-[13px] text-asphalte">« Auto » suit le réglage clair ou sombre de votre téléphone.</p>
            <Segmented v-model="themePref" :options="themeOptions" />
          </div>
          <button type="button" class="tap-row flex w-full items-center gap-3.5 px-4 py-3.5 text-left" @click="replayIntro">
            <RotateCcw class="h-5 w-5 text-bleu-ink" />
            <span class="flex-1 text-[16px] font-medium">Revoir la présentation</span>
            <ChevronRight class="h-5 w-5 text-chevron" />
          </button>
          <div v-if="isDemo" class="flex items-start gap-3.5 px-4 py-3.5">
            <FlaskConical class="mt-0.5 h-5 w-5 text-ambre" />
            <span class="min-w-0 flex-1">
              <span class="block text-[16px] font-medium">Mode démonstration</span>
              <span class="block text-[13px] leading-[18px] text-asphalte">
                Le serveur MOT est injoignable : trajets et billets sont simulés sur cet appareil. Compte de test {{ DEMO_ACCOUNT.telephone }}, mot de passe {{ DEMO_ACCOUNT.password }}.
              </span>
            </span>
          </div>
          <div class="flex items-center justify-between px-4 py-3.5">
            <span class="text-[16px] font-medium">Version</span>
            <span class="num text-[15px] text-asphalte">{{ BRAND.version }}</span>
          </div>
        </div>
      </section>

      <section v-if="u" class="mt-6 px-4">
        <div class="group-list">
          <button type="button" class="tap-row flex w-full items-center gap-3.5 px-4 py-3.5 text-left text-rouge" @click="confirmLogout = true">
            <LogOut class="h-5 w-5" />
            <span class="flex-1 text-[16px] font-semibold">Se déconnecter</span>
          </button>
        </div>
      </section>

      <p class="mt-8 px-6 text-center text-[13px] text-gravier">{{ BRAND.fullName }}</p>
    </div>

    <BottomSheet v-model:open="confirmLogout" title="Se déconnecter ?" description="Vos billets ne seront plus visibles sur cet appareil tant que vous ne vous reconnectez pas.">
      <template #footer>
        <div class="flex flex-col gap-2">
          <button type="button" class="btn-danger w-full" @click="logout">Se déconnecter</button>
          <button type="button" class="btn-ghost w-full" @click="confirmLogout = false">Rester connecté</button>
        </div>
      </template>
    </BottomSheet>

    <BottomSheet v-model:open="howTo" title="Comment réserver">
      <ol class="space-y-5 pb-4 pt-1">
        <li v-for="(s, i) in steps" :key="s.t" class="flex gap-4">
          <span class="num flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bleu font-display text-[18px] font-semibold text-white">{{ i + 1 }}</span>
          <div>
            <p class="text-[16px] font-semibold">{{ s.t }}</p>
            <p class="mt-0.5 text-[14px] leading-5 text-asphalte">{{ s.d }}</p>
          </div>
        </li>
      </ol>
    </BottomSheet>

    <BottomSheet v-model:open="iosInstall" title="Installer sur iPhone">
      <ol class="space-y-4 pb-4 pt-1 text-[15px] leading-[22px]">
        <li class="flex gap-3"><Share class="mt-0.5 h-5 w-5 shrink-0 text-bleu-ink" />Touchez le bouton Partager de Safari.</li>
        <li class="flex gap-3"><Download class="mt-0.5 h-5 w-5 shrink-0 text-bleu-ink" />Choisissez « Sur l’écran d’accueil », puis « Ajouter ».</li>
      </ol>
    </BottomSheet>
  </div>
</template>
