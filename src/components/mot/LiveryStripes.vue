<script setup lang="ts">
/** Bande reprise du flanc des cars : virgule bleue courbe + diagonale rouge. */
defineProps<{ variant?: 'on-white' | 'on-blue' | 'on-photo' }>()
</script>

<template>
  <svg viewBox="0 0 200 60" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <path
      d="M0 60 C 52 58 96 40 128 0 H 150 C 118 44 72 60 26 60 Z"
      :fill="variant === 'on-blue' ? 'rgba(255,255,255,0.16)' : '#1F3285'"
    />
    <path d="M142 60 L 200 10 V 34 L 172 60 Z" fill="#DB2B1C" />
  </svg>
</template>
