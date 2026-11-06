<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, MapPin, Search, X } from 'lucide-vue-next'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useSearchStore } from '@/stores/search'
import { haptic } from '@/lib/haptics'
import type { Gare } from '@/types'

const props = defineProps<{ open: boolean; title: string; selected?: number | null; exclude?: number | null }>()
const emit = defineEmits<{ 'update:open': [boolean]; select: [Gare] }>()

const search = useSearchStore()
const query = ref('')
watch(() => props.open, v => { if (v) query.value = '' })

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Sous-titre utile : la ville quand elle diffère du nom de la gare (ex. Yopougon, Abidjan) */
function subtitle(g: Gare) {
  if (g.id === props.exclude) return 'Déjà choisie pour l’autre étape'
  if (g.ville && norm(g.ville) !== norm(g.nom)) return g.ville
  return g.code ? `Gare ${g.code}` : ''
}

const list = computed(() => {
  const q = norm(query.value.trim())
  return [...search.gares]
    .filter(g => !q || norm(g.nom).includes(q) || norm(g.ville || '').includes(q) || norm(g.code || '').includes(q))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
})

function pick(g: Gare) {
  if (g.id === props.exclude) return
  haptic.select()
  emit('select', g)
  emit('update:open', false)
}
</script>

<template>
  <BottomSheet :open="open" :title="title" tall @update:open="emit('update:open', $event)">
    <div class="sticky top-0 z-10 -mx-5 bg-surface px-5 pb-2">
      <div class="flex h-12 items-center gap-2 rounded-2xl bg-ciel px-3.5">
        <Search class="h-5 w-5 shrink-0 text-asphalte" />
        <input
          v-model="query"
          type="search"
          inputmode="search"
          enterkeyhint="search"
          placeholder="Ville ou gare"
          class="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-gravier"
          aria-label="Rechercher une ville ou une gare"
        />
        <button v-if="query" type="button" class="text-asphalte" aria-label="Effacer" @click="query = ''">
          <X class="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>

    <div v-if="!search.gares.length && !search.garesLoaded && !search.garesError" class="space-y-3 py-2">
      <div v-for="i in 6" :key="i" class="skeleton h-12" />
    </div>

    <p v-else-if="!search.gares.length" class="px-4 py-10 text-center text-[15px] leading-[22px] text-asphalte">
      {{ search.garesError ? 'Impossible de charger les gares. Vérifiez votre connexion puis réessayez.' : 'Aucune gare n’est encore ouverte à la réservation en ligne.' }}
    </p>

    <p v-else-if="!list.length" class="py-10 text-center text-[15px] text-asphalte">
      Aucune gare ne correspond à « {{ query }} ».
    </p>

    <div v-else class="pb-2 pt-1">
      <button
        v-for="g in list"
        :key="g.id"
        type="button"
        class="tap-row -mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-2xl px-2 py-2.5 text-left disabled:opacity-40"
        :disabled="g.id === exclude"
        @click="pick(g)"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          :class="g.id === selected ? 'bg-bleu text-white' : 'bg-bleu-50 text-bleu-ink'"
        >
          <MapPin class="h-5 w-5" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[16px] font-semibold">{{ g.nom }}</span>
          <span v-if="subtitle(g)" class="block truncate text-[13px] text-asphalte">{{ subtitle(g) }}</span>
        </span>
        <Check v-if="g.id === selected" class="h-5 w-5 text-bleu-ink" :stroke-width="2.6" />
      </button>
    </div>
  </BottomSheet>
</template>
