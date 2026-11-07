import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { isNative } from './native'

/** Vibration du navigateur (Android). Silencieuse là où l'API n'existe pas. */
function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch { /* ignoré */ }
}

/** Retour haptique : moteur natif dans l'app (Android et iPhone), vibration courte sur le web */
export const haptic = {
  tap: () => (isNative ? Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}) : vibrate(8)),
  select: () => (isNative ? Haptics.selectionChanged().catch(() => {}) : vibrate(12)),
  success: () => (isNative ? Haptics.notification({ type: NotificationType.Success }).catch(() => {}) : vibrate([12, 60, 24])),
  warning: () => (isNative ? Haptics.notification({ type: NotificationType.Warning }).catch(() => {}) : vibrate([30, 40, 30])),
}
