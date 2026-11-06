<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AppBar from '@/components/layout/AppBar.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, fieldErrors } from '@/api'
import { formatPhone } from '@/lib/format'
import { haptic } from '@/lib/haptics'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const step = ref<1 | 2>(1)
const loading = ref(false)
const form = reactive({ prenom: '', nom: '', telephone: '', email: '', password: '', password_confirmation: '' })
const err = reactive<Record<string, string>>({})

function clearErr() { Object.keys(err).forEach(k => delete err[k]) }

const strength = computed(() => {
  const p = form.password
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p) && /[^a-zA-Z0-9]/.test(p)) s++
  return s
})
const strengthLabel = computed(() => ['Trop court', 'Faible', 'Correct', 'Solide', 'Très solide'][strength.value])
const strengthColor = computed(() => ['bg-rouge', 'bg-rouge', 'bg-ambre', 'bg-vert', 'bg-vert'][strength.value])

function toStep2() {
  clearErr()
  if (!form.prenom.trim()) err.prenom = 'Indiquez votre prénom.'
  if (!form.nom.trim()) err.nom = 'Indiquez votre nom.'
  if (form.telephone.replace(/\D/g, '').length < 8) err.telephone = 'Entrez un numéro de téléphone valide.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Cette adresse e-mail n’est pas valide.'
  if (Object.keys(err).length) { haptic.warning(); return }
  haptic.tap()
  step.value = 2
}

async function submit() {
  clearErr()
  if (form.password.length < 6) err.password = 'Au moins 6 caractères.'
  else if (form.password !== form.password_confirmation) err.password_confirmation = 'Les deux mots de passe sont différents.'
  if (Object.keys(err).length) { haptic.warning(); return }

  loading.value = true
  try {
    const client = await auth.register({ ...form, prenom: form.prenom.trim(), nom: form.nom.trim(), email: form.email.trim() })
    haptic.success()
    toast.success(`Bienvenue ${client.prenom}, votre compte est prêt`)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (e) {
    Object.assign(err, fieldErrors(e))
    haptic.warning()
    if (err.telephone || err.nom || err.prenom || err.email) step.value = 1
    else if (!Object.keys(err).length) toast.error(errorMessage(e))
  } finally {
    loading.value = false
  }
}

function back() {
  if (step.value === 2) step.value = 1
  else if (window.history.state?.back) router.back()
  else router.replace('/bienvenue')
}
</script>

<template>
  <div class="view bg-surface">
    <AppBar :back-action="back">
      <div class="flex gap-1.5 px-6 pb-2" aria-hidden="true">
        <span class="h-1 flex-1 rounded-full bg-bleu" />
        <span class="h-1 flex-1 rounded-full transition-colors duration-300" :class="step === 2 ? 'bg-bleu' : 'bg-ligne'" />
      </div>
    </AppBar>

    <Transition :name="step === 2 ? 'push' : 'pop'" mode="out-in">
      <form v-if="step === 1" key="1" class="view-scroll px-6 pb-6 pt-2" novalidate @submit.prevent="toStep2">
        <p class="text-[14px] font-semibold text-bleu-ink">Étape 1 sur 2</p>
        <h1 class="mt-1 font-display text-[38px] font-semibold leading-none">Vos coordonnées</h1>
        <div class="mt-7 space-y-5">
          <div class="grid grid-cols-2 gap-3">
            <AppInput v-model="form.prenom" label="Prénom" autocomplete="given-name" placeholder="Awa" :error="err.prenom" required />
            <AppInput v-model="form.nom" label="Nom" autocomplete="family-name" placeholder="Kouassi" :error="err.nom" required />
          </div>
          <AppInput
            v-model="form.telephone"
            label="Téléphone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="07 00 00 00 00"
            hint="Il vous servira à vous connecter."
            :error="err.telephone"
            required
            @blur="form.telephone = formatPhone(form.telephone)"
          />
          <AppInput v-model="form.email" label="E-mail" type="email" inputmode="email" autocomplete="email" placeholder="nom@exemple.ci" :error="err.email" />
        </div>
        <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
      </form>

      <form v-else key="2" class="view-scroll px-6 pb-6 pt-2" novalidate @submit.prevent="submit">
        <p class="text-[14px] font-semibold text-bleu-ink">Étape 2 sur 2</p>
        <h1 class="mt-1 font-display text-[38px] font-semibold leading-none">Votre mot de passe</h1>
        <div class="mt-7 space-y-5">
          <div>
            <AppInput v-model="form.password" label="Mot de passe" type="password" autocomplete="new-password" :error="err.password" required />
            <div class="mt-2.5 flex gap-1.5" aria-hidden="true">
              <span v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" :class="i <= strength ? strengthColor : 'bg-ligne'" />
            </div>
            <p v-if="form.password" class="mt-1.5 text-[13px] text-asphalte">{{ strengthLabel }}</p>
          </div>
          <AppInput v-model="form.password_confirmation" label="Confirmez le mot de passe" type="password" autocomplete="new-password" :error="err.password_confirmation" required @enter="submit" />
        </div>
        <p class="mt-6 text-[13px] leading-[19px] text-asphalte">
          En créant un compte, vous acceptez les conditions de transport de Mohamed Ouattara Transport.
        </p>
        <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
      </form>
    </Transition>

    <div class="safe-bottom shrink-0 px-6 pt-3">
      <button v-if="step === 1" type="button" class="btn-primary w-full" @click="toStep2">Continuer</button>
      <button v-else type="button" class="btn-primary w-full" :disabled="loading" @click="submit">
        {{ loading ? 'Création du compte…' : 'Créer mon compte' }}
      </button>
      <p class="py-3 text-center text-[15px] text-asphalte">
        Déjà inscrit&nbsp;?
        <RouterLink :to="{ name: 'login', query: route.query }" replace class="font-semibold text-bleu-ink">Se connecter</RouterLink>
      </p>
    </div>
  </div>
</template>
