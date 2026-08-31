<template>
  <div class="page-container bg-white">
    <PageHeader :title="`Créer un compte`" :subtitle="`Étape ${step}/2`" />

    <!-- Étape 1 : Identité -->
    <div v-if="step === 1" class="flex-1 px-6 py-8 flex flex-col gap-5">
      <p class="text-lg font-semibold text-neutral-900">Comment t'appelles-tu ?</p>

      <div class="grid grid-cols-2 gap-3">
        <AppInput v-model="form.nom"    label="Nom"    placeholder="KONÉ" required :error="err.nom" />
        <AppInput v-model="form.prenom" label="Prénom" placeholder="Mamadou" required :error="err.prenom" />
      </div>
      <AppInput v-model="form.telephone" label="Téléphone" type="tel" placeholder="+225 07 00 00 00 00" prefix="📱" required :error="err.telephone" />
      <AppInput v-model="form.email"     label="Email" type="email" placeholder="mamadou@email.com" prefix="✉" />

      <div class="mt-auto">
        <Button class="w-full" @click="nextStep">Continuer →</Button>
      </div>
    </div>

    <!-- Étape 2 : Mot de passe -->
    <div v-else class="flex-1 px-6 py-8 flex flex-col gap-5">
      <p class="text-lg font-semibold text-neutral-900">Choisis un mot de passe sécurisé</p>

      <AppInput v-model="form.password"              label="Mot de passe" type="password" prefix="🔒" required :error="err.password" />

      <!-- Indicateur force -->
      <div class="flex gap-1 -mt-3">
        <div v-for="i in 4" :key="i" class="h-1.5 flex-1 rounded-full transition-colors duration-300" :class="strengthColor(i)" />
      </div>
      <p class="text-xs text-slate-400 -mt-3">{{ strengthLabel }}</p>

      <AppInput v-model="form.password_confirmation" label="Confirmer" type="password" prefix="🔒" required :error="err.password_confirmation" />

      <p class="text-xs text-slate-400">
        En créant un compte, tu acceptes nos <span class="text-primary">conditions d'utilisation</span>.
      </p>

      <div class="mt-auto">
        <Button class="w-full" :loading="loading" @click="submit">Créer mon compte</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/layout/PageHeader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { Button } from '@/components/ui/button'

const router  = useRouter()
const auth    = useAuthStore()
const step    = ref<1 | 2>(1)
const loading = ref(false)

const form = reactive({ nom: '', prenom: '', telephone: '', email: '', password: '', password_confirmation: '' })
const err  = reactive({ nom: '', prenom: '', telephone: '', password: '', password_confirmation: '' })

const strength = computed(() => {
  const p = form.password
  let s = 0
  if (p.length >= 6)  s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
})
const strengthLabel = computed(() => ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength.value] || '')
function strengthColor(i) {
  if (i > strength.value) return 'bg-slate-200'
  return ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength.value]
}

function nextStep() {
  err.nom = ''; err.prenom = ''; err.telephone = ''
  if (!form.nom)       { err.nom = 'Obligatoire'; return }
  if (!form.prenom)    { err.prenom = 'Obligatoire'; return }
  if (!form.telephone) { err.telephone = 'Obligatoire'; return }
  step.value = 2
}

async function submit() {
  err.password = ''; err.password_confirmation = ''
  if (form.password.length < 6)               { err.password = 'Minimum 6 caractères'; return }
  if (form.password !== form.password_confirmation) { err.password_confirmation = 'Les mots de passe ne correspondent pas'; return }

  loading.value = true
  try {
    const data = await auth.register(form)
    toast.success(`Bienvenue ${data.client.prenom} !`)
    router.push('/')
  } catch (e) {
    const errs = e.response?.data?.errors || {}
    if (errs.telephone) { err.telephone = errs.telephone[0]; step.value = 1 }
    else toast.error(e.response?.data?.message || 'Erreur lors de la création du compte.')
  } finally {
    loading.value = false
  }
}
</script>
