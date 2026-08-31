# MoT Transport — Design System
### Direction "Carnet de Voyage" · PWA Client v1.0

---

## Philosophie

Le design s'inspire du **billet de bus physique** — papier thermique, numérotation estampillée, ligne de perforation, tampon d'entrée. L'objet réel que tout voyageur ivoirien connaît est la source de chaque décision visuelle.

**Trois règles :**
1. Chaque écran a une tâche unique. On ne décore pas, on guide.
2. L'énergie vient de la couleur et du type, pas des animations.
3. Le ticket numérique doit ressembler à un vrai document — pas à une card générique.

---

## 1. Palette de couleurs

| Nom | Hex | Usage |
|---|---|---|
| **Nuit** | `#0F1829` | Headers, Tab bar, fond onboarding |
| **Sable** | `#FDF6EC` | Corps des tickets (papier chaud) |
| **Soleil** | `#F59E0B` | Accent actif, badges "disponible", pagination |
| **Route** | `#E9550D` | CTA principal (bouton "Réserver") |
| **Voyage** | `#1D4ED8` | Liens, éléments secondaires, icônes |
| **Brume** | `#EFF3FF` | Fond global (remplace slate-50 générique) |
| **Encre** | `#1A1A2E` | Texte principal |
| **Pierre** | `#6B7280` | Texte secondaire |
| **Braise** | `#FEF3C7` | Fond badge "Attention" (peu de places) |

### Usage Clair / Sombre

```
Fond page          : #EFF3FF  (Brume)
Fond header/nav    : #0F1829  (Nuit)
Fond ticket body   : #FDF6EC  (Sable)
Fond card standard : #FFFFFF
Texte principal    : #1A1A2E  (Encre)
Texte secondaire   : #6B7280  (Pierre)
CTA principal      : #E9550D  (Route)
Accent interactif  : #F59E0B  (Soleil)
```

### Pourquoi `Route` orange pour le CTA ?

La grande majorité des apps de transport/paiement utilisent le bleu comme CTA. `#E9550D` est inhabituel dans ce contexte, justifié par l'énergie du voyage ouest-africain, et immédiatement mémorable. Le bleu `Voyage` reste présent pour les liens secondaires — la hiérarchie est claire.

---

## 2. Typographie

### Polices

| Rôle | Police | Source |
|---|---|---|
| Display / Titres | **Space Grotesk** | Bunny Fonts |
| Corps / Interface | **DM Sans** | Bunny Fonts |
| Codes / Références | **JetBrains Mono** | Bunny Fonts |

```html
<!-- À ajouter dans index.html -->
<link href="https://fonts.bunny.net/css?family=space-grotesk:400,500,600,700|dm-sans:400,500,600|jetbrains-mono:400,500&display=swap" rel="stylesheet" />
```

**Pourquoi ces polices ?**
- `Space Grotesk` : géométrique avec une légère irrégularité qui donne de la personnalité — pas sur-utilisée comme Inter ou Poppins
- `DM Sans` : ronde et chaleureuse, meilleure lisibilité sur écran mobile que Inter
- `JetBrains Mono` : pour les codes de billet, numéros de référence — évoque un document officiel horodaté

### Échelle typographique

| Nom | Classe Tailwind | px | Police | Poids |
|---|---|---|---|---|
| `display-xl` | `text-4xl font-bold` | 36 | Space Grotesk | 700 |
| `display-lg` | `text-2xl font-bold` | 24 | Space Grotesk | 700 |
| `display-md` | `text-xl font-semibold` | 20 | Space Grotesk | 600 |
| `title` | `text-lg font-semibold` | 18 | DM Sans | 600 |
| `body` | `text-sm` | 14 | DM Sans | 400 |
| `caption` | `text-xs` | 12 | DM Sans | 500 |
| `code` | `font-mono text-sm` | 14 | JetBrains Mono | 400 |
| `price` | `text-xl font-bold font-display` | 20 | Space Grotesk | 700 |

---

## 3. Espacements & Formes

```
Marge horizontale page    : 20px
Gap entre sections        : 24px
Gap éléments inline       : 12px

Radius card standard      : 16px
Radius ticket (haut/bas)  : 16px — côtés droits pour les encoches
Radius bouton CTA         : 12px
Radius input              : 12px
Radius badge              : 9999px (pill)
Radius tab active         : 8px

Hauteur bouton CTA        : 52px
Hauteur input             : 52px
Hauteur tab bar           : 60px
```

---

## 4. Composants

### 4.1 Bouton CTA Principal

```
┌──────────────────────────────────────┐
│         Réserver ce trajet →         │
└──────────────────────────────────────┘

Fond        : #E9550D (Route)
Texte       : #FFFFFF · DM Sans 16px · weight 600
Radius      : 12px
Ombre       : 0 4px 16px rgba(233,85,13,0.35)
Pressed     : scale(0.97) · brightness(0.9)
Disabled    : #D1D5DB · ombre supprimée
```

### 4.2 Bouton Secondaire

```
┌──────────────────────────────────────┐
│         Modifier la recherche        │
└──────────────────────────────────────┘

Fond        : transparent
Bordure     : 1.5px solid #E9550D
Texte       : #E9550D · DM Sans 16px · weight 600
```

### 4.3 Input Field

```
Fond        : #FFFFFF
Bordure     : 1px solid #E2E8F0
Bordure focus : 2px solid #F59E0B (Soleil — pas bleu)
Radius      : 12px
Label       : DM Sans 12px · #6B7280 · uppercase · tracking-wide
```

### 4.4 Card Standard

```
Fond        : #FFFFFF
Radius      : 16px
Ombre       : 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)
Padding     : 16px
```

### 4.5 Carte Ticket (SIGNATURE)

C'est l'élément distinctif du design. Un vrai ticket physique rendu en CSS.

```
┌─────────────────────────────────────────┐
│  MoT TRANSPORT        N° 00123456      │  ← Header Nuit
│  ● VALIDE                               │  ← Badge vert
├╌╌╌╌╌╌╌╌╌○╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌○╌╌╌╌╌╌╌╌╌╌╌╌╌┤  ← Ligne perforée
│                                         │
│  YOPOUGON          BOUAKÉ               │  ← Corps Sable (#FDF6EC)
│  06:00    ────────→────────    12:30    │
│                                         │
│  Lun. 1 sept. 2026 · Siège 2B           │
│  ─────────────────────────────────────  │
│  5 500 FCFA               Mobile Money  │
│                                         │
│           ○  ENCOCHES CÔTÉ  ○           │  ← Cercles CSS radial-gradient
└─────────────────────────────────────────┘
```

**Implémentation CSS de la ligne perforée :**
```css
.ticket-tear {
  border-top: 2px dashed #E2E8F0;
  position: relative;
}
.ticket-tear::before,
.ticket-tear::after {
  content: '';
  position: absolute;
  top: -12px;
  width: 24px;
  height: 24px;
  background: #EFF3FF; /* couleur du fond page */
  border-radius: 50%;
}
.ticket-tear::before { left: -12px; }
.ticket-tear::after  { right: -12px; }
```

**Structure couleur ticket :**
```
Header ticket  : bg-[#0F1829] text-white · radius top 16px
Corps ticket   : bg-[#FDF6EC] · radius bottom 16px
Numéro ref     : font-mono · text-xs · tracking-widest
Villes         : Space Grotesk · 20px · bold · uppercase
Ligne de trajet: trait horizontal tirets + flèche SVG
```

### 4.6 Badge Statut

| Statut | Fond | Texte | Dot |
|---|---|---|---|
| Valide | `#DCFCE7` | `#16A34A` | ● vert |
| Utilisé | `#F1F5F9` | `#6B7280` | ● gris |
| Annulé | `#FEE2E2` | `#DC2626` | ● rouge |
| Expiré | `#FEF3C7` | `#D97706` | ● ambre |

Format : `● VALIDE` — dot + texte en majuscules, police DM Sans 11px, weight 600

### 4.7 Tab Bar

```
┌────────────────────────────────────────────────┐
│  🏠 Accueil   │   🎫 Billets   │   👤 Profil  │
└────────────────────────────────────────────────┘

Fond            : #0F1829 (Nuit)
Onglet actif    : texte blanc + barre #F59E0B (Soleil) en dessous 2px
Onglet inactif  : texte #475569
Hauteur totale  : 64px + safe-area-bottom
Icônes          : Lucide SVG · 22px · stroke 1.8
Police label    : DM Sans · 10px · weight 500
```

### 4.8 Toast Notification

```
Position  : bottom-24 (au-dessus de la tab bar) · centré
Max-width : 90%
Radius    : 12px
Ombre     : 0 8px 24px rgba(0,0,0,0.15)
Durée     : 3s · fade in/out 200ms

Succès : bg #ECFDF5 · texte #065F46 · bordure gauche 3px #16A34A
Erreur : bg #FEF2F2 · texte #991B1B · bordure gauche 3px #DC2626
Info   : bg #EFF6FF · texte #1E40AF · bordure gauche 3px #3B82F6
```

### 4.9 Skeleton Loader

```
Couleur base   : #E2E8F0
Couleur shimmer: #F8FAFC
Animation      : shimmer horizontal 1.5s infini (pas pulse — plus premium)
Radius         : correspondant au composant qu'il remplace
```

---

## 5. Icônes

**Bibliothèque :** Lucide Icons (SVG inline ou composant Vue)

| Icône | Usage |
|---|---|
| `Home` | Tab Accueil |
| `Ticket` | Tab Billets |
| `User` | Tab Profil |
| `MapPin` | Sélecteur ville |
| `Calendar` | Date |
| `Users` | Voyageurs |
| `Search` | Bouton recherche |
| `ArrowRight` | Navigation |
| `ArrowLeftRight` | Swap origine/destination |
| `Clock` | Heure départ/arrivée |
| `ChevronLeft` | Retour |
| `Share2` | Partager |
| `Copy` | Copier référence |
| `X` | Fermer modal |
| `CheckCircle` | Confirmation |
| `AlertTriangle` | Avertissement places |
| `LogOut` | Déconnexion |

**Taille standard :** 20px · **Stroke :** 1.75px · **Couleur :** contextuelle

---

## 6. Écrans — Redesign par écran

### Onboarding (3 slides)

**Fond :** `#0F1829` uniforme sur les 3 slides (pas de dégradé changeant — plus premium, plus cohérent)

**Layout par slide :**
```
┌────────────────────────────────┐
│                                │ ← safe area top
│  [Illustration SVG grande      │
│   80% de la hauteur screen]   │
│                                │
│  Titre                         │  ← Space Grotesk 28px bold white
│  Sous-titre                    │  ← DM Sans 15px #94A3B8
│                                │
│  ● ○ ○   [ Suivant → ]        │  ← dots Soleil + bouton Route
└────────────────────────────────┘
```

**Titres récrits :**
- Slide 1 : `"Partez quand vous voulez"` — affirmatif, pas descriptif
- Slide 2 : `"Votre ticket sur votre téléphone"` — concret, pas mystérieux
- Slide 3 : `"Annulez sans stress"` — bénéfice direct

---

### Écran Bienvenue

**Pas de gradient bleu bateau.** Fond `#0F1829` avec le logo centré sur fond sombre, sous-titre en `#94A3B8`.

```
┌─────────────────────────────────────┐
│                                     │  ← fond #0F1829
│         🚌                          │
│    MoT Transport                    │  ← Space Grotesk 32px white
│  Billets de bus · Côte d'Ivoire     │  ← DM Sans 14px #94A3B8
│                                     │
│  ────────────────────────────────   │
│                                     │
│  [ Se connecter ]                   │  ← bouton Route (#E9550D)
│  [ Créer un compte ]                │  ← bouton outline blanc
│                                     │
│  Continuer sans compte →            │  ← lien #F59E0B (Soleil)
└─────────────────────────────────────┘
```

---

### Écran Accueil (Home)

**Pas de gradient + form card.** Le header devient une section statut compacte.

```
┌─────────────────────────────────────┐
│  Fond #0F1829 · safe-top            │
│  MoT Transport              [notif] │  ← logo petit + icône cloche
│  Bonjour, Mamadou                   │  ← DM Sans 16px white
└─────────────────────────────────────┘

┌─────────────────────────────────────┐  ← card sur fond Brume
│  Rechercher un trajet               │  ← Space Grotesk 18px Encre
│                                     │
│  ┌─── Départ ──────────────────┐    │
│  │  Yopougon - Adjamé          │    │  ← fond blanc, bordure Soleil au focus
│  └─────────────────────────────┘    │
│           ⇅ (icône Route)           │  ← swap button rond, bg Route
│  ┌─── Arrivée ─────────────────┐    │
│  │  Bouaké                     │    │
│  └─────────────────────────────┘    │
│                                     │
│  [ 📅 Aujourd'hui ]  [ 👥 1 pers. ] │  ← 2 chips côte à côte
│                                     │
│  [ Rechercher →  ]                  │  ← bouton Route pleine largeur
└─────────────────────────────────────┘

  Destinations populaires
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Bouaké   │ │ Yamous.. │ │ San-Péd. │  ← chips scrollables horizontal
  │ 5 500 F  │ │ 3 500 F  │ │ 6 000 F  │
  └──────────┘ └──────────┘ └──────────┘
```

---

### Résultats de trajets

```
┌─────────────────────────────────────┐
│  ← Retour                           │
│  Yopougon → Bouaké                  │  ← Space Grotesk 20px
│  Lun. 1 sept. · 1 voyageur          │  ← DM Sans 13px Pierre
└─────────────────────────────────────┘

  ┌─────────────────────────────────────┐  ← card trajet
  │  06:00 ──────────── 12:30           │  ← horaires Space Grotesk 20px bold
  │  Yopougon           Bouaké          │  ← DM Sans 12px Pierre
  │  6h30                               │
  │  ─────────────────────────────────  │  ← séparateur léger
  │  24 places · Bus ABJ-012            │  ← petit · vert si dispo
  │                         5 500 FCFA  │  ← Space Grotesk 18px bold Encre
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  ⚠ 3 places restantes              │  ← fond Braise si < 5 places
  │  ...                                │
  └─────────────────────────────────────┘
```

---

### Plan des sièges

```
┌─────────────────────────────────────┐
│ Siège disponible  [  ] bg #F8FAFC · border #E2E8F0
│ Siège sélectionné [✓] bg Soleil (#F59E0B) · text Encre
│ Siège occupé      [██] bg #E2E8F0 · cursor-not-allowed
└─────────────────────────────────────┘
```

Les sièges sélectionnés utilisent **Soleil** (ambre) — plus mémorable et chaud que le bleu par défaut.

---

### Paiement

```
Mode sélectionné :
  Fond : #FDF6EC (Sable — rappelle le ticket)
  Bordure gauche : 3px solid #E9550D (Route)
  Radio : • Route
```

---

### Carte Ticket (détail complet)

```
┌─────────────────────────────────────┐
│ bg #0F1829                          │
│  MoT TRANSPORT      N°00123456     │  ← font-mono text-xs tracking-widest
│  ● VALIDE                           │  ← badge vert pill
├╌╌╌╌╌○╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌○╌╌╌╌╌╌╌╌╌┤  ← tear line + encoches
│ bg #FDF6EC                          │
│  YOPOUGON          BOUAKÉ           │  ← Space Grotesk uppercase 20px bold
│  06:00  ─── ✈ ───  12:30           │  ← flèche SVG sur trait
│                                     │
│  Lun. 1 septembre 2026              │
│  Siège 2B · Bus ABJ-012             │
│  ─────────────────────────────────  │
│  5 500 FCFA            Mobile Money │
└─────────────────────────────────────┘

  [■■■■ QR CODE ■■■■]  (200×200, fond blanc, padding 12px)

  Copier la référence : N°00123456
```

---

## 7. Animations

**Règle :** Une seule animation mémorable par flux, tout le reste est discret.

| Moment | Animation | Durée |
|---|---|---|
| Transition entre vues | Slide horizontal léger (24px) + fade | 220ms ease |
| Bouton pressed | scale(0.97) | 120ms |
| Toast apparition | translateY(-8px) + fade | 200ms |
| Skeleton | shimmer horizontal | 1.5s infini |
| Sélection siège | scale(1.05) + bg → Soleil | 150ms |
| Confirmation réservation | Scale-in checkmark (transform scale 0→1) | 400ms spring |
| Tab bar active | Barre Soleil slide sous l'icône | 200ms ease |

**Pas d'animation sur :** headers, cartes, inputs, fondus de fond d'écran. Motion réduit (`prefers-reduced-motion`) : toutes les animations supprimées sauf les transitions de page.

---

## 8. États vides & erreurs

### État vide

```
  [Illustration SVG simple, monochrome #CBD5E1]
  Titre           : Space Grotesk 18px Encre
  Sous-titre      : DM Sans 14px Pierre
  CTA (si action) : Bouton Route standard
```

### Erreur réseau

```
  [Icône Lucide WifiOff, 48px, couleur Pierre]
  "Impossible de charger les trajets"     ← direct, pas "Oops"
  "Vérifie ta connexion et réessaie."     ← instruction claire
  [ Réessayer ]                           ← CTA Route
```

### Erreur de validation (form)

Texte d'erreur directement sous le champ :
- DM Sans 12px · `#DC2626`
- Pas d'icône — le rouge suffit
- Message actif voix : "Ce numéro est déjà utilisé" pas "Erreur de validation"

---

## 9. Grille responsive

L'app est **mobile-first, max-width 430px**. Au-delà :
```
> 430px : centré avec max-w-[430px] mx-auto
          fond de page : #EFF3FF (Brume)
          l'app apparaît comme un téléphone centré
```

---

## 10. Checklist d'implémentation

- [ ] `index.html` — nouvelles polices Bunny Fonts (Space Grotesk, DM Sans, JetBrains Mono)
- [ ] `tailwind.config.js` — tokens Nuit, Sable, Soleil, Route, Voyage, Brume, Encre, Pierre
- [ ] `main.css` — nouvelles classes utilitaires + composant `.ticket-card`
- [ ] `AppButton.vue` — variante Route pour CTA + variante outline blanc
- [ ] `AppInput.vue` — focus border Soleil (pas bleu)
- [ ] `AppBadge.vue` — format `● VALIDE` uppercase
- [ ] `TabBar.vue` — fond Nuit, active bar Soleil
- [ ] `OnboardingView.vue` — fond Nuit uniforme, textes récrits
- [ ] `WelcomeView.vue` — fond Nuit, CTA Route
- [ ] `HomeView.vue` — header compact Nuit + card recherche + chips destinations
- [ ] `SearchResultsView.vue` — cards redesignées, shimmer skeleton
- [ ] `TicketDetailView.vue` — carte ticket physique avec tear line
- [ ] `TicketsView.vue` — liste avec cartes ticket mini

---

*Document de référence · MoT Transport Design System v1.0 · 31 août 2026*
