<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>

  <AppToast />
</template>

<script setup>
import AppToast from '@/components/ui/AppToast.vue'
</script>
