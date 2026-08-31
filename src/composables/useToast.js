import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return {
    toasts,
    success: msg => show(msg, 'success'),
    error:   msg => show(msg, 'error'),
    info:    msg => show(msg, 'info'),
  }
}
