# Application installable — manifeste, service worker et coquille hors ligne

> **Sources** — `apps/frontend/{next.config.ts,tsconfig.json,package.json,proxy.ts}`,
> `app/{layout.tsx,manifest.ts,icon.svg,globals.css}`, `content/site.ts`,
> `components/{ui,composites,views}/**` ; documentation Next.js 16.3.4 embarquée
> (`apps/frontend/node_modules/next/dist/docs/`), en particulier
> `01-getting-started/01-installation.md`,
> `03-api-reference/03-file-conventions/01-metadata/manifest.md`,
> `03-api-reference/04-functions/generate-viewport.md` et
> `03-api-reference/05-config/01-next-config-js/headers.md` ; `docs/design/frontend.md`
> (D9, §3.2, §4.4) ; MDN « Making PWAs installable » ; « Revisiting Chrome's
> installability criteria » ; documentation Serwist (`serwist` et
> `@serwist/turbopack` 9.5.12).
>
> **Portée** — rendre `apps/frontend` installable sur un téléphone et lui donner un
> comportement hors ligne qui ne montre jamais de donnée non confirmée. Couvre le
> manifeste, les icônes, la couleur de thème, le service worker, la page hors ligne
> et l'invitation à installer.
>
> **Hors portée** — les notifications push, la mise en cache de données métier
> (interdite, §4), et la tenue de l'écran de paiement hors ligne, traitée à part.

---

## 1. Le problème

CartePro s'utilise chez un commerçant, téléphone en main. Ouvert depuis un
navigateur, le site s'affiche dans un onglet avec la barre d'adresse, et rien ne
permet de le poser sur l'écran d'accueil.

`app/manifest.ts` et `app/icon.svg` existent, mais le manifeste ne déclare qu'une
icône SVG en `sizes: "any"`. Les navigateurs Chromium exigent en plus une icône
matricielle 192 **et** une 512 avant de considérer l'application installable, et
l'invite d'installation maison réclame un service worker doté d'un gestionnaire
`fetch`. Il n'y en a pas, donc rien ne s'installe et une coupure réseau produit la
page d'erreur du navigateur.

Ce n'est pas une exigence du cahier des charges : `PWA`, `service worker` et
`manifest` n'y figurent pas. Deux points d'ancrage existaient néanmoins dans la
spécification frontend — une page d'état `offline` prévue dans `components/views/`
(§3.2) et un bandeau de perte de réseau relevant de US-01-08.

---

## 2. Décisions verrouillées

| #       | Décision                                                                                             | Pourquoi                                                                                                                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1**  | Aucune donnée métier n'entre en cache : ni réponse d'API, ni document d'un espace protégé.           | D9 de `frontend.md`. Le HTML de `/me` porte des montants ; un solde périmé affiché est un défaut fonctionnel.                                                                                                           |
| **P2**  | La règle `NetworkOnly` sur `/api/` et `/auth/` est enregistrée **en premier**.                       | L'ordre d'enregistrement fait foi : une règle placée après une autre qui les capture serait sans effet.                                                                                                                 |
| **P3**  | Le worker est écrit en TypeScript (`lib/sw/sw.ts`) et vérifié par un `tsconfig.sw.json` dédié.       | Le `tsconfig.json` principal déclare `lib: ["dom", …]` et ne connaît pas `ServiceWorkerGlobalScope` ; sans passe dédiée, le worker serait le seul fichier hors de portée de `typecheck`.                                |
| **P4**  | `@serwist/turbopack` est adopté **pour son manifeste de précache, et rien d'autre**.                 | Un cache alimenté à la demande ne contient que ce qui a déjà été demandé : la page de repli, qu'aucun utilisateur n'ouvre en ligne, n'aurait jamais ses propres fichiers et ne pourrait pas s'hydrater.                 |
| **P5**  | `defaultCache` de Serwist n'est **pas** utilisé ; les règles d'exécution sont écrites explicitement. | `defaultCache` place `/api/` en `NetworkFirst`, ce que P1 interdit.                                                                                                                                                     |
| **P6**  | Sur échec de navigation, le worker **redirige** vers `/offline` au lieu d'y substituer le document.  | Servir la page de repli sous l'URL demandée donne un document dont l'URL ne correspond pas : l'App Router s'hydrate, va chercher la route qu'il attend, échoue, et installe son propre document d'erreur.               |
| **P7**  | La page de repli est **générique**.                                                                  | Une seule page sert toutes les routes interrompues. Nommer un écran ou une donnée en particulier y serait faux partout ailleurs.                                                                                        |
| **P8**  | Le worker ne s'enregistre qu'en production.                                                          | Un service worker en développement interfère avec le rechargement à chaud.                                                                                                                                              |
| **P9**  | Le zoom n'est jamais bloqué : ni `maximumScale`, ni `userScalable`.                                  | Exigence d'accessibilité, valable en mode installé comme dans un onglet.                                                                                                                                                |
| **P10** | Les icônes matricielles sont générées depuis `app/icon.svg`, jamais dessinées séparément.            | Une icône dessinée à part diverge de la marque au premier changement.                                                                                                                                                   |
| **P11** | La révision de la page de repli est injectée au build par `SW_PUBLIC_BUILD_ID`.                      | La page de repli est une route rendue, pas un fichier de build : le glob ne la voit pas, elle est ajoutée par `additionalPrecacheEntries`, et sa révision doit changer à chaque déploiement pour ne pas rester périmée. |

---

## 3. Arborescence

```
apps/frontend/
├── app/
│   ├── manifest.ts                    complété : id, scope, lang, dir, icônes matricielles
│   ├── apple-icon.png                 180×180, généré depuis app/icon.svg
│   ├── layout.tsx                     + export const viewport, + metadata.appleWebApp
│   ├── offline/page.tsx               page de repli, statique, hors (protected)
│   └── serwist/[path]/route.ts        empaquette le worker → /serwist/sw.js
│
├── components/
│   ├── views/offline.tsx              la page d'état prévue par frontend.md §3.2
│   └── composites/
│       ├── service-worker.client.tsx  enregistrement, production seulement
│       └── install-prompt.client.tsx  beforeinstallprompt + variante iOS
│
├── constants/pwa.ts                   couleurs, start_url, URL du worker, icônes, clés
├── content/site.ts                    + blocs `offline` et `install`
├── lib/sw/sw.ts                       source TypeScript du worker
├── tsconfig.sw.json                   lib: ES2022 + WebWorker
└── public/icons/                      icon-192.png, icon-512.png
```

Trois règles de revue :

1. Une URL de donnée métier qui apparaît dans un cache est un défaut, pas une optimisation.
2. Une chaîne d'interface hors de `content/` est un défaut, y compris dans le manifeste.
3. Le worker ne se modifie que dans `lib/sw/sw.ts` ; le fichier servi est empaqueté au build.

---

## 4. La politique de cache

| Requête                                    | Traitement                                                             | Mise en cache                       |
| ------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------- |
| `/api/**`, `/auth/**`                      | `NetworkOnly`, règle enregistrée **en premier**                        | **jamais**                          |
| Navigation (`request.mode === 'navigate'`) | préchargement puis réseau ; sur échec, **redirection** vers `/offline` | jamais — le HTML porte des montants |
| `/_next/static/**`, `public/**`            | servis depuis le précache                                              | précache Serwist                    |
| `/offline`                                 | précaché, révision liée au build                                       | précache Serwist                    |
| Tout le reste                              | passe-plat                                                             | jamais                              |

Hors ligne, une route protégée redirige vers `/offline`, qui peint la coquille
depuis le précache, explique la coupure et propose de réessayer. Son action est un
lien, pas un gestionnaire : la page reste utilisable même si ses fichiers
d'hydratation manquent.

---

## 5. Installabilité

Les navigateurs Chromium exigent un manifeste portant `name` (ou `short_name`),
`start_url`, `display`, des icônes **192 et 512**, et une origine sécurisée.

MDN indique qu'un service worker n'est pas nécessaire à l'installabilité ; la
documentation Chrome indique que l'événement `beforeinstallprompt` exige un worker
doté d'un gestionnaire `fetch`. Les deux tiennent : l'installation manuelle par le
menu du navigateur n'exige rien, l'invite maison si. C'est ce qui met le worker au
périmètre.

Sur iOS, `beforeinstallprompt` n'existe pas : l'invitation devient une instruction,
et `app/apple-icon.png` fournit l'icône de l'écran d'accueil.

**Origine sécurisée, et ce que cela implique pour les essais.** Tout le domaine
`localhost` est réputé digne de confiance : `http://cartepro.localhost` est donc une
origine sécurisée, et l'artefact de démonstration fonctionne en HTTP sur la machine
qui l'exécute. Un téléphone ne résout pas ce nom, et une adresse IP de réseau local
n'est pas une origine sécurisée. Essayer sur un appareil demande donc soit un renvoi
de port (`adb reverse tcp:<port> tcp:<port>`, qui fait pointer le `localhost` du
téléphone vers la machine), soit un certificat approuvé sur l'appareil.

---

## 6. Gates et vérification

Les tâches de `.github/workflows/ci.yml` s'appliquent sans ajout. Deux scripts
changent :

```json
"build": "SW_PUBLIC_BUILD_ID=${SW_PUBLIC_BUILD_ID:-$(date +%s)} next build",
"typecheck": "bun run typegen && tsc --noEmit && tsc -p tsconfig.sw.json --noEmit"
```

`@serwist/turbopack`, `serwist` et `esbuild` sont des dépendances de développement.
`useNativeEsbuild: true` est requis : hors Windows, Serwist choisit `esbuild-wasm`,
absent des dépendances, et le build échoue sinon sur `Cannot find package
'esbuild-wasm'`.

Le worker ne s'enregistrant qu'en production, `next dev` ne prouve rien : la
vérification se fait sur `bun run build` puis `next start`.

### Ce qui est vérifié

1. `/manifest.webmanifest` répond en `application/manifest+json`, avec `start_url`,
   `display: standalone`, et des icônes SVG, 192, 512 et maskable.
2. Le `<head>` porte exactement un `<link rel="manifest">`, un
   `<meta name="theme-color">` et un seul `apple-touch-icon`, avec un viewport qui ne
   bloque pas le zoom.
3. `/serwist/sw.js` répond avec `Service-Worker-Allowed: /` et un `Cache-Control` qui
   autorise son remplacement ; le worker s'enregistre au scope `/` et passe `activated`.
4. Le précache contient la page de repli et les fichiers de build, et **aucune** entrée
   `/api/`, `/auth/`, `/me`, `/pro` ou `/admin`. C'est le contrôle qui prouve P1.
5. **Cache froid, sans avoir jamais ouvert `/offline`**, serveur arrêté : une route
   protégée redirige vers la page de repli, qui s'affiche entière, sans document
   d'erreur et sans donnée métier.
6. L'action « Réessayer » est un lien : elle fonctionne sans JavaScript.
7. Un nouveau build remplace le précache précédent.
8. Sur un téléphone atteint par renvoi de port : installation proposée, lancement sans
   barre d'adresse, icône correcte, zoom possible, et page de repli hors ligne.

**Contrôle de discrimination** — un gate dont on n'a pas vu le rouge n'est pas un
gate : casser volontairement un type de `lib/sw/sw.ts` doit faire sortir
`tsc -p tsconfig.sw.json` en erreur.

---

## 7. Décisions ouvertes

| #      | Question                                                                | Ce qui bloque                                                                                |
| ------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Q1** | Conserve-t-on le jeton de paiement sur l'appareil ?                     | C'est un porteur de débit au repos, pour une fenêtre utile de cinq minutes.                  |
| **Q2** | L'identifiant de build doit-il devenir l'identifiant de commit en CI ?  | Un horodatage invalide la révision de la page de repli à chaque build, même sans changement. |
| **Q3** | Le précache doit-il exclure les fichiers hérités de `create-next-app` ? | Ils ne sont référencés nulle part mais occupent des entrées du manifeste.                    |
