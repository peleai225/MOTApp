import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'

/** Vrai dans l'application Android / iOS (Capacitor), faux dans le navigateur */
export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() as 'android' | 'ios' | 'web'

/** Couleur des icônes de la barre d'état selon le fond de l'écran */
export function setSystemBars(lightBackground: boolean) {
  if (!isNative) return
  SystemBars.setStyle({ style: lightBackground ? SystemBarsStyle.Light : SystemBarsStyle.Dark }).catch(() => {})
}

// ── Pile des surcouches (feuilles du bas) : le bouton retour Android les ferme d'abord ──
const overlays: (() => void)[] = []

export function registerOverlay(close: () => void) {
  overlays.push(close)
  return () => {
    const i = overlays.lastIndexOf(close)
    if (i >= 0) overlays.splice(i, 1)
  }
}

export function closeTopOverlay(): boolean {
  const close = overlays.pop()
  if (!close) return false
  close()
  return true
}

/** Dans l'app native, les liens externes (WhatsApp, téléphone, site) s'ouvrent dans l'app adaptée */
export function routeExternalLinks() {
  if (!isNative) return
  document.addEventListener('click', e => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a) return
    const href = a.getAttribute('href') || ''
    const external = /^(tel:|mailto:|sms:)/.test(href) || (/^https?:/.test(href) && new URL(href).host !== location.host)
    if (!external) return
    e.preventDefault()
    window.location.href = href
  }, true)
}
