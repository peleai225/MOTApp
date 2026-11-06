import { onActivated, onDeactivated, onMounted, onUnmounted, type Ref } from 'vue'

/** Remonte en haut du conteneur quand l'utilisateur retouche l'onglet actif. */
export function useTabReselect(tab: string, el: Ref<HTMLElement | null | undefined>) {
  const handler = (e: Event) => {
    if ((e as CustomEvent).detail === tab) el.value?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const on = () => window.addEventListener('mot:tab-reselect', handler)
  const off = () => window.removeEventListener('mot:tab-reselect', handler)
  onMounted(on); onActivated(on)
  onUnmounted(off); onDeactivated(off)
}
