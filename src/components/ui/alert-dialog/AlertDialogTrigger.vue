<script setup lang="ts">
import type { AlertDialogTriggerProps } from "reka-ui"
import { AlertDialogTrigger } from "reka-ui"

interface Props extends /* @vue-ignore */ AlertDialogTriggerProps {}
const props = defineProps<Props>()
</script>

<template>
  <AlertDialogTrigger v-bind="props">
    <slot />
  </AlertDialogTrigger>
</template>
