<script setup lang="ts">
import { RouterView } from 'vue-router'
import TabBar from '@/components/layout/TabBar.vue'
</script>

<template>
  <div class="view">
    <RouterView v-slot="{ Component, route }">
      <Transition name="tab">
        <KeepAlive>
          <component :is="Component" :key="String(route.name)" />
        </KeepAlive>
      </Transition>
    </RouterView>
    <TabBar />
  </div>
</template>
