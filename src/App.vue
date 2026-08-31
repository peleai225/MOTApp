<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Sonner from '@/components/ui/sonner/Sonner.vue'

const route = useRoute()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <Sonner />
</template>
