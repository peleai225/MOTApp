import { toast } from 'vue-sonner'
import { Share } from '@capacitor/share'
import { longDate } from './format'
import { isNative } from './native'
import { BRAND } from '@/config'
import type { Reservation } from '@/types'

/** Feuille de partage du système (WhatsApp, SMS…), ou copie dans le presse-papiers à défaut. */
export async function shareText(title: string, text: string, url?: string) {
  try {
    if (isNative) {
      await Share.share({ title, text: url ? `${text}\n${url}` : text, dialogTitle: title })
    } else if (navigator.share) {
      await navigator.share({ title, text, ...(url ? { url } : {}) })
    } else {
      await navigator.clipboard.writeText(url ? `${text}\n${url}` : text)
      toast.success('Copié dans le presse-papiers')
    }
  } catch { /* partage annulé par l'utilisateur */ }
}

export function shareTicket(t: Reservation) {
  const places = t.sieges?.length ? `Places ${t.sieges.join(', ')}` : `${t.nombre_places} place(s)`
  const text = [
    `Billet MOT ${t.reference}`,
    `${t.trajet?.origine} – ${t.trajet?.destination}`,
    `${longDate(t.trajet?.date_depart, true)} à ${t.trajet?.heure}`,
    places,
  ].join('\n')
  return shareText(`Billet MOT ${t.reference}`, text)
}

/** Lien partageable : l'adresse locale de l'app native n'a pas de sens hors du téléphone */
export function shareableUrl() {
  return isNative ? BRAND.website : location.href
}
