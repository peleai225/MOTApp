import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useOnline } from '@vueuse/core'
import { isNative } from '@/lib/native'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** État « système » : connexion, installation, mise à jour. */
export const useAppStore = defineStore('app', () => {
  const online = useOnline()
  const installEvent = ref<BeforeInstallPromptEvent | null>(null)
  const standalone = ref(
    isNative ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true,
  )
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const canInstall = computed(() => !standalone.value && (!!installEvent.value || isIOS))

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    installEvent.value = e as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installEvent.value = null
    standalone.value = true
  })

  async function install(): Promise<'accepted' | 'dismissed' | 'ios'> {
    if (!installEvent.value) return 'ios'
    await installEvent.value.prompt()
    const { outcome } = await installEvent.value.userChoice
    installEvent.value = null
    return outcome
  }

  return { online, standalone, isIOS, canInstall, install }
})
