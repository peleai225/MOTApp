# MoT Transport — PWA Client

Application web progressive (PWA) pour les clients MoT Transport.

## Stack
- Vue.js 3 + Composition API
- Vite 5 + vite-plugin-pwa (Workbox)
- Tailwind CSS 3
- Pinia (état global)
- Vue Router 4
- Axios
- qrcode.vue

## Installation

```bash
cd "C:\laragon\www\MOT App"
npm install
```

## Développement

```bash
npm run dev
```

L'app est accessible sur `http://localhost:5173`

## Build production

```bash
npm run build
npm run preview
```

## Configuration

Copier `.env.example` → `.env` et ajuster l'URL de l'API :

```
VITE_API_URL=http://agare.test/api
```

## Structure

```
src/
├── api/           Axios + toutes les fonctions API
├── stores/        Pinia : auth, search
├── composables/   useToast
├── router/        Vue Router avec guards auth/onboarding
├── components/
│   ├── ui/        Button, Input, Badge, Toast
│   └── layout/    TabBar, PageHeader
└── views/
    ├── onboarding/  3 slides au premier lancement
    ├── auth/        Welcome, Login, Register (2 étapes)
    ├── home/        Recherche + sélecteur villes
    ├── search/      Résultats avec skeleton
    ├── trip/        Détail trajet + plan sièges
    ├── payment/     Paiement + confirmation + QR
    ├── tickets/     Liste (à venir / passés) + détail
    └── profile/     Profil + édition
```

## Icons PWA

Placer dans `public/icons/` :
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

## API backend

API Laravel Sanctum — voir `c:\laragon\www\agare\routes\api.php`
