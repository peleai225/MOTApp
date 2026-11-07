<script setup lang="ts">
import { computed } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { BusFront } from 'lucide-vue-next'
import LiveryStripes from './LiveryStripes.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import { fcfa, longDate } from '@/lib/format'
import type { Reservation } from '@/types'

const props = withDefaults(defineProps<{
  ticket: Reservation
  passenger?: string
  notch?: string
  arrival?: string | null
}>(), { notch: 'rgb(var(--c-ciel))' })

const t = computed(() => props.ticket)
const inactive = computed(() => t.value.statut !== 'valide')
const stamp = computed(() => ({ annule: 'Annulé', utilise: 'Utilisé', expire: 'Expiré' } as Record<string, string>)[t.value.statut])

const paiement = computed(() =>
  ({ mobile_money: 'Mobile Money', carte_bancaire: 'Carte', cash: 'Guichet' } as Record<string, string>)[t.value.mode_paiement as string] ?? t.value.mode_paiement,
)
const etatPaiement = computed(() => {
  if (t.value.statut !== 'valide') return null
  if (t.value.statut_paiement === 'paye') return { label: 'Payé', cls: 'bg-vert-50 text-vert' }
  if (t.value.statut_paiement === 'en_attente') return { label: 'À régler au guichet', cls: 'bg-ambre-50 text-ambre' }
  return null
})

const qrValue = computed(() => t.value.qr_code || t.value.reference)
</script>

<template>
  <!-- La couleur des encoches est résolue ici, hors du périmètre « toujours clair » -->
  <article class="relative" :style="{ '--notch-bg': notch }" aria-label="Billet de car">
   <div class="theme-light relative rounded-[26px] bg-surface text-encre shadow-panel">
    <!-- En-tête : trajet -->
    <div class="relative overflow-hidden rounded-t-[26px] bg-bleu px-5 pb-5 pt-4 text-white">
      <LiveryStripes variant="on-blue" class="absolute -right-1 bottom-0 h-[70px] w-[230px]" />
      <div class="relative flex items-center justify-between">
        <span class="rounded-[10px] bg-white px-2 py-1">
          <img src="/images/logo-mot.png" alt="MOT" class="h-[22px] w-auto" />
        </span>
        <span class="text-[13px] font-medium text-white/75">Billet de car</span>
      </div>

      <div class="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div class="min-w-0">
          <p class="num font-display text-[38px] font-semibold leading-none">{{ t.trajet?.heure || '--:--' }}</p>
          <p class="mt-1.5 truncate text-[16px] font-semibold">{{ t.trajet?.origine }}</p>
        </div>
        <div class="mb-[30px] flex w-14 items-center gap-1 text-white/60">
          <span class="h-px flex-1 border-t-2 border-dotted border-white/50" />
          <BusFront class="h-4 w-4 shrink-0" />
        </div>
        <div class="min-w-0 text-right">
          <p class="num font-display text-[38px] font-semibold leading-none" :class="arrival ? '' : 'text-white/50'">{{ arrival || '--:--' }}</p>
          <p class="mt-1.5 truncate text-[16px] font-semibold">{{ t.trajet?.destination }}</p>
        </div>
      </div>
      <p class="relative mt-3 text-[14px] text-white/80 first-letter:uppercase">{{ longDate(t.trajet?.date_depart, true) }}</p>
    </div>

    <div class="perforation bg-surface" aria-hidden="true">
      <span class="notch notch-l" /><span class="notch notch-r" />
    </div>

    <!-- Corps : détails + QR -->
    <div class="px-5 pb-6">
      <dl class="grid grid-cols-3 gap-x-3 gap-y-3.5">
        <div class="col-span-2 min-w-0">
          <dt class="text-[12.5px] text-asphalte">Passager</dt>
          <dd class="truncate text-[15px] font-semibold">{{ passenger || '—' }}</dd>
        </div>
        <div>
          <dt class="text-[12.5px] text-asphalte">{{ t.sieges.length > 1 ? 'Places' : 'Place' }}</dt>
          <dd class="num text-[15px] font-semibold">{{ t.sieges.length ? t.sieges.join(', ') : 'Attribuée' }}</dd>
        </div>
        <div>
          <dt class="text-[12.5px] text-asphalte">Car</dt>
          <dd class="text-[15px] font-semibold">{{ t.bus?.numero || '—' }}</dd>
        </div>
        <div>
          <dt class="text-[12.5px] text-asphalte">Montant</dt>
          <dd class="num text-[15px] font-semibold">{{ fcfa(t.montant_total) }}</dd>
        </div>
        <div>
          <dt class="text-[12.5px] text-asphalte">Paiement</dt>
          <dd class="text-[15px] font-semibold">{{ paiement }}</dd>
        </div>
      </dl>

      <div class="mt-6 flex flex-col items-center">
        <div class="relative rounded-2xl bg-surface p-3 ring-1 ring-ligne">
          <QrcodeVue
            :value="qrValue"
            :size="188"
            level="M"
            render-as="svg"
            foreground="#0D1530"
            :class="inactive ? 'opacity-20' : ''"
          />
          <span
            v-if="stamp"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-lg border-[3px] border-rouge px-3 py-1 font-display text-[28px] font-bold uppercase tracking-wide text-rouge"
          >{{ stamp }}</span>
        </div>
        <p class="num mt-3 font-display text-[19px] font-semibold tracking-[0.06em]">{{ t.reference }}</p>
        <div class="mt-2 flex flex-wrap justify-center gap-2">
          <StatusPill :statut="t.statut" />
          <span v-if="etatPaiement" class="inline-flex items-center rounded-full px-2.5 py-1 text-[12.5px] font-semibold leading-none" :class="etatPaiement.cls">
            {{ etatPaiement.label }}
          </span>
        </div>
      </div>
    </div>
   </div>
  </article>
</template>
