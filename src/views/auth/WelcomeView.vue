<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BRAND } from '@/config'

const router = useRouter()
</script>

<template>
  <div class="view bg-surface">
    <div class="relative h-[54%] min-h-[300px] shrink-0 overflow-hidden bg-[#2F6BD0]">
      <img
        src="/images/bus-720.jpg"
        srcset="/images/bus-720.jpg 720w, /images/bus-1280.jpg 1280w"
        sizes="(min-width: 430px) 430px, 100vw"
        alt="Car MOT aux couleurs de la compagnie"
        class="absolute inset-0 h-full w-full scale-[1.3] object-cover object-[36%_64%]"
        fetchpriority="high"
      />
      <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-surface" />
      <div class="absolute left-0 top-0 px-4" :style="{ paddingTop: 'calc(var(--safe-top) + 12px)' }">
        <span class="inline-block rounded-[12px] bg-white px-2.5 py-1.5 shadow-lift">
          <img src="/images/logo-mot.png" alt="MOT" class="h-7 w-auto" />
        </span>
      </div>
    </div>

    <div class="relative -mt-4 flex min-h-0 flex-1 flex-col px-6">
      <h1 class="font-display text-[40px] font-semibold leading-[1.0]">Réservez votre car en quelques secondes</h1>
      <p class="mt-3 text-[16px] leading-[24px] text-asphalte">
        Yopougon, Bondoukou, Kumasi et toutes les lignes {{ BRAND.name }}. {{ BRAND.tagline }}.
      </p>

      <div class="safe-bottom mt-auto flex flex-col gap-2 pt-6">
        <button type="button" class="btn-primary w-full" @click="router.push({ name: 'register' })">Créer un compte</button>
        <button type="button" class="btn-secondary w-full" @click="router.push({ name: 'login' })">J’ai déjà un compte</button>
        <button type="button" class="btn-ghost w-full" @click="router.replace({ name: 'home' })">Continuer sans compte</button>
      </div>
    </div>
  </div>
</template>
