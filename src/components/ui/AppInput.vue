<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-2xs font-semibold text-pierre uppercase tracking-widest">
      {{ label }}<span v-if="required" class="text-route ml-0.5">*</span>
    </label>

    <div class="relative">
      <span v-if="prefix" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-pierre">
        <component :is="prefix" v-if="typeof prefix !== 'string'" class="w-4 h-4" />
        <span v-else class="text-base">{{ prefix }}</span>
      </span>
      <input
        :id="id"
        v-bind="$attrs"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field"
        :class="[prefix ? 'pl-10' : '', error ? '!border-red-400 !ring-red-100' : '']"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-3.5 top-1/2 -translate-y-1/2 text-pierre hover:text-encre"
        @click="showPwd = !showPwd"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <template v-if="showPwd">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          </template>
          <template v-else>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </template>
        </svg>
      </button>
    </div>

    <p v-if="error" class="text-xs text-red-500 mt-0.5">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue:  String,
  label:       String,
  placeholder: String,
  type:        { type: String, default: 'text' },
  prefix:      [String, Object],
  error:       String,
  required:    Boolean,
  disabled:    Boolean,
})
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const showPwd  = ref(false)
const id       = `inp-${Math.random().toString(36).slice(2, 7)}`
const inputType = computed(() => props.type === 'password' ? (showPwd.value ? 'text' : 'password') : props.type)
</script>
