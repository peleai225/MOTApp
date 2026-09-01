<template>
  <div class="page-container bg-white">
    <PageHeader title="Modifier mon profil" />

    <div class="flex-1 px-6 py-6 flex flex-col gap-5 overflow-y-auto">
      <div class="grid grid-cols-2 gap-3">
        <AppInput v-model="form.nom"    label="Nom"    placeholder="KONÉ"     :error="err.nom" />
        <AppInput v-model="form.prenom" label="Prénom" placeholder="Mamadou"  :error="err.prenom" />
      </div>
      <AppInput v-model="form.email"          label="Email"            type="email" placeholder="mamadou@email.com" />
      <AppInput v-model="form.date_naissance" label="Date de naissance" type="date" />
      <AppInput v-model="form.ville"          label="Ville"            placeholder="Abidjan" />
      <AppInput v-model="form.adresse"        label="Adresse"          placeholder="Cocody, Rue des Jardins" />

      <div class="mt-auto">
        <Button :disabled="loading" @click="save">Enregistrer</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader.vue'
import AppInput   from '@/components/ui/AppInput.vue'
import type { User } from '@/types'

const router  = useRouter()
const auth    = useAuthStore()
const loading = ref(false)

const form = ref<Partial<User>>({ nom: '', prenom: '', email: '', date_naissance: '', ville: '', adresse: '' })
const err  = reactive({ nom: '', prenom: '' })

onMounted(() => {
  const u = auth.user
  if (u) Object.assign(form.value, { nom: u.nom, prenom: u.prenom, email: u.email || '', ville: u.ville || '' })
})

async function save() {
  loading.value = true
  try {
    await authApi.update(form.value)
    await auth.fetchMe()
    toast.success('Profil mis à jour !')
    router.back()
  } catch (e: any) {
    const errs = e.response?.data?.errors || {}
    if (errs.nom)    err.nom    = errs.nom[0]
    if (errs.prenom) err.prenom = errs.prenom[0]
    toast.error('Erreur lors de la mise à jour.')
  } finally {
    loading.value = false
  }
}
</script>
