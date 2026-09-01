<script setup lang="ts">
import type { AvatarImageProps } from "reka-ui"
import { AvatarImage } from "reka-ui"

interface Props extends /* @vue-ignore */ AvatarImageProps {}
const props = defineProps<Props>()
</script>

<template>
  <AvatarImage v-bind="props" class="h-full w-full object-cover">
    <slot />
  </AvatarImage>
</template>
