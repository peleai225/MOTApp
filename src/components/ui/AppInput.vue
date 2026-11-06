<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  prefix?: string
  hint?: string
  error?: string
  inputmode?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal' | 'search' | 'none' | 'url'
  autocomplete?: string
  maxlength?: number
  required?: boolean
  disabled?: boolean
  autofocus?: boolean
  enterkeyhint?: 'done' | 'next' | 'go' | 'search' | 'send' | 'enter' | 'previous'
}>(), { type: 'text' })

const emit = defineEmits<{ 'update:modelValue': [string]; enter: []; blur: [] }>()
const id = useId()
const show = ref(false)
const inputType = computed(() => (props.type === 'password' ? (show.value ? 'text' : 'password') : props.type))
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="field-label" :class="error ? 'text-rouge' : ''">
      {{ label }}<span v-if="!required" class="font-normal text-gravier"> (facultatif)</span>
    </label>
    <div
      class="flex h-[54px] items-center overflow-hidden rounded-2xl bg-surface transition-shadow duration-150 focus-within:shadow-field-focus"
      :class="error ? 'shadow-[inset_0_0_0_1.5px_#DB2B1C]' : 'shadow-field'"
    >
      <span v-if="prefix" class="flex h-full shrink-0 items-center border-r border-ligne bg-ciel px-3.5 text-[15px] font-semibold text-asphalte">
        {{ prefix }}
      </span>
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :required="required"
        :disabled="disabled"
        :autofocus="autofocus"
        :enterkeyhint="enterkeyhint"
        :aria-invalid="!!error"
        :aria-describedby="error || hint ? `${id}-msg` : undefined"
        class="h-full min-w-0 flex-1 bg-transparent px-4 text-[16px] font-medium text-encre outline-none placeholder:font-normal placeholder:text-gravier disabled:opacity-60"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown.enter="emit('enter')"
        @blur="emit('blur')"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="flex h-full w-12 shrink-0 items-center justify-center text-asphalte"
        :aria-label="show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="show = !show"
      >
        <EyeOff v-if="show" class="h-5 w-5" />
        <Eye v-else class="h-5 w-5" />
      </button>
    </div>
    <p v-if="error || hint" :id="`${id}-msg`" class="mt-1.5 text-[13px]" :class="error ? 'text-rouge' : 'text-asphalte'">
      {{ error || hint }}
    </p>
  </div>
</template>
