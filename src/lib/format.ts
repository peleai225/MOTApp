const nf = new Intl.NumberFormat('fr-FR')

/** 8000 → "8 000 FCFA" */
export function fcfa(n: number | null | undefined, withUnit = true): string {
  const v = nf.format(Math.round(Number(n) || 0))
  return withUnit ? `${v} FCFA` : v
}

/** Date locale au format YYYY-MM-DD (sans décalage UTC) */
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

export function addDays(iso: string, n: number): string {
  const d = parseDate(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export const today = () => isoDate()

/** "Aujourd'hui", "Demain" ou "ven. 6 nov." */
export function dayLabel(iso?: string | null): string {
  if (!iso) return ''
  const t = today()
  if (iso === t) return "Aujourd'hui"
  if (iso === addDays(t, 1)) return 'Demain'
  return parseDate(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** "mercredi 4 novembre" (+ année si différente) */
export function longDate(iso?: string | null, withYear = false): string {
  if (!iso) return ''
  const d = parseDate(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
    ...(withYear || !sameYear ? { year: 'numeric' } : {}),
  })
}

export function shortDate(iso?: string | null): string {
  if (!iso) return ''
  return parseDate(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/** 450 → "7 h 30", 45 → "45 min" */
export function duration(min?: number | null): string {
  if (!min || min <= 0) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

export function toMinutes(hhmm: string): number {
  const [h, m] = (hhmm || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function fromMinutes(total: number): string {
  const t = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/** Heure d'arrivée : celle de l'API, sinon départ + durée */
export function arrivalTime(dep: string, arr?: string | null, dureeMin?: number | null): string | null {
  if (arr) return arr
  if (dureeMin) return fromMinutes(toMinutes(dep) + dureeMin)
  return null
}

/** Arrivée le lendemain ? */
export function arrivesNextDay(dep: string, dureeMin?: number | null): boolean {
  return !!dureeMin && toMinutes(dep) + dureeMin >= 1440
}

export type Period = 'matin' | 'apres-midi' | 'soir'
export function period(hhmm: string): Period {
  const h = Math.floor(toMinutes(hhmm) / 60)
  if (h < 12) return 'matin'
  if (h < 18) return 'apres-midi'
  return 'soir'
}
export const PERIOD_LABEL: Record<Period, string> = { matin: 'Matin', 'apres-midi': 'Après-midi', soir: 'Soir et nuit' }

/** Minutes restantes avant un départ (négatif si passé) */
export function minutesUntil(dateIso: string, hhmm: string): number {
  const d = parseDate(dateIso)
  d.setMinutes(toMinutes(hhmm))
  return Math.round((d.getTime() - Date.now()) / 60000)
}

/** "0707070707" → "07 07 07 07 07" */
export function formatPhone(raw?: string | null): string {
  if (!raw) return ''
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

/** Garde chiffres et "+" initial — format envoyé à l'API */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/\D/g, '')
}

export function initials(prenom?: string, nom?: string): string {
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase() || '?'
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n > 1 ? many : one}`
}

export function relativeTime(ts: number): string {
  const diff = Math.round((Date.now() - ts) / 60000)
  if (diff < 1) return "à l'instant"
  if (diff < 60) return `il y a ${diff} min`
  const h = Math.round(diff / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.round(h / 24)} j`
}
