/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** live : API réelle · demo : données locales · auto (dev) : API réelle, démo si injoignable */
  readonly VITE_API_MODE?: 'live' | 'demo' | 'auto'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    guest?: boolean
    tab?: boolean
    /** Couleur de la barre d'état Android */
    theme?: string
    /** Transition forcée à l'entrée */
    enter?: 'rise'
  }
}

export {}
