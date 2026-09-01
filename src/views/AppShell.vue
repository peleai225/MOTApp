<template>
  <div class="page-container pb-20">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import TabBar from '@/components/layout/TabBar.vue'
</script>
