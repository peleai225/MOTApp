<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { CalendarDays } from 'lucide-vue-next'
import { addDays, isoDate, parseDate } from '@/lib/format'
import { haptic } from '@/lib/haptics'

const props = withDefaults(defineProps<{ modelValue: string; days?: number; dense?: boolean }>(), { days: 21 })
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const strip = ref<HTMLElement | null>(null)
const t = isoDate()

const items = computed(() => {
  const list = Array.from({ length: props.days }, (_, i) => addDays(t, i))
  if (props.modelValue && !list.includes(props.modelValue) && props.modelValue > t) list.push(props.modelValue)
  return list.map(iso => {
    const d = parseDate(iso)
    return {
      iso,
      top: iso === t ? 'Auj.' : iso === addDays(t, 1) ? 'Dem.' : d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }),
      label: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
    }
  })
})

function pick(iso: string) {
  if (iso === props.modelValue) return
  haptic.select()
  emit('update:modelValue', iso)
}

function onCustom(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (v && v >= t) pick(v)
}

async function center(smooth = true) {
  await nextTick()
  const node = strip.value?.querySelector<HTMLElement>('[aria-pressed="true"]')
  node?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'center', block: 'nearest' })
}
onMounted(() => center(false))
watch(() => props.modelValue, () => center())
</script>

<template>
  <div ref="strip" class="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-0.5" role="group" aria-label="Date du voyage">
    <button
      v-for="it in items"
      :key="it.iso"
      type="button"
      class="tap flex shrink-0 flex-col items-center justify-center rounded-2xl"
      :class="[
        dense ? 'h-[58px] w-[50px]' : 'h-[66px] w-[54px]',
        it.iso === modelValue ? 'bg-bleu text-white shadow-cta' : 'bg-ciel text-encre',
      ]"
      :aria-pressed="it.iso === modelValue"
      :aria-label="it.label"
      @click="pick(it.iso)"
    >
      <span class="text-[11.5px] font-medium capitalize leading-none" :class="it.iso === modelValue ? 'text-white/80' : 'text-asphalte'">{{ it.top }}</span>
      <span class="num mt-1 font-display text-[22px] font-semibold leading-none">{{ it.day }}</span>
      <span v-if="!dense" class="mt-0.5 text-[10.5px] leading-none" :class="it.iso === modelValue ? 'text-white/70' : 'text-gravier'">{{ it.month }}</span>
    </button>
    <label
      class="tap relative flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-ciel text-bleu-ink"
      :class="dense ? 'h-[58px] w-[58px]' : 'h-[66px] w-[62px]'"
    >
      <CalendarDays class="h-5 w-5" />
      <span class="text-[11px] font-semibold leading-none">Autre</span>
      <input
        type="date"
        :min="t"
        :value="modelValue"
        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Choisir une autre date"
        @change="onCustom"
      />
    </label>
  </div>
</template>
