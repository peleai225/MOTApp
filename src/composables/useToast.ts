import { ref } from 'vue'

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string; duration: number }

const toasts = ref<Toast[]>([])
let nextId = 0

function add(type: Toast['type'], message: string, duration = 3000) {
  const id = nextId++
  toasts.value.push({ id, type, message, duration })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, duration)
}

export function useToast() {
  return {
    toasts,
    success: (m: string, d?: number) => add('success', m, d),
    error: (m: string, d?: number) => add('error', m, d),
    info: (m: string, d?: number) => add('info', m, d)
  }
}
