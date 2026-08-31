<template>
  <div class="page-dark flex flex-col">
    <!-- Logo section -->
    <div class="flex-1 flex flex-col items-center justify-center px-8 pt-safe">
      <!-- Logo -->
      <div class="mb-8 flex flex-col items-center gap-4">
        <div class="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        </div>
        <div class="text-center">
          <h1 class="font-display text-3xl font-bold text-white tracking-tight">MoT Transport</h1>
          <p class="font-sans text-sm text-white/50 mt-1.5 tracking-wide">Billets de bus · Côte d'Ivoire</p>
        </div>
      </div>

      <!-- Tagline -->
      <p class="font-sans text-center text-white/40 text-sm leading-relaxed max-w-xs">
        Réservez votre prochain voyage sans vous déplacer à la gare.
      </p>
    </div>

    <!-- Actions -->
    <div class="px-6 pb-12 pt-8 flex flex-col gap-3">
      <AppButton @click="router.push('/login')">
        Se connecter
      </AppButton>

      <AppButton variant="outline-white" @click="router.push('/register')">
        Créer un compte
      </AppButton>

      <!-- Séparateur -->
      <div class="flex items-center gap-3 my-1">
        <div class="flex-1 h-px bg-white/10" />
        <span class="font-sans text-xs text-white/30">ou</span>
        <div class="flex-1 h-px bg-white/10" />
      </div>

      <button
        class="font-sans text-sm text-soleil font-medium text-center py-1 active:opacity-70 transition-opacity"
        @click="router.push('/')"
      >
        Continuer sans compte →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
const router = useRouter()
</script>
