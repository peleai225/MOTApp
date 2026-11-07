<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { FlaskConical, MessageCircle, Phone } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import AppInput from '@/components/ui/AppInput.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useAuthStore } from '@/stores/auth'
import { useTicketsStore } from '@/stores/tickets'
import { errorMessage, isDemo } from '@/api'
import { DEMO_ACCOUNT } from '@/api/demo'
import { formatPhone } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import { BRAND } from '@/config'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const tickets = useTicketsStore()

const form = reactive({ telephone: '', password: '' })
const err = reactive({ telephone: '', password: '' })
const loading = ref(false)
const forgot = ref(false)

function fillDemo() {
  form.telephone = DEMO_ACCOUNT.telephone
  form.password = DEMO_ACCOUNT.password
  haptic.select()
}

async function submit() {
  err.telephone = ''; err.password = ''
  if (form.telephone.replace(/\D/g, '').length < 8) err.telephone = 'Entrez votre numéro de téléphone.'
  if (!form.password) err.password = 'Entrez votre mot de passe.'
  if (err.telephone || err.password) { haptic.warning(); return }

  loading.value = true
  try {
    const client = await auth.login(form.telephone, form.password)
    tickets.clear()
    haptic.success()
    toast.success(`Bienvenue ${client.prenom}`)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (e) {
    haptic.warning()
    err.telephone = errorMessage(e, 'Téléphone ou mot de passe incorrect.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="view bg-surface">
    <AppBar back-to="/bienvenue" />

    <form class="view-scroll px-6 pb-6" novalidate @submit.prevent="submit">
      <h1 class="font-display text-[40px] font-semibold leading-none">Connexion</h1>
      <p class="mt-2 text-[16px] text-asphalte">Avec le numéro utilisé lors de votre inscription.</p>

      <button
        v-if="isDemo"
        type="button"
        class="tap mt-5 flex w-full items-start gap-3 rounded-2xl bg-ambre-50 px-4 py-3 text-left"
        @click="fillDemo"
      >
        <FlaskConical class="mt-0.5 h-5 w-5 shrink-0 text-ambre" />
        <span class="text-[14px] leading-5">
          <span class="font-semibold">Mode démo.</span> Touchez ici pour utiliser le compte de test
          <span class="num font-semibold">{{ DEMO_ACCOUNT.telephone }}</span>.
        </span>
      </button>

      <div class="mt-7 space-y-5">
        <AppInput
          v-model="form.telephone"
          label="Téléphone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="07 00 00 00 00"
          enterkeyhint="next"
          :error="err.telephone"
          required
          @blur="form.telephone = formatPhone(form.telephone)"
        />
        <AppInput
          v-model="form.password"
          label="Mot de passe"
          type="password"
          autocomplete="current-password"
          enterkeyhint="go"
          :error="err.password"
          required
          @enter="submit"
        />
      </div>
      <button type="button" class="mt-3 py-1 text-[15px] font-semibold text-bleu-ink" @click="forgot = true">Mot de passe oublié&nbsp;?</button>
      <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
    </form>

    <div class="safe-bottom shrink-0 px-6 pt-3">
      <button type="button" class="btn-primary w-full" :disabled="loading" @click="submit">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
      <p class="py-3 text-center text-[15px] text-asphalte">
        Pas encore de compte&nbsp;?
        <RouterLink :to="{ name: 'register', query: route.query }" replace class="font-semibold text-bleu-ink">Créer un compte</RouterLink>
      </p>
    </div>

    <BottomSheet v-model:open="forgot" title="Mot de passe oublié" description="Le service client MOT réinitialise votre mot de passe après vérification de votre identité.">
      <template #footer>
        <div class="flex flex-col gap-2">
          <a :href="`tel:${BRAND.phone}`" class="btn-primary w-full"><Phone class="h-5 w-5" />Appeler le {{ BRAND.phoneDisplay }}</a>
          <a :href="`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent('Bonjour, j’ai oublié mon mot de passe de l’application MOT.')}`" target="_blank" rel="noopener" class="btn-soft w-full"><MessageCircle class="h-5 w-5" />Écrire sur WhatsApp</a>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>
