# RULE : Une constante exportée par un module `'use client'` n'est PAS une valeur côté serveur — c'est une référence client ; les clés partagées vivent dans un module sans directive

## Contexte

Catalogue des partenaires (`app/(protected)/me/partners/`). Les noms des paramètres
d'URL (`q`, `category`) étaient exportés depuis `page.client.tsx` (fichier `'use client'`)
et importés par `page.tsx` (composant serveur) pour lire `searchParams[PARTNERS_SEARCH_PARAM]`.

Symptôme : le serveur loggait bien `{ q: 'lyon', category: 'culture-loisirs' }`, mais la
page rendait toujours le catalogue complet, la puce « Tous » pressée et la recherche vide.
Aucune erreur, aucun avertissement.

## Erreur commise

Avoir importé une **valeur** (deux chaînes) depuis un module `'use client'` dans un
composant serveur, et l'avoir utilisée comme clé d'objet. Côté serveur, l'export d'un
module client est une **référence client** (un objet opaque destiné au bundle), pas la
chaîne `'q'`. `params[ref]` valait donc `undefined`, silencieusement coercé en `''`.

## Cause racine

La frontière `'use client'` s'applique à **tout** ce que le module exporte, pas seulement
aux composants. Un composant serveur qui importe ce module reçoit des proxys sérialisables
vers le client. Ça marche pour un composant (React sait le monter côté client) et casse
pour une constante, sans message parce qu'un objet utilisé comme clé devient
`"[object Object]"` ou `undefined` selon le chemin.

## Règle à appliquer

1. **Un module `'use client'` n'exporte que des composants et des hooks.** Constantes,
   types-valeurs, helpers partagés entre le serveur et le client vivent dans un module
   **sans directive** (`search-params.ts`, `constants.ts`), importé des deux côtés.
2. **Quand une page serveur et sa page client partagent une clé** (paramètre d'URL, nom de
   champ, identifiant de slot), la clé est définie **une fois**, dans ce module neutre —
   jamais dans `page.client.tsx`.
3. **Symptôme à reconnaître** : une donnée correcte dans les logs serveur et un rendu qui
   se comporte comme si elle était vide → chercher un import depuis un fichier
   `'use client'` avant de soupçonner le cache ou le routeur.
4. **Vérifier une lecture de `searchParams` par une requête réelle avec paramètres**, pas
   seulement sans : la variante sans paramètres rend la même chose dans les deux cas et
   ne peut pas révéler le défaut.

## Exemple

- ❌ **Avant (incorrect)** :
  ```ts
  // page.client.tsx ('use client')
  export const PARTNERS_SEARCH_PARAM = 'q';
  // page.tsx (serveur)
  import { PARTNERS_SEARCH_PARAM } from './page.client'; // référence client, pas 'q'
  const search = params[PARTNERS_SEARCH_PARAM]; // undefined
  ```
- ✅ **Après (correct)** :
  ```ts
  // search-params.ts (aucune directive)
  export const PARTNERS_SEARCH_PARAM = 'q';
  // page.tsx et page.client.tsx importent tous deux './search-params'
  ```
