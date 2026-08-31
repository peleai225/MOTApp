<template>
  <div class="page-white flex flex-col">
    <!-- Header Nuit -->
    <div class="bg-nuit px-6 pt-safe pb-8">
      <button @click="router.back()" class="mt-4 mb-6 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="font-display text-2xl font-bold text-white">Connexion</h1>
      <p class="font-sans text-sm text-white/50 mt-1">Bon retour parmi nous.</p>
    </div>

    <!-- Formulaire -->
    <div class="flex-1 px-6 py-8 flex flex-col gap-5">
      <AppInput
        v-model="form.telephone"
        label="Numéro de téléphone"
        type="tel"
        placeholder="+225 07 00 00 00 00"
        :error="errors.telephone"
        required
      />
      <div>
        <AppInput
          v-model="form.password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />
        <div class="flex justify-end mt-2">
          <button class="font-sans text-xs text-voyage">Mot de passe oublié ?</button>
        </div>
      </div>
    </div>

    <!-- CTA fixe en bas -->
    <div class="px-6 pb-10 pt-4 flex flex-col gap-4 border-t border-slate-100">
      <AppButton :loading="loading" @click="submit">Se connecter</AppButton>
      <p class="text-center font-sans text-sm text-pierre">
        Pas de compte ?
        <router-link to="/register" class="text-route font-semibold"> Créer un compte</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast }     from '@/composables/useToast'
import AppInput   from '@/components/ui/AppInput.vue'
import AppButton  from '@/components/ui/AppButton.vue'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()
const toast  = useToast()

const loading = ref(false)
const form    = reactive({ telephone: '', password: '' })
const errors  = reactive({ telephone: '', password: '' })

async function submit() {
  errors.telephone = ''; errors.password = ''
  if (!form.telephone) { errors.telephone = 'Numéro obligatoire'; return }
  if (!form.password)  { errors.password  = 'Mot de passe obligatoire'; return }
  loading.value = true
  try {
    await auth.login(form)
    router.push(route.query.redirect || '/')
  } catch (e) {
    toast.error(e.response?.data?.errors?.telephone?.[0] || 'Téléphone ou mot de passe incorrect.')
  } finally {
    loading.value = false
  }
}
</script>
