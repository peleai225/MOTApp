<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <Toaster
    position="bottom-center"
    rich-colors
    :toast-options="{
      style: {
        background: 'hsl(222 47% 11%)',
        color: 'hsl(40 80% 96%)',
        border: '1px solid hsl(227 26% 20%)'
      }
    }"
  />
</template>
