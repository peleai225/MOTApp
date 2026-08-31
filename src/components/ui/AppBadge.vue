<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-2xs font-semibold tracking-wider uppercase"
    :class="styles[status] || styles.default"
  >
    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="dots[status]" />
    {{ labels[status] || status }}
  </span>
</template>

<script setup>
defineProps({ status: { type: String, required: true } })

const styles = {
  valide:  'bg-green-100 text-green-800',
  utilise: 'bg-slate-100 text-pierre',
  annule:  'bg-red-100 text-red-700',
  expire:  'bg-yellow-100 text-yellow-800',
  default: 'bg-slate-100 text-pierre',
}
const dots = {
  valide:  'bg-green-500',
  utilise: 'bg-slate-400',
  annule:  'bg-red-500',
  expire:  'bg-yellow-500',
  default: 'bg-slate-400',
}
const labels = {
  valide:  'Valide',
  utilise: 'Utilisé',
  annule:  'Annulé',
  expire:  'Expiré',
}
</script>
