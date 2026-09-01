<script setup lang="ts">
import type { AvatarFallbackProps } from "reka-ui"
import { AvatarFallback } from "reka-ui"

interface Props extends /* @vue-ignore */ AvatarFallbackProps {}
const props = defineProps<Props>()
</script>

<template>
  <AvatarFallback v-bind="props">
    <slot />
  </AvatarFallback>
</template>
