<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Lock } from 'lucide-vue-next'
import AppBar from '@/components/layout/AppBar.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, fieldErrors } from '@/api'
import { formatPhone } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import type { ProfilePayload } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const saving = ref(false)

const u = auth.user
const form = reactive({
  prenom: u?.prenom || '',
  nom: u?.nom || '',
  email: u?.email || '',
  date_naissance: u?.date_naissance || '',
  ville: u?.ville || '',
  adresse: u?.adresse || '',
})
const err = reactive<Record<string, string>>({})

async function save() {
  Object.keys(err).forEach(k => delete err[k])
  if (!form.prenom.trim()) err.prenom = 'Indiquez votre prénom.'
  if (!form.nom.trim()) err.nom = 'Indiquez votre nom.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Cette adresse e-mail n’est pas valide.'
  if (Object.keys(err).length) { haptic.warning(); return }

  // L'API refuse les champs vides : on n'envoie que ce qui est renseigné
  const payload = Object.fromEntries(
    Object.entries(form).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v),
  ) as ProfilePayload

  saving.value = true
  try {
    await auth.updateProfile(payload)
    haptic.success()
    toast.success('Informations enregistrées')
    router.back()
  } catch (e) {
    Object.assign(err, fieldErrors(e))
    haptic.warning()
    if (!Object.keys(err).length) toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="view bg-surface">
    <AppBar title="Mes informations" back-to="/profil" />

    <form class="view-scroll space-y-5 px-5 pb-8 pt-3" novalidate @submit.prevent="save">
      <div class="grid grid-cols-2 gap-3">
        <AppInput v-model="form.prenom" label="Prénom" autocomplete="given-name" :error="err.prenom" required />
        <AppInput v-model="form.nom" label="Nom" autocomplete="family-name" :error="err.nom" required />
      </div>

      <div>
        <p class="field-label">Téléphone</p>
        <div class="flex h-[54px] items-center gap-3 rounded-2xl bg-ciel px-4">
          <span class="num flex-1 text-[16px] font-medium text-asphalte">{{ formatPhone(u?.telephone) }}</span>
          <Lock class="h-4 w-4 text-gravier" />
        </div>
        <p class="mt-1.5 text-[13px] text-asphalte">Pour changer de numéro, contactez le service client.</p>
      </div>

      <AppInput v-model="form.email" label="E-mail" type="email" inputmode="email" autocomplete="email" placeholder="nom@exemple.ci" :error="err.email" />
      <AppInput v-model="form.date_naissance" label="Date de naissance" type="date" autocomplete="bday" :error="err.date_naissance" :maxlength="10" />
      <AppInput v-model="form.ville" label="Ville" autocomplete="address-level2" placeholder="Abidjan" :error="err.ville" />
      <AppInput v-model="form.adresse" label="Adresse" autocomplete="street-address" placeholder="Quartier, rue" :error="err.adresse" />
      <button type="submit" class="hidden" aria-hidden="true" tabindex="-1" />
    </form>

    <div class="safe-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
      <button type="button" class="btn-primary w-full" :disabled="saving" @click="save">
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
      </button>
    </div>
  </div>
</template>
