# Spécification frontend — CartePro

> **Retrait du 7 septembre 2026.** Les sections de ce document qui décrivent
> l'adoption du Système de Design de l'État (DSFR), la typographie Marianne et
> les primitives de couleur Bleu France sont **caduques** : le cabinet a demandé
> le retrait du bloc-marque et de l'identité de l'État de toutes les interfaces.
> Elles sont conservées telles quelles à titre d'historique, elles ne décrivent
> plus le code. L'identité en vigueur est celle décrite dans
> `apps/frontend/app/globals.css` et `apps/frontend/content/site.ts`.

> **Sources** — cahier des charges `JEB/DNI/2026-002` §2 à §4 ; courrier de Florine
> Pontaillac du 2026-09-01 09h41 ; backlog `US-01`…`US-22`
> (`spec technique/backlog-cartepro.csv`, 159 issues Linear `EPI-5`…`EPI-163`) ;
> maquette `Epitech/tek3/Web app design with Next.js/src/App.tsx` ; état réel de
> `apps/frontend` sur `main` au 2026-09-03.
>
> **Portée** — les 18 écrans des quatre espaces, le socle commun, le design system
> et les règles de rendu. Ce document ne décrit **aucun** code backend : il fige
> la forme des appels que le frontend fera, pas leur implémentation.
>
> **Hors portée** — contrats d'API (`packages/contracts`, `US-01-03`), schéma de
> base, endpoint SIRH `US-20`.
>
> **Maquettes** — la référence visuelle est la maquette d'origine,
> `Epitech/tek3/Web app design with Next.js/`. Elle fait foi : le design system
> de §5 en est la transcription, pas une proposition.

---

## 1. État des lieux

`apps/frontend` est un `create-next-app` avec un design system déjà amorcé
(PR `feat/init-shadcn`, mergée sur `main`). Rien de métier n'existe.

| Fichier                                  | Ce qu'il apporte                                                                             | Verdict                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `apps/frontend/package.json`             | Next `16.3.4`, React `19.2.8`, Tailwind `4`, `shadcn 4.19.1`, `radix-ui`, `@remixicon/react` | Gardé                                          |
| `apps/frontend/app/layout.tsx`           | `<html lang="fr">`, `LayoutProps<"/">`, variables de polices                                 | Gardé, complété (§4.1)                         |
| `apps/frontend/lib/fonts.ts`             | **Marianne** (8 graisses) + **Spectral** (8 graisses) en `next/font/local`                   | Gardé tel quel                                 |
| `apps/frontend/app/globals.css`          | Jeu de tokens shadcn complet, thème clair + sombre                                           | Gardé, **valeurs retouchées** (§5.2)           |
| `apps/frontend/components/ui/button.tsx` | Seul primitif installé                                                                       | Gardé                                          |
| `apps/frontend/next.config.ts`           | `output: 'standalone'`                                                                       | **À compléter** : `cacheComponents: true` (D4) |
| `apps/frontend/app/page.tsx`             | Page d'accueil du template Vercel                                                            | Remplacée (§6.1)                               |

Marianne et Spectral sont **les deux polices du Système de Design de l'État**. Le
choix a déjà été fait dans le dépôt ; ce document le prend comme acquis et en
tire les conséquences sur le reste du registre visuel (§5).

---

## 2. Décisions verrouillées

| #       | Décision                                                                                                                                                                                                  | Pourquoi                                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1**  | Une seule application Next.js pour les quatre espaces (public, `/me`, `/pro`, `/admin`), séparés par groupes de routes.                                                                                   | Déjà tranché le 2026-08-31. Un déploiement, un design system, deux semaines.                                                                                                                       |
| **D2**  | Le navigateur ne parle **jamais** à l'API directement. Toute lecture passe par un composant serveur, toute écriture par une server action.                                                                | `US-01-02` : pas de CORS, pas de jeton dans le bundle, la session reste dans un cookie `HttpOnly`.                                                                                                 |
| **D3**  | La maquette d'origine (`Web app design with Next.js/`) fait foi. Ses tokens, sa typographie, son bloc-marque et ses écrans sont repris tels quels.                                                        | Décision du 2026-09-03. Elle est déjà validée par l'équipe ; en redessiner une variante coûte du temps et rouvre un débat clos.                                                                    |
| **D4**  | `cacheComponents: true`. Chaque lecture est explicitement _mise en cache_, _streamée derrière `<Suspense>`_ ou _privée_.                                                                                  | Next 16 refuse de prérendre une route qui lit la requête hors `<Suspense>` : la contrainte force à trancher screen par screen (§3.5) au lieu de le découvrir en production.                        |
| **D5**  | Un montant n'est **jamais** formaté hors du composant `<Montant>`, une date jamais hors de `formatDate`. Deux règles ESLint le vérifient.                                                                 | `US-01-06`, `US-01-07`. L'exigence 1 du courrier juridique devient une propriété du code, pas une consigne de relecture.                                                                           |
| **D6**  | Aucune conversion en centimes. Les montants circulent en décimal, deux décimales, refusés au-delà.                                                                                                        | Correction du 2026-09-02 : `numeric` en base (`EPI-31`), validation à deux décimales (`EPI-39`).                                                                                                   |
| **D7**  | Français uniquement, pas de couche i18n. Les libellés d'un espace vivent dans un `content.ts` par espace.                                                                                                 | Une seule locale : `next-intl` coûterait une indirection sans bénéfice. Le fichier unique rend les formulations juridiques **greppables** — le courrier en impose la lettre en neuf endroits (§8). |
| **D8**  | `--radius: 4px`, aucune ombre, boutons en contour uniquement, pastilles de statut en pilule. DM Sans en interface, Spectral en texte courant, DM Mono pour les montants.                                  | Valeurs de `Web app design with Next.js/src/index.css`, transcrites sans arbitrage (D3).                                                                                                           |
| **D9**  | Le solde et l'historique ne sont **jamais** mis en cache de rendu. Ils streament derrière `<Suspense>` à chaque requête.                                                                                  | `US-05-06`. Un solde périmé affiché en grand est un défaut fonctionnel, pas une optimisation.                                                                                                      |
| **D10** | Le shell de tableau de bord (`@sidebar`, `@breadcrumb` en routes parallèles, `SidebarProvider`/`SidebarInset`) est repris de la structure DiscorAds, **sauf** l'espace `/me` qui n'a pas de fil d'Ariane. | Structure demandée. `/me` est plat (4 entrées, usage mobile) : un fil d'Ariane à un niveau est du bruit.                                                                                           |

---

## 3. Architecture

### 3.1 Arborescence des routes

```
apps/frontend/app/
├── layout.tsx                              <html lang="fr">, polices, thème
├── globals.css
├── not-found.tsx  error.tsx  forbidden.tsx pages système (US-01-08)
│
├── (public)/
│   ├── layout.tsx                          en-tête public + pied de page
│   ├── page.tsx                            /                 §6.1
│   ├── login/page.tsx                      /login            §6.2
│   ├── partners/
│   │   ├── page.tsx                        /partners         §6.3
│   │   └── [partnerId]/page.tsx            /partners/:id     §6.4
│   └── partner-signup/page.tsx             /partner-signup   §6.5
│
└── (protected)/
    ├── layout.tsx                          garde de session, shell (§4.1)
    ├── @sidebar/                           route parallèle — miroir des chemins
    │   ├── default.tsx
    │   ├── me/page.tsx  pro/page.tsx  admin/page.tsx
    │   └── …
    ├── @breadcrumb/                        idem, /pro et /admin seulement (D10)
    │   ├── default.tsx
    │   └── pro/… admin/…
    ├── me/
    │   ├── page.tsx                        /me               §6.6
    │   ├── history/page.tsx                /me/history       §6.7
    │   └── pay/page.tsx                    /me/pay           §6.8
    ├── pro/
    │   ├── layout.tsx                      bandeau de statut (US-11-07)
    │   ├── page.tsx                        /pro              §6.9
    │   ├── collect/page.tsx                /pro/collect      §6.10
    │   ├── account/page.tsx                /pro/account      §6.11
    │   └── partners/page.tsx               /pro/partners     §6.12
    └── admin/
        ├── page.tsx                        /admin            §6.13
        ├── partners/
        │   ├── page.tsx                    /admin/partners   §6.14
        │   └── [partnerId]/page.tsx        /admin/partners/:id §6.15
        ├── accounts/page.tsx               /admin/accounts   §6.16
        ├── allocations/page.tsx            /admin/allocations §6.17
        └── payments/page.tsx               /admin/payments   §6.18
```

Les espaces du frontend gardent leur préfixe de rôle (`/me`, `/pro`, `/admin`) :
ce sont des espaces d'interface, pas des routes d'API. Les routes d'API, elles,
ont perdu le leur le 2026-09-02 (`EPI-47`).

### 3.2 Découpage des dossiers

Repris de DiscorAds, transposé à Next 16.

| Dossier                                            | Contenu                                                                        | Règle                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------- |
| `lib/api/client.ts`                                | Instance `better-fetch` unique, base `/api`, cookies transmis, retente les 5xx | `US-01-04`                                        |
| `lib/api/routes/<ressource>/<verbe><Ressource>.ts` | Une fonction par endpoint, une seule                                           | **Aucun appel au client hors de ce dossier**      |
| `lib/api/routes/<ressource>/index.ts`              | Ré-export                                                                      | —                                                 |
| `lib/data/<ressource>.ts`                          | Couche serveur : directive de cache, mémoïsation, traduction code → navigation | `US-01-05`                                        |
| `lib/cache/tags/<ressource>.ts`                    | Constructeurs de clés de cache (`partnerTag(id)`)                              | Un fichier par ressource, `index.ts` de ré-export |
| `lib/safe-action.ts`                               | Client `next-safe-action`, traduction des erreurs métier                       | —                                                 |
| `app/**/actions/*.action.ts`                       | `'use server'`, schéma d'entrée, invalidation                                  | Colocalisé avec l'écran                           |
| `components/ui/`                                   | Primitifs shadcn, non modifiés sauf token                                      | Générés par `shadcn add`                          |
| `components/composites/`                           | Composants métier (`Montant`, `StatutBadge`, `QrCode`…)                        | §5.5                                              |
| `components/views/`                                | Pages d'état : `not-found`, `forbidden`, `error`, `offline`                    | Réutilisées par les fichiers système              |
| `content/<espace>.ts`                              | Libellés de l'espace                                                           | D7                                                |

Une page ou un composant qui importerait `lib/api/client` directement est un
défaut : la revue le refuse.

### 3.3 Frontière serveur / client

Par défaut tout est composant serveur. `'use client'` descend le plus bas
possible dans l'arbre. Les quatre seuls sous-arbres clients prévus :

| Sous-arbre                                 | Pourquoi il est client                       |
| ------------------------------------------ | -------------------------------------------- |
| Barre latérale (repli, sélection courante) | `useSelectedLayoutSegment`, état d'ouverture |
| Compte à rebours du jeton QR (`/me/pay`)   | `setInterval`, expiration à l'écran          |
| Scanner de QR (`/pro/collect`)             | `getUserMedia`, `BarcodeDetector`            |
| Formulaires à erreurs de champ             | `useActionState`                             |

Partout ailleurs, le motif est `page.tsx` (serveur, charge et compose) +
`page.client.tsx` (client, interactif) — la donnée descend en props, jamais un
handler ne remonte.

### 3.4 Couche d'accès aux données

Un écran n'appelle jamais `lib/api/routes/*` directement : il passe par
`lib/data/*`, qui porte la directive de cache et traduit les codes d'erreur en
comportement de navigation.

```ts
// apps/frontend/lib/data/partners.ts
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { listPartners, getPartner } from '@/lib/api/routes/partners';
import { PARTNERS_TAG, partnerTag } from '@/lib/cache/tags';

export async function loadPartners(query: PartnerQuery) {
  'use cache';
  cacheLife('hours');
  cacheTag(PARTNERS_TAG);

  const { data, error } = await listPartners(query);
  if (error) throw new Error(error);
  return data;
}

export async function loadPartner(partnerId: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(partnerTag(partnerId));

  const { data, error } = await getPartner(partnerId);
  if (error === 'partner_not_found') notFound();
  if (error) throw new Error(error);
  return data;
}
```

Trois règles :

1. Le web branche sur le **code** d'erreur, jamais sur le message (`US-01-05`).
2. `not_found` → `notFound()`, `forbidden` → `forbidden()`, `unauthenticated` →
   `redirect('/login')`. Aucun code HTTP ne remonte dans un écran.
3. Une lecture non cachable est enveloppée dans `cache()` de React pour la
   déduplication à l'intérieur d'un même rendu.

### 3.5 Rendu : ce qui est caché, streamé ou privé

`cacheComponents` (D4) impose de classer chaque lecture. Le tableau est la
spécification : une lecture absente de cette liste ne se code pas.

| Lecture                  | Directive                 | `cacheLife` | `cacheTag`              | Invalidée par                         |
| ------------------------ | ------------------------- | ----------- | ----------------------- | ------------------------------------- |
| Catalogue partenaires    | `use cache`               | `hours`     | `partners`              | décision d'instruction, mise en avant |
| Fiche partenaire         | `use cache`               | `hours`     | `partner:{id}`          | décision, mise à jour du profil       |
| Coup de cœur du Ministre | `use cache`               | `hours`     | `partners:featured`     | bascule de mise en avant              |
| Utilisateur courant      | `use cache: private`      | `minutes`   | —                       | déconnexion                           |
| **Solde**                | _aucune_ — `<Suspense>`   | —           | —                       | — (D9)                                |
| **Historique**           | _aucune_ — `<Suspense>`   | —           | —                       | — (D9)                                |
| Jeton de paiement        | _aucune_ — `connection()` | —           | —                       | —                                     |
| Statistiques partenaire  | `use cache`               | `minutes`   | `pro-stats:{partnerId}` | encaissement, annulation              |
| Statistiques nationales  | `use cache`               | `minutes`   | `stats:national`        | encaissement, abondement, annulation  |
| File d'instruction       | _aucune_ — `<Suspense>`   | —           | —                       | —                                     |
| Liste des comptes        | _aucune_ — `<Suspense>`   | —           | —                       | —                                     |

**Pourquoi le solde ne peut pas être caché.** `use cache` interdit `cookies()`
dans sa portée ; on pourrait extraire l'identifiant du portefeuille et le passer
en argument, mais la valeur cachée serait alors un montant d'argent périmé de
plusieurs minutes affiché en 48px. `use cache: private` ne règle rien : le cache
vit dans le navigateur, donc survit à un encaissement fait chez le partenaire.
Le solde se lit à chaque requête, derrière `<Suspense>`, et un petit composant
client le recharge au retour de visibilité de l'onglet (`US-05-06`).

**Pourquoi le catalogue peut l'être.** Il ne dépend d'aucun utilisateur, il change
quand l'administration prend une décision, et cette décision passe par une server
action qui appelle `updateTag('partners')`. Le catalogue entre donc dans la
coquille statique et se sert depuis le CDN.

### 3.6 Mutations

Toute écriture est une server action, validée par un schéma, encapsulée par
`next-safe-action`. `updateTag` est utilisé plutôt que `revalidateTag` partout où
l'utilisateur doit voir son propre effet immédiatement — c'est le cas de toutes
les actions ci-dessous sauf la mise en avant.

| Action               | Écran                 | Entrée                                                  | Invalidation                                | Suite                                    |
| -------------------- | --------------------- | ------------------------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `signIn`             | `/login`              | courriel, mot de passe                                  | —                                           | `redirect` vers l'espace du rôle         |
| `signOut`            | shell                 | —                                                       | —                                           | `redirect('/login')`                     |
| `registerPartner`    | `/partner-signup`     | raison sociale, SIREN, objet social, catégorie, adresse | `updateTag('partners')`                     | `redirect('/pro')`                       |
| `createPaymentToken` | `/me/pay`             | —                                                       | —                                           | retourne jeton + code court              |
| `collectPayment`     | `/pro/collect`        | charge utile ou code court, montant                     | `pro-stats:{id}`, `stats:national`          | affiche le reçu                          |
| `decideRegistration` | `/admin/partners/:id` | statut cible, motif **obligatoire**                     | `partners`, `partner:{id}`, `registrations` | reste sur la page, historique mis à jour |
| `toggleFeatured`     | `/admin/partners`     | partnerId, booléen                                      | `revalidateTag('partners:featured', 'max')` | —                                        |
| `setAccountStatus`   | `/admin/accounts`     | userId, statut, motif                                   | `accounts`                                  | —                                        |
| `previewAllocation`  | `/admin/allocations`  | employeur, montant                                      | —                                           | prévisualisation, aucun effet            |
| `applyAllocation`    | `/admin/allocations`  | jeton de prévisualisation                               | `stats:national`                            | compte rendu                             |
| `cancelPayment`      | `/admin/payments`     | paymentId, motif                                        | `stats:national`, `pro-stats:{id}`          | contre-écriture visible                  |

Chaque action revérifie la session et le rôle : une server action est joignable
par un `POST` direct, l'interface n'est pas une garde.

```ts
// apps/frontend/app/(protected)/admin/partners/[partnerId]/actions/decide.action.ts
'use server';

import { updateTag } from 'next/cache';
import { decideRegistration } from '@/lib/api/routes/registrations';
import { partnerTag, PARTNERS_TAG, REGISTRATIONS_TAG } from '@/lib/cache/tags';
import { requireRole } from '@/lib/auth/guard';
import { actionClient } from '@/lib/safe-action';
import { decisionSchema } from '../schemas/decision.schema';

export const decideRegistrationAction = actionClient
  .inputSchema(decisionSchema)
  .action(async ({ parsedInput }) => {
    await requireRole('admin');

    const { data, error } = await decideRegistration(parsedInput);
    if (error) throw new ApiError(error);

    updateTag(PARTNERS_TAG);
    updateTag(partnerTag(parsedInput.partnerId));
    updateTag(REGISTRATIONS_TAG);
    return data;
  });
```

### 3.7 Protection des espaces

Deux niveaux, l'un rapide, l'autre sûr — `US-04-08`.

```
proxy.ts                lit la présence du cookie de session, redirige vers /login.
                        Ne valide pas la session : pas de requête base en edge.
(protected)/layout.tsx  relit la session côté serveur et refuse le rendu hors rôle.
```

| Cas                              | Attendu                                      |
| -------------------------------- | -------------------------------------------- |
| `/admin` sans session            | `→ /login`                                   |
| `/admin` avec session salarié    | `→ /me`                                      |
| `/pro` avec session salarié      | `→ /me`                                      |
| Retour arrière après déconnexion | Rien de la page authentifiée n'est réaffiché |

La lecture de session vit **dans** une frontière `<Suspense>`, jamais au premier
niveau d'un layout : un `await` de session en tête de layout retiendrait
`{children}` derrière la requête et supprimerait toute coquille statique.

---

## 4. Le tableau de bord commun

### 4.1 Le shell

```tsx
// apps/frontend/app/(protected)/layout.tsx
export default function ProtectedLayout({
  children,
  sidebar,
  breadcrumb,
}: LayoutProps<'/'>) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        {breadcrumb}
        <main id="contenu">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

`sidebar` et `breadcrumb` sont deux **routes parallèles** (`@sidebar`,
`@breadcrumb`). Elles ont leur propre arbre de routes, calqué sur les chemins de
`(protected)`, et leur propre `default.tsx`. Conséquence utile : le fil d'Ariane
de `/admin/partners/:id` charge le nom du partenaire lui-même, sans que la page
ait à le lui passer, et streame indépendamment d'elle.

### 4.2 La barre latérale

Une seule barre, trois jeux d'entrées, construits déclarativement — le composant
ne connaît pas les rôles, il reçoit des groupes.

| Espace   | Entrées                                                                       | Note                                                                         |
| -------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/me`    | Mon portefeuille · Payer · Historique · Partenaires                           | « Payer » masqué si le portefeuille n'est pas actif (`US-05-05`)             |
| `/pro`   | Tableau de bord · Encaisser · Mon dossier · Partenaires                       | « Encaisser » **absent** tant que le partenaire n'est pas actif (`US-11-07`) |
| `/admin` | Tableau de bord · Dossiers partenaires · Comptes · Abondements · Transactions | Le nombre de dossiers en attente est affiché en pastille                     |

Sous `md`, la barre latérale devient une **barre d'onglets basse** (4 cibles max,
44px minimum) et l'en-tête passe en barre supérieure avec la marque JEB. Le shell
n'a donc pas de tiroir mobile : sur les trois espaces, la navigation tient en
quatre entrées ou moins pour `/me` et `/pro`, et `/admin` n'est pas un usage
mobile.

### 4.3 En-tête de page

Un seul composant, utilisé par les seize écrans : titre (`h1`, Marianne),
sous-titre facultatif (Spectral), zone d'actions à droite. Aucun écran ne
compose son titre à la main.

### 4.4 États système

| Fichier                        | Rôle                                                                      | `US`                |
| ------------------------------ | ------------------------------------------------------------------------- | ------------------- |
| `loading.tsx` par écran        | Squelette qui reprend la grille de l'écran, pas un spinner                | —                   |
| `error.tsx`                    | Erreur de rendu, bouton « réessayer »                                     | `US-01-08`          |
| `not-found.tsx`                | 404 dans le style de l'application                                        | `US-01-08`          |
| `forbidden.tsx`                | 403 explicite (mauvais rôle)                                              | `US-04-08`          |
| Bandeau hors ligne             | Apparaît sur perte de réseau, persistant                                  | `US-01-08`          |
| Résumé d'erreurs de formulaire | En tête de formulaire, focus déplacé dessus, `Erreur` ajouté au `<title>` | RGAA / motif GOV.UK |

---

## 5. Design system

### 5.1 Registre visuel

La maquette d'origine fait foi. Ce qui suit en est la transcription, pas une
proposition : les valeurs viennent de
`Web app design with Next.js/src/index.css` et de `src/App.tsx`.

| Règle                                         | Valeur                                                       |
| --------------------------------------------- | ------------------------------------------------------------ |
| Couleur d'action                              | `#1B3A6B`                                                    |
| Accent (destructif, déconnexion, obligatoire) | `#D93B3B`                                                    |
| Fond de page / carte                          | `#F5F5F3` / `#FFFFFF`                                        |
| Rayon                                         | `4px` (`--radius`), pastilles de statut en `rounded-full`    |
| Ombres                                        | aucune ; les cartes sont délimitées par `1px solid #DDE1EA`  |
| Bloc-marque                                   | bande tricolore + « République Française » + « CartePro »    |
| Boutons                                       | contour uniquement — aucun aplat de couleur primaire         |
| Focus                                         | `outline: 2px solid #1B3A6B`, `outline-offset: 2px`          |
| Largeur de contenu                            | `max-w-3xl`, barre latérale de 240px sur `md:`               |
| Statuts                                       | classes `.badge-pending` … `.badge-closed`, pastille + texte |

Ancienne version de cette section : un registre dérivé du DSFR avec une marque
propre au Ministère. Écartée le 2026-09-03 — la maquette existante est la
référence.

### 5.4 Primitifs à installer

`shadcn add` — seuls ceux réellement utilisés par un écran de ce document.

| Primitif                                                      | Écrans                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `sidebar`                                                     | shell                                                               |
| `breadcrumb`                                                  | `/pro`, `/admin`                                                    |
| `card`                                                        | tous                                                                |
| `table`                                                       | `/admin/*`, `/pro`                                                  |
| `badge`                                                       | statuts partout                                                     |
| `alert`                                                       | bandeaux de statut, mentions légales                                |
| `input`, `label`, `textarea`, `form`, `field`                 | `/login`, `/partner-signup`, `/pro/collect`, décision d'instruction |
| `select`                                                      | filtres de période                                                  |
| `tabs`                                                        | `/admin/partners`, `/me/history`                                    |
| `dialog`                                                      | confirmation d'annulation, application d'un abondement              |
| `sonner`                                                      | retours d'action                                                    |
| `skeleton`                                                    | `loading.tsx`                                                       |
| `pagination`                                                  | catalogue, transactions                                             |
| `chart`                                                       | `/pro`, `/admin`                                                    |
| `separator`, `avatar`, `tooltip`, `dropdown-menu`, `progress` | shell et divers                                                     |

### 5.5 Composants métier

| Composant                         | Contrat                                                                                                                                      | `US`                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `<Montant valeur variante signe>` | **Seul** formateur de somme. Format français, devise, mention « (simulation) » accolée. Refuse plus de deux décimales.                       | `US-01-06`, D5           |
| `<DateTexte valeur format>`       | `jour` \| `jourHeure` \| `relatif`, heure de Paris depuis un UTC                                                                             | `US-01-07`, D5           |
| `<StatutBadge statut>`            | Pastille + **libellé texte** + icône ; jamais la couleur seule                                                                               | `US-03-02`               |
| `<MouvementLigne>`                | Ligne d'écriture : sens, contrepartie, date, montant. Une contre-écriture d'annulation est **une ligne distincte**, jamais une modification. | `US-19-05`               |
| `<QrCode charge>`                 | Rendu SVG local du jeton, sans appel réseau à l'affichage                                                                                    | `US-07-07`               |
| `<QrScanner onCode>`              | `BarcodeDetector` si disponible, sinon saisie du code court                                                                                  | `US-13-06`               |
| `<CompteARebours expireA>`        | Barre + `mm:ss`, bascule en état expiré, `aria-live="polite"`                                                                                | `US-07-08`               |
| `<CourbeParJour>`                 | Série journalière, table de données équivalente accessible                                                                                   | `US-14-04`               |
| `<MentionSimulation>`             | Bandeau réutilisable pour les emplacements 1 à 6 du courrier (§8)                                                                            | Courrier §1              |
| `<CarteKpi>`                      | Sur-titre, valeur, précision                                                                                                                 | `/pro`, `/admin`         |
| `<CartePartenaire>`               | Initiale, raison sociale, adresse, catégorie, statut                                                                                         | catalogue et instruction |
| `<ResumeErreurs>`                 | Liste des erreurs en tête de formulaire, focus déplacé                                                                                       | RGAA                     |
| `<MarqueJeb>`                     | Marque du Ministère : cartouche `JEB` + barre tricolore, variantes normale et compacte                                                       | D3                       |

---

## 6. Les écrans

Format identique pour les seize : **route · rôle · données · rendu · actions ·
états · accessibilité**. « Rendu » reprend le classement de §3.5.

### 6.1 Accueil public — `/`

- **Rôle** : visiteur. **`US`** : `US-08-07`, `US-18-05`.
- **Données** : coup de cœur du Ministre (mis en avant), 6 partenaires récents,
  compteur de partenaires actifs.
- **Rendu** : entièrement `use cache` / `cacheLife('hours')`. Coquille statique
  complète, servie depuis le CDN.
- **Contenu** : bandeau de présentation du dispositif, section « Coup de cœur du
  Ministre » (3 cartes), aperçu du catalogue, deux appels à l'action (« Voir tous
  les partenaires », « Devenir partenaire »).
- **États** : aucun partenaire mis en avant → la section disparaît, la page ne
  laisse pas de trou.

### 6.2 Connexion — `/login`

- **Rôle** : anonyme. **`US`** : `US-04-07`.
- **Rendu** : statique ; seule la server action est dynamique.
- **Contenu** : marque JEB, `h1` « Connexion », courriel, mot de passe, bouton
  unique. Aucun sélecteur de rôle : **le rôle vient de la session**, pas d'un
  champ. La maquette en propose un ; il est écarté — un sélecteur laisse croire
  qu'on peut choisir son espace.
- **Actions** : `signIn` → `redirect` vers `/me`, `/pro` ou `/admin`.
- **États** : identifiants invalides → un seul message, pas de distinction entre
  courriel inconnu et mot de passe faux. Compte suspendu → message dédié avec le
  motif. Erreurs listées dans `<ResumeErreurs>`, focus déplacé, `<title>`
  préfixé « Erreur — ».

### 6.3 Catalogue — `/partners`

- **Rôle** : visiteur et salarié. **`US`** : `US-08-07`, `US-08-08`.
- **Données** : partenaires **actifs** paginés, catégories.
- **Rendu** : `use cache` sur la liste, avec les paramètres de recherche dans la
  clé de cache. Pagination et filtres portés par l'URL (`?q=`, `?categorie=`,
  `?page=`), pas par un état client.
- **Contenu** : champ de recherche, puces de catégorie, liste de
  `<CartePartenaire>`, pagination.
- **États** : aucun résultat → texte explicite plus bouton « effacer les
  filtres ». Bouton « autour de moi » (MVP) → demande la géolocalisation ; refus
  du navigateur = message, pas d'écran vide.
- **Accessibilité** : les puces de catégorie sont un groupe de boutons à état
  `aria-pressed`, pas des liens ; le nombre de résultats est annoncé en
  `aria-live`.

### 6.4 Fiche partenaire — `/partners/:id`

- **`US`** : `US-08-09`. **Rendu** : `use cache`, `cacheTag('partner:{id}')`.
- **Contenu** : raison sociale, catégorie, objet social, adresse, statut,
  `<MarqueJeb>` absent. Un partenaire non actif renvoie `notFound()` : le
  catalogue public n'expose pas les dossiers en instruction.

### 6.5 Inscription partenaire — `/partner-signup`

- **`US`** : `US-11-05`. **Rendu** : statique + server action.
- **Champs** : raison sociale, **SIREN** (9 chiffres, contrôle de forme et clé de
  Luhn côté client, revérifié côté serveur), **objet social** (texte long),
  catégorie, adresse, ville, courriel, mot de passe.
- **Pourquoi ces deux champs sont obligatoires** : exigence 3 du courrier du
  01/09 — une validation sans critère documenté n'est pas opposable.
- **États** : SIREN mal formé → message sous le champ **et** dans le résumé.
  SIREN déjà déposé → message dédié. Succès → `redirect('/pro')`, où le bandeau
  de statut prend le relais.
- **Accessibilité** : une question par bloc, libellé lié au champ, aide
  persistante (pas un `placeholder`), erreurs en `aria-describedby`.

### 6.6 Portefeuille salarié — `/me`

- **`US`** : `US-05-05`, `US-05-06`, `US-18-05`. **Écran principal du POC.**
- **Rendu** : coquille (en-tête, actions, mentions) statique ; **solde et dernier
  mouvement streamés** derrière `<Suspense>` avec un squelette (D9). Le coup de
  cœur est `use cache`.
- **Contenu** : carte de solde (montant en 48px via `<Montant variante="grande">`,
  filet tricolore à gauche, horodatage de lecture), deux actions (« Générer un
  code », « Trouver un partenaire »), quatre derniers mouvements, bloc explicatif
  « votre employeur crédite votre portefeuille ».
- **États** :
  - solde à zéro → phrase explicative, pas un « 0,00 € » nu ;
  - portefeuille suspendu ou clôturé → « Générer un code » **absent** (pas
    désactivé), bandeau avec le motif ;
  - aucun mouvement → texte, pas une carte vide.
- **Fraîcheur** : un composant client relance le chargement au retour de
  visibilité de l'onglet. Aucune connexion permanente.

### 6.7 Historique — `/me/history`

- **`US`** : `US-06-03`, `US-06-04`, `US-19-05`.
- **Rendu** : streamé, jamais caché (D9). Période et page dans l'URL.
- **Contenu** : sélecteur de période (30 jours, 3 mois, personnalisé), mouvements
  **groupés par jour**, `<MouvementLigne>` par écriture, chargement par page.
- **Règle** : une **annulation** apparaît comme une ligne de contre-écriture avec
  son motif, la ligne d'origine reste intacte. Le registre ne se réécrit pas.
- **Accessibilité** : la liste est un `<ul>` par journée, les en-têtes de journée
  sont des `<h2>`, pas des `<div>` stylés.

### 6.8 Payer — `/me/pay`

- **`US`** : `US-07-08`. **Rendu** : `connection()` puis génération ; jamais
  caché, jamais prérendu.
- **Contenu** : compte à rebours (barre + `mm:ss`), QR en SVG, **code court à
  saisie manuelle** en gros caractères espacés, rappel du solde, phrase « le
  montant est saisi par le partenaire ».
- **États** : expiré → voile sur le QR, bouton « Générer un nouveau code ». Un
  seul jeton vivant par compte : générer remplace le précédent.
- **Hors ligne** : une fois affiché, le QR reste scannable sans réseau — la
  charge est autoporteuse (§2.2 du cahier des charges). Le bandeau hors ligne
  n'empêche pas l'écran de fonctionner ; il empêche seulement la régénération.
- **Accessibilité** : le compte à rebours est en `aria-live="polite"` avec une
  annonce à 60s et à l'expiration, pas à chaque seconde. Le code court est
  lisible et copiable ; il est l'équivalent textuel du QR.

### 6.9 Tableau de bord partenaire — `/pro`

- **`US`** : `US-14-05`, `US-11-07`.
- **Rendu** : trois `<CarteKpi>` et la courbe en `use cache` (`minutes`, clé =
  partenaire + période) ; la liste des derniers encaissements streamée.
- **Contenu** : nom de l'établissement et `<StatutBadge>` en en-tête,
  encaissements du jour / volume du jour / volume du mois, `<CourbeParJour>`,
  cinq derniers encaissements, lien vers le dossier.
- **Règle** : **aucune identité de salarié n'apparaît** — ni nom, ni matricule,
  ni identifiant de portefeuille. Un encaissement affiche date, heure, mode (QR
  ou code) et montant. C'est une contrainte de minimisation, pas un choix
  d'affichage.
- **États** : partenaire non actif → le layout `/pro` affiche un bandeau avec le
  statut et le motif, retire « Encaisser » de la navigation, et la page se limite
  au rappel du dossier.

### 6.10 Encaisser — `/pro/collect`

- **`US`** : `US-13-07`, `US-13-06`. **Écran le plus sensible.**
- **Rendu** : entièrement dynamique.
- **Parcours** : saisir le montant → scanner le QR **ou** saisir le code court →
  écran de confirmation → validation → reçu.
- **Contenu** : champ montant (deux décimales, D6), zone de scan avec repli
  clavier, récapitulatif avant validation, reçu après.
- **États d'erreur, tous distincts** :

  | Cas                  | Message                                                                 | Suite             |
  | -------------------- | ----------------------------------------------------------------------- | ----------------- |
  | Jeton expiré         | « Ce code a expiré. Demandez-en un nouveau. »                           | retour au scan    |
  | Jeton déjà utilisé   | « Ce code a déjà été encaissé. »                                        | retour au scan    |
  | Solde insuffisant    | montant demandé **et** solde disponible, tous deux avec la mention (§8) | retour au montant |
  | Partenaire non actif | l'écran n'est pas atteignable (navigation)                              | —                 |
  | Caméra refusée       | bascule sur la saisie du code court, sans blocage                       | —                 |

- **Irréversibilité** : après validation, le reçu ne propose **aucune** action de
  modification ou d'annulation. Seule l'administration annule, par contre-écriture
  (§6.18).
- **Accessibilité** : le scanner n'est jamais le seul chemin ; la saisie du code
  court est un champ de formulaire ordinaire, atteignable au clavier.

### 6.11 Mon dossier partenaire — `/pro/account`

- **`US`** : `US-11-06`.
- **Contenu** : deux cartes — identité de l'entreprise (raison sociale, SIREN,
  objet social, catégorie) et coordonnées (adresse, ville, date de dépôt) ;
  puis **l'historique des décisions**, chaque entrée montrant la transition
  (`<StatutBadge>` → `<StatutBadge>`), le motif écrit, l'agent et la date.
- **Règle** : SIREN et statut ne sont pas modifiables. Le partenaire refusé voit
  **le motif intégral** — c'est la démonstration demandée par le courrier
  (exigence 3).

### 6.12 Catalogue dans l'espace partenaire — `/pro/partners`

- **`US`** : `US-08-10`. Réutilise le composant de §6.3, dans le shell `/pro`.
  Aucun code d'écran nouveau : un seul composant de catalogue, deux hôtes.

### 6.13 Tableau de bord national — `/admin`

- **`US`** : `US-17-03`.
- **Rendu** : `use cache` (`minutes`, `cacheTag('stats:national')`).
- **Contenu** : volume total, nombre de transactions, partenaires actifs,
  dossiers en attente ; courbe du volume par jour ; répartition géographique
  (liste de villes ordonnée, pas une carte — une carte coûte une dépendance et
  n'ajoute rien à la démonstration) ; raccourci vers les dossiers en attente.

### 6.14 Dossiers partenaires — `/admin/partners`

- **`US`** : `US-12-07`, `US-18-06`.
- **Rendu** : streamé. Filtre de statut dans l'URL.
- **Contenu** : quatre compteurs (en attente, actifs, refusés, total), onglets de
  statut avec compteur, table des dossiers (raison sociale, SIREN, ville,
  catégorie, statut, ancienneté), bascule « mise en avant » sur les actifs.
- **Défaut** : l'onglet **« En attente »** est l'onglet ouvert par défaut. C'est
  la file de travail de l'agent.

### 6.15 Instruction d'un dossier — `/admin/partners/:id`

- **`US`** : `US-12-07`. Écran central de l'exigence 3 du courrier.
- **Contenu** : à gauche le dossier complet (raison sociale, SIREN, objet social,
  catégorie, adresse, date de dépôt) ; à droite le panneau de décision et
  l'historique.
- **Panneau de décision** : deux choix exclusifs (Accepter / Refuser), puis un
  **motif obligatoire** en texte libre. Le bouton reste désactivé tant que le
  motif est vide. Sous le champ : « Ce motif est conservé et transmis au
  partenaire. »
- **Règle** : la décision est possible seulement depuis « en attente ». Une
  suspension ou une clôture ultérieure passe par `/admin/accounts`.
- **Historique** : chaque décision, sa transition, son motif, son agent, sa date.
  Rien n'y est modifiable.

### 6.16 Comptes — `/admin/accounts`

- **`US`** : `US-15-05`.
- **Contenu** : table des comptes (courriel, rôle, statut, création), filtres par
  rôle et statut, action « changer le statut » en dialogue avec **motif
  obligatoire**.
- **Règle** : effet immédiat. La session de la personne suspendue ne survit pas ;
  l'écran le dit explicitement avant confirmation.

### 6.17 Abondements — `/admin/allocations`

- **`US`** : `US-16-06`.
- **Parcours en deux temps** : choisir l'employeur et le montant → **prévisualiser**
  (nombre de portefeuilles concernés, total, portefeuilles exclus et pourquoi) →
  appliquer.
- **Règle** : la prévisualisation n'écrit rien. L'application est idempotente
  côté API ; l'interface le reflète en désactivant le bouton après envoi et en
  affichant le compte rendu (crédités / ignorés).
- **Mention** : le total prévisualisé porte la mention de simulation.

### 6.18 Transactions — `/admin/payments`

- **`US`** : `US-19-04`, `US-19-05`.
- **Contenu** : table des paiements (date, partenaire, montant, mode, état),
  filtres par période et partenaire, action « annuler ».
- **Annulation** : dialogue avec **motif obligatoire**, avertissement explicite
  que l'opération crée une **contre-écriture** et ne supprime rien. Après
  validation, la ligne d'origine reste, une ligne d'annulation apparaît, liée.
- **Point ouvert** : `EPI-24` — l'annulation par l'administration heurte
  l'irréversibilité annoncée au §3.2 du cahier des charges. L'écran est spécifié,
  l'arbitrage juridique ne l'est pas (§11, `O3`).

---

## 7. Accessibilité — RGAA AA

Exigence 4 du courrier du 01/09. `US-03-01`, `US-03-02`, `US-03-03`.

| Règle                                                  | Mise en œuvre                                                                               | Vérifiée par     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| Lien d'évitement vers le contenu                       | Premier élément focusable du shell, cible `#contenu`                                        | Test de rendu    |
| Repères de page                                        | `header`, `nav`, `main`, `aside`, `footer` natifs                                           | Audit automatisé |
| Focus visible partout                                  | Halo externe 2px, jamais supprimé                                                           | Revue + audit    |
| Contraste ≥ 4,5:1 (texte), ≥ 3:1 (composants)          | Palette §5.2 contrôlée avant usage                                                          | Audit            |
| Cibles ≥ 44×44px sur mobile                            | Hauteurs minimales dans les primitifs                                                       | Revue            |
| L'information n'est jamais portée par la seule couleur | `<StatutBadge>` porte pastille **et** libellé **et** icône                                  | `US-03-02`       |
| Erreurs de formulaire                                  | Résumé en tête, focus déplacé, `<title>` préfixé « Erreur — », `aria-describedby` par champ | Motif GOV.UK     |
| Contenu dynamique annoncé                              | `aria-live="polite"` sur le compte à rebours, le nombre de résultats, les retours d'action  | Revue            |
| Tableaux de données                                    | `<table>` avec `<th scope>`, jamais une grille de `div`                                     | Revue            |
| Graphiques                                             | Table de données équivalente sous chaque graphique                                          | `US-14-04`       |
| Langue                                                 | `lang="fr"` sur `<html>`                                                                    | Déjà en place    |

Un audit automatisé (`axe`) tourne sur le shell, `/`, `/me` et `/pro/collect`,
sans violation sérieuse. Il ne remplace pas la déclaration d'accessibilité, qui
est un livrable séparé (`US-10`).

---

## 8. Mention de simulation

Exigence 1 du courrier du 01/09. La conseillère nomme **neuf emplacements** et
demande **une capture par emplacement, prise sur l'application qui tourne**.
Le tableau ci-dessous est le plan de preuve.

| #   | Emplacement (mot pour mot)                        | Écran                                                                       | Porté par                                                            |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | l'écran de solde                                  | `/me`                                                                       | `<Montant>` + `<MentionSimulation>`                                  |
| 2   | l'historique                                      | `/me/history`                                                               | `<Montant>` sur chaque ligne                                         |
| 3   | l'écran de génération du QR code                  | `/me/pay`                                                                   | rappel de solde + mention                                            |
| 4   | l'écran de validation côté partenaire             | `/pro/collect`                                                              | montant saisi et reçu                                                |
| 5   | le tableau de bord financier du partenaire        | `/pro`                                                                      | KPI et courbe                                                        |
| 6   | le tableau de bord national                       | `/admin`                                                                    | KPI et courbe                                                        |
| 7   | les messages d'erreur qui citent un montant       | `/pro/collect` (solde insuffisant), `/admin/allocations` (prévisualisation) | le message **compose `<Montant>`**, il n'interpole jamais une chaîne |
| 8   | le titre des pages                                | les 16                                                                      | fonction unique de métadonnées, suffixe « (simulation) »             |
| 9   | tout document ou export produit par l'application | export CSV des transactions                                                 | en-tête du fichier                                                   |

Deux conséquences de code, non négociables :

- `<Montant>` colle la mention **à l'intérieur** du composant. Un montant sans
  mention est impossible à produire sans contourner la règle ESLint (D5).
- Le titre passe par une seule fonction :

```ts
// apps/frontend/lib/metadata.ts
export function titre(page: string): Metadata {
  return { title: `${page} — CartePro (simulation)` };
}
```

Un test parcourt les seize routes et vérifie la présence de « (simulation) »
dans le titre. Le point 9 n'existe que si l'export CSV est livré ; sinon il est
déclaré comme tel dans la réponse au cabinet — le courrier accepte explicitement
un emplacement non applicable _à condition qu'il soit signalé et expliqué_.

---

## 9. Tests

| Niveau        | Portée                                                                                                                           | Outil                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Rendu         | `<Montant>` (mention, deux décimales, signe), `<DateTexte>` (UTC → Paris, changement d'heure), `<StatutBadge>` (libellé présent) | Vitest + Testing Library |
| Rendu d'écran | `/me` avec solde, à zéro, suspendu ; `/pro` actif et non actif ; `/admin/partners/:id` motif vide → bouton désactivé             | Vitest                   |
| Lint          | `Intl.NumberFormat` avec `style: currency` et `toFixed` hors `<Montant>` ; `toLocaleDateString` hors `formatDate`                | Règle ESLint locale      |
| Types         | Un appel vers une route absente du schéma ne compile pas                                                                         | `tsc`                    |
| Navigation    | `/admin` sans session → `/login` ; session salarié → `/me`                                                                       | Test d'intégration       |
| Accessibilité | Shell, `/`, `/me`, `/pro/collect` sans violation sérieuse                                                                        | `axe`                    |
| Métadonnées   | Les 16 titres contiennent « (simulation) »                                                                                       | Vitest                   |

---

## 10. Lots

L'ordre suit les jalons du backlog : la revue du vendredi (PoC) puis la revue
technique du jeudi (MVP).

| Lot     | Contenu                                                                                                         | `US`                            | Jalon |
| ------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----- |
| **F-A** | Socle : client typé, couche `lib/data`, `<Montant>`, `<DateTexte>`, pages système, métadonnées, base accessible | `US-01`, `US-03`                | PoC   |
| **F-B** | `/login`, protection des espaces, shell des trois espaces                                                       | `US-04`                         | PoC   |
| **F-C** | `/me`, `/me/history`                                                                                            | `US-05`, `US-06`                | PoC   |
| **F-D** | `/me/pay` + `<QrCode>`                                                                                          | `US-07`                         | PoC   |
| **F-E** | `/`, `/partners`, `/partners/:id`                                                                               | `US-08`                         | PoC   |
| **F-F** | `/partner-signup`, `/pro/account`, bandeau de statut `/pro`                                                     | `US-11`                         | MVP   |
| **F-G** | `/admin/partners`, `/admin/partners/:id`                                                                        | `US-12`                         | MVP   |
| **F-H** | `/pro/collect` + `<QrScanner>`                                                                                  | `US-13`                         | MVP   |
| **F-I** | `/pro`, `<CourbeParJour>`                                                                                       | `US-14`                         | MVP   |
| **F-J** | `/admin/accounts`, `/admin/allocations`, `/admin`, `/admin/payments`                                            | `US-15`…`US-19`                 | MVP   |
| **F-K** | Coup de cœur, `/pro/partners`, audit d'accessibilité                                                            | `US-18`, `US-08-10`, `US-03-03` | MVP   |

`F-A` et `F-B` sont chaînés ; `F-C` à `F-E` sont parallélisables une fois `F-B`
mergé. `F-H` dépend de `F-D` (format du jeton) et de `F-F` (statut actif).

---

## 11. Décisions ouvertes

| #      | Question                                                                                                 | Ce qui bloque                                                                                                                     | Qui tranche                  |
| ------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **O1** | Le TTL du QR reste-t-il à 5 min (cahier des charges §2.2) ou passe-t-il à 30 min (demande du Ministre) ? | L'écran `/me/pay` est identique, seule la constante change ; mais 30 min affaiblit l'argument « usage unique et court »           | Équipe + Ministre (`EPI-14`) |
| **O2** | Mode dégradé côté partenaire (file locale, fenêtre de grâce)                                             | Laissé en suspens le 2026-08-31. `/pro/collect` est spécifié **sans**. L'ajout est additif.                                       | Nolan                        |
| **O3** | L'annulation administrative (`/admin/payments`) contredit l'irréversibilité du §3.2                      | Écran spécifié, procédure juridique non                                                                                           | Cabinet (`EPI-24`)           |
| **O4** | Export CSV des transactions                                                                              | Détermine si l'emplacement 9 de §8 existe ou est déclaré non applicable                                                           | Nolan, avant vendredi 12h00  |
| **O5** | Les routes `/pro/*` gardent-elles leur préfixe de rôle côté API ?                                        | Sans effet sur les écrans, seulement sur `lib/api/routes`                                                                         | Équipe                       |
| **O6** | Recherche géographique « autour de moi » (`US-08-08`)                                                    | Géolocalisation navigateur seule, ou coordonnées en base ? La première est livrable en une heure, la seconde ouvre le modèle gelé | Nolan                        |

---

## 12. Sources

**Projet**

- Cahier des charges `JEB/DNI/2026-002`, `Epitech/tek3/brief_cartepro.pdf` — §2.2 QR, §3.1 auth, §3.2 transactions, §3.4 catalogue.
- Courrier de Florine Pontaillac, 2026-09-01 09h41, `[JEB/DNI/2026-002] Exigences juridiques applicables au dispositif CartePro` — exigences 1 à 4, échéance vendredi 12h00.
- Backlog `spec technique/backlog-cartepro.csv` et `spec technique/issues-linear-cartepro.md` — `US-01`…`US-22`, jalons PoC / MVP.
- Maquette `Epitech/tek3/Web app design with Next.js/src/App.tsx` — neuf vues, palette, motifs de carte de solde et de panneau de décision.

**Design**

- [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr) — fondamentaux : couleurs, typographie Marianne et Spectral, échelle `v`, coins carrés, RGAA AA.
- [`betagouv/dsfr-design-md`](https://github.com/betagouv/dsfr-design-md) — jetons DSFR v1.14 lisibles par machine : couleurs système `#18753C` / `#B34000` / `#CE0500` / `#0063CB`, halo de focus `#0A76F6`, largeur de contenu `78rem`.
- [`GouvernementFR/dsfr`](https://github.com/GouvernementFR/dsfr) — source du système.
- [GOV.UK Design System — Question pages](https://design-system.service.gov.uk/patterns/question-pages/) et [Notification banner](https://design-system.service.gov.uk/components/notification-banner/) — motif du résumé d'erreurs et de la bannière de statut.
- [One thing per page](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/), Design in government — découpage du formulaire d'inscription partenaire.
- Mobbin — motifs de tableau de bord repris : [Wise](https://mobbin.com/screens/d104a8bc-bc31-484d-80e8-2c9a2cb1e796) (solde en tête + actions), [Klarna](https://mobbin.com/screens/dd9d36fe-0716-4233-b638-c78c96afa6e8) (solde centré, mouvements groupés par jour), [Upwork](https://mobbin.com/screens/87c3379b-2f64-40fd-b0d6-bbf30afd8985) (rangée de KPI + table de transactions), [Deputy](https://mobbin.com/screens/a73951e3-5683-46ac-99bf-2b13b79343c5) (onglets de statut avec compteurs), [Lyssna](https://mobbin.com/screens/8618fcfc-b609-43f5-b08a-b51c77e57cbf) (file d'instruction filtrée).

**Technique**

- Next.js 16.3.4, documentation embarquée dans `apps/frontend/node_modules/next/dist/docs/01-app/` :
  `01-getting-started/08-caching.md` (`use cache`, PPR, coquille statique),
  `01-getting-started/09-revalidating.md` (`cacheLife`, `cacheTag`, `updateTag` vs `revalidateTag`),
  `01-getting-started/07-mutating-data.md` (server actions, `POST` direct),
  `02-guides/authentication-with-cache-components.md` (`use cache: private`, session hors du haut de layout),
  `02-guides/forms.md` (`useActionState`).
- Structure de tableau de bord reprise de `DiscorAds/frontend` : routes parallèles `@sidebar` / `@breadcrumb`, `lib/api/routes/*`, `lib/cache/tags/*`, `next-safe-action`, découpage `page.tsx` / `page.client.tsx`.
