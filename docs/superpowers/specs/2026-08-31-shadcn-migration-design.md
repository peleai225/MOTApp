# Design Spec — Migration shadcn/vue + TypeScript
**Date :** 2026-08-31  
**Projet :** MoT Transport PWA (`c:/laragon/www/MOT App`)  
**Scope :** Migration complète vers shadcn/vue + TypeScript + correction de 3 bugs

---

## 1. Contexte et objectifs

Le projet est une PWA Vue 3 (JS) avec un design system custom (couleurs sémantiques françaises, composants maison). On migre vers :
- **TypeScript** pour la robustesse et la compatibilité native avec shadcn/vue
- **shadcn/vue** pour tous les composants UI génériques
- **Design tokens shadcn** (CSS variables) remappés sur la palette du projet
- **Correction des 3 bugs console** identifiés

---

## 2. Stack finale

| Couche | Avant | Après |
|---|---|---|
| Langage | JavaScript | TypeScript |
| Composants UI | AppButton/Input/Badge/Toast custom | shadcn/vue |
| Primitives headless | — | radix-vue |
| Variants | classes Tailwind manuelles | class-variance-authority (CVA) |
| Class merge | — | clsx + tailwind-merge (`cn()`) |
| Toast | AppToast.vue custom | vue-sonner (shadcn Sonner) |
| Utilitaires réactifs | — | @vueuse/core |
| Reste | Vite, Pinia, Vue Router 4, Axios, vite-plugin-pwa, qrcode.vue | inchangé |

---

## 3. Design tokens — Remapping palette

Les variables CSS shadcn sont configurées pour correspondre à la charte MoT Transport.

### `src/assets/css/main.css` — variables à injecter dans `:root` et `.dark`

| Variable shadcn | Valeur (HSL) | Correspondance projet |
|---|---|---|
| `--background` | `222 47% 11%` | `nuit` #0F1829 |
| `--foreground` | `40 80% 97%` | `sable` #FDF6EC |
| `--primary` | `20 86% 49%` | `route` #E9550D (CTA orange-red) |
| `--primary-foreground` | `0 0% 100%` | blanc |
| `--secondary` | `221 66% 48%` | `voyage` #1D4ED8 |
| `--secondary-foreground` | `0 0% 100%` | blanc |
| `--muted` | `227 26% 15%` | `encre` #1A1A2E |
| `--muted-foreground` | `220 9% 46%` | `pierre` #6B7280 |
| `--accent` | `38 92% 50%` | `soleil` #F59E0B |
| `--accent-foreground` | `222 47% 11%` | `nuit` |
| `--card` | `222 47% 11%` | même que background |
| `--card-foreground` | `40 80% 97%` | même que foreground |
| `--border` | `227 26% 20%` | gris-bleu foncé |
| `--input` | `227 26% 20%` | même que border |
| `--ring` | `20 86% 49%` | `route` (focus ring) |
| `--destructive` | `0 84% 60%` | rouge standard |
| `--destructive-foreground` | `0 0% 100%` | blanc |
| `--radius` | `0.75rem` | 12px (btn-radius actuel) |

Les noms custom (`nuit`, `soleil`, `route`…) restent dans `tailwind.config.ts` pour les composants métier spécifiques (ticket physique, TabBar).

---

## 4. Migration des composants

### 4.1 Composants supprimés (remplacés par shadcn)

| Fichier supprimé | Remplacé par | Variantes à recréer |
|---|---|---|
| `src/components/ui/AppButton.vue` | `src/components/ui/button/Button.vue` | `default` (ex-route), `outline`, `outline-white`, `ghost`, `secondary`, `destructive` |
| `src/components/ui/AppInput.vue` | `src/components/ui/input/Input.vue` + `Label.vue` | Wrapper `AppInput.vue` gardé pour `label` + `error` + `prefix` + password toggle |
| `src/components/ui/AppBadge.vue` | `src/components/ui/badge/Badge.vue` | `valide`, `utilise`, `annule`, `expire` |
| `src/components/ui/AppToast.vue` | `vue-sonner` `<Toaster>` | — (API `toast.success/error/info`) |

### 4.2 Composants conservés (layout métier)

- `src/components/layout/TabBar.vue` — bottom nav mobile spécifique, pas d'équivalent shadcn
- `src/components/layout/PageHeader.vue` — header métier

Ces deux fichiers sont migrés en TypeScript (props typés) mais leur logique reste inchangée.

### 4.3 Composants shadcn ajoutés dans les vues

| Composant shadcn | Utilisé dans |
|---|---|
| `Select` | HomeView (sélecteur ville), SeatSelectionView |
| `Sheet` | HomeView (bottom-sheet villes), TicketDetailView (annulation) |
| `Tabs` | TicketsView (À venir / Passés) |
| `Skeleton` | SearchResultsView, TripDetailView |
| `AlertDialog` | TicketDetailView (confirmation annulation) |
| `Card` | ProfileView (sections), TripDetailView |
| `Separator` | TicketDetailView, TripDetailView |
| `Avatar` | ProfileView |

---

## 5. Structure de fichiers post-migration

```
src/
  lib/
    utils.ts           ← cn() helper (clsx + tailwind-merge)
  components/
    ui/
      button/
        Button.vue     ← shadcn
        index.ts
      input/
        Input.vue      ← shadcn
        index.ts
      badge/
        Badge.vue      ← shadcn
        index.ts
      AppInput.vue     ← wrapper conservé (label + error + prefix)
      [select, sheet, tabs, skeleton, alert-dialog, card, separator, avatar]/
    layout/
      TabBar.vue       ← conservé, migré TS
      PageHeader.vue   ← conservé, migré TS
  assets/
    css/main.css       ← tokens shadcn ajoutés, classes custom conservées
  [stores, composables, router, api, views] → migrés en .ts / lang="ts"
```

---

## 6. Migration TypeScript — Règles

1. `vite.config.js` → `vite.config.ts`
2. `tailwind.config.js` → `tailwind.config.ts`
3. `src/**/*.js` → `src/**/*.ts`
4. Tous les `<script setup>` → `<script setup lang="ts">`
5. Props avec `defineProps<{...}>()` (générique TypeScript)
6. Emits avec `defineEmits<{...}>()`
7. Stores Pinia avec types explicites sur `ref<T>()` et `computed<T>`
8. Axios : interfaces pour les réponses API (Gare, Trajet, Reservation, User)
9. `tsconfig.json` strict mode désactivé (`"strict": false`) pour migration progressive

---

## 7. Corrections de bugs

### Bug 1 — PWA icons manquantes
- **Action utilisateur :** copier `icon-192.png` et `icon-512.png` dans `public/icons/`
- Aucun changement de code requis (vite.config et manifest.json sont déjà corrects)

### Bug 2 — HomeView crash API (`agare.test` connection refused)
- **Fichier :** `src/views/home/HomeView.vue` (action `loadGares` dans `onMounted`)
- **Correctif :** entourer `searchStore.loadGares()` d'un `try/catch`
- **Comportement :** erreur catchée → `toast.error('Service temporairement indisponible')` via sonner + `gares` reste tableau vide + champs affichent placeholder "Ville de départ/arrivée"
- L'app reste entièrement navigable, seule la recherche est dégradée

### Bug 3 — `No Listener: tabs:outgoing.message.ready`
- **Origine :** extension Chrome (content script externe à l'app)
- **Action :** aucune — non corrigeable côté app

---

## 8. Ordre d'implémentation recommandé

1. Setup TypeScript (tsconfig, vite.config.ts, tailwind.config.ts)
2. Init shadcn-vue (CLI, components.json, utils.ts, tokens CSS)
3. Migrer stores + composables + router + api en TS
4. Générer composants shadcn de base (Button, Input, Badge, Sonner)
5. Remplacer les 4 composants UI custom par les shadcn
6. Corriger HomeView (bug API)
7. Migrer les vues en TS + remplacer éléments natifs par shadcn (Select, Sheet, Tabs, Skeleton, AlertDialog, Card, Separator, Avatar)
8. Migrer TabBar + PageHeader en TS
9. Ajuster tokens CSS + vérification visuelle globale

---

## 9. Hors scope

- Redesign visuel (les tokens shadcn sont remappés sur la palette existante)
- Ajout de nouvelles fonctionnalités
- Storybook ou tests de composants
- Migration du backend Laravel
