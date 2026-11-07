import { ref, watch } from 'vue'
import { setSystemBars } from './native'

export type ThemePref = 'system' | 'light' | 'dark'

const KEY = 'mot_theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function readPref(): ThemePref {
  const v = localStorage.getItem(KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

export const themePref = ref<ThemePref>(readPref())
export const isDark = ref(false)

/** Couleur imposée par l'écran courant (ex. billet sur fond marine) */
let routeColor: string | undefined

const SURFACE = { light: '#FFFFFF', dark: '#171E33' }

function isLightColor(hex: string) {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m) return true
  const [r, g, b] = m.map(x => parseInt(x, 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6
}

function applyChrome() {
  const color = routeColor || (isDark.value ? SURFACE.dark : SURFACE.light)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  setSystemBars(isLightColor(color))
}

function apply() {
  isDark.value = themePref.value === 'dark' || (themePref.value === 'system' && media.matches)
  document.documentElement.classList.toggle('dark', isDark.value)
  applyChrome()
}

export function setRouteChrome(color?: string) {
  routeColor = color
  applyChrome()
}

media.addEventListener('change', apply)
watch(themePref, v => {
  if (v === 'system') localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, v)
  apply()
})
apply()
