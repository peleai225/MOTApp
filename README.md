# MOT — application client

Application mobile (PWA installable) de **Mohamed Ouattara Transport** : recherche de départs, choix des places sur le plan du car, paiement, billet à QR code consultable hors connexion.

## Démarrer

```bash
npm install
cp .env.example .env    # puis ajuster VITE_API_URL
npm run dev             # http://localhost:5173 (accessible aussi depuis un téléphone sur le même réseau)
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production + service worker (hors-ligne) |
| `npm run preview` | Sert le build pour le tester comme en production |
| `npm run typecheck` | Vérification TypeScript des composants Vue |

## Données : API réelle ou démonstration

L'app consomme l'API Laravel du projet `agare` (`routes/api.php`, contrôleurs `App\Http\Controllers\Api\*`).

`VITE_API_MODE` règle le comportement quand le serveur ne répond pas :

- `auto` (défaut en dev) : API réelle ; si elle est injoignable, l'app passe en **mode démo** et l'affiche dans une bande orange en haut de l'écran.
- `live` (défaut en production) : jamais de données simulées.
- `demo` : données simulées uniquement (présentation client, tests).

Le mode démo reproduit le contrat de l'API (gares, départs, sièges, comptes, réservations, annulation) avec le réseau Yopougon – Bondoukou – Kumasi. Compte de test : **07 00 00 00 00** / **demo123**.

> Note backend : `agare/public/.htaccess` redirige tout HTTP vers HTTPS. Si SSL n'est pas activé dans Laragon, l'API est injoignable : activer SSL (et passer `VITE_API_URL` en `https://`) ou retirer cette redirection en local.

## Application Android (Capacitor)

Le projet Android natif est dans `android/` (identifiant `ci.motransport.app`).

| Commande | Rôle |
|---|---|
| `npm run android:sync` | Build web en mode Android (`.env.android`) et copie dans le projet natif |
| `npm run android:apk` | Produit l'APK de test : `android/app/build/outputs/apk/debug/app-debug.apk` |
| `npm run android:open` | Ouvre le projet dans Android Studio (signature, Play Store) |

- Prérequis : Android Studio. Capacitor 8 demande **Java 21 ou plus** : le JDK fourni avec Android Studio convient (`JAVA_HOME=C:/Program Files/Android/Android Studio/jbr`), pas le JDK 17.
- Un téléphone ne voit pas `agare.test` : pour une version reliée au vrai serveur, mettre l'adresse **publique en HTTPS** de l'API dans `.env.android` et passer `VITE_API_MODE=live`. En HTTP, Android bloque les requêtes.
- Comportements natifs : bouton retour Android (ferme la feuille ouverte, revient à l'Accueil, puis met l'app en arrière-plan), vibrations, feuille de partage du système, écran de lancement clair/sombre, affichage bord à bord.
- Visuels (icône adaptative, écran de lancement) : sources dans `assets/`, régénérés avec `npx @capacitor/assets generate --android`.

## Thème clair / sombre

L'app suit le réglage du téléphone ; l'utilisateur peut forcer Clair ou Sombre dans Profil → Apparence. Les couleurs sont des jetons (variables CSS) définis dans `src/assets/css/main.css`. Le billet reste volontairement clair dans les deux thèmes (lisibilité du QR code).

## Comportement « app native »

- Transitions push / pop selon le sens de navigation, retour par glissement depuis le bord gauche
- Onglets conservés en mémoire (défilement et données), toucher l'onglet actif remonte en haut
- Bottom sheets glissables, tirer pour rafraîchir, retour haptique (Android)
- Billets enregistrés sur l'appareil : consultables sans réseau, à la gare ou dans le car
- Installation sur l'écran d'accueil (Android et iPhone), écran de lancement, proposition de mise à jour
- Couleur de barre d'état adaptée à chaque écran, zones sûres (encoche, barre de geste)

## Structure

```
src/
├── api/            index.ts (axios + bascule démo), demo.ts (backend simulé)
├── stores/         auth, search, booking (réservation en cours), tickets (cache hors-ligne), app
├── lib/            format (FCFA, dates, durées), seats, haptics, share
├── components/
│   ├── layout/     AppBar, TabBar
│   ├── ui/         BottomSheet, PullToRefresh, DayStrip, Stepper, Segmented, AppInput, EmptyState, StatusPill
│   └── mot/        BoardingPass, TicketStub, TripCard, DepartureRow, SeatMap, StationSheet, LiveryStripes
├── views/          onboarding, auth, home, departures, search, trip (détail, places, paiement, confirmation), tickets, profile
└── config.ts       coordonnées de la marque (téléphone, WhatsApp, e-mail) — à vérifier avant mise en ligne
```

## Identité visuelle

Palette tirée de la livrée des cars : bleu `#1F3285` et rouge `#DB2B1C` du logo sur fond blanc, texte encre `#0D1530`. Typographie Barlow / Barlow Condensed (auto-hébergée, disponible hors-ligne), inspirée de la signalétique routière.
