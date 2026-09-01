<script setup lang="ts">
import type { DialogDescriptionProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogDescription } from "reka-ui"
import { cn } from "@/lib/utils"

interface Props extends /* @vue-ignore */ DialogDescriptionProps {
  class?: HTMLAttributes["class"]
}
const props = defineProps<Props>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DialogDescription
    :class="cn('text-sm text-muted-foreground', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogDescription>
</template>
