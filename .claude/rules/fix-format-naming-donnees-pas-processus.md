# RULE : Les artefacts structurels se nomment d'après la DONNÉE / le DOMAINE qu'ils servent, jamais d'après un processus ou du jargon

## Contexte

Trois corrections de naming par l'utilisateur sur le même chantier (parcours rejoindre v3) :

1. `party_note` → entité **`Note`** (préfixe module redondant).
2. `PushCopy` / `push-copy.constants.ts` → **`PushMessage`** (« copy » = jargon marketing
   anglophone, opaque pour le lecteur).
3. `FeedHydrationRepo` / `feed-hydration.repo.ts` → **`FeedItemRepo`** (« hydration » est un
   **processus de couche service**, pas une donnée ; l'utilisateur : « ça n'a aucun sens…
   il faut des naming cohérents »).

## Erreur commise

Nommer des artefacts structurels (repo, constantes, entité) d'après **le processus qui les
utilise** ou du **jargon** (hydration, copy) au lieu de la **donnée ou du concept métier
qu'ils représentent**. Cas 3 aggravé : le repo a été nommé par symétrie avec le helper
existant (`feed-hydration.helper.ts`) — la cohérence locale avec un voisin a primé sur la
sémantique de la couche.

## Cause racine

Le nom a été dérivé du **point de vue de l'appelant** (« ce repo sert l'hydratation ») au
lieu du point de vue de la couche elle-même (« ce repo lit des feed items »). Un repo ne
sait pas qui le consomme ; son nom ne doit pas encoder l'usage.

## Règle à appliquer

1. **Un `*.repo.ts` se nomme d'après la donnée qu'il sert** (`<entity>.repo.ts` — l'entité
   peut être une entité ORM ou une entité de read-model, ex. `feed-item.repo.ts` qui lit les
   lignes derrière `FeedItemDto`). Jamais d'après un processus (`hydration`, `mapping`,
   `enrichment`, `sync`) ni d'après son consommateur.
2. **Les noms de processus sont réservés aux artefacts de processus** : un helper/service qui
   orchestre une hydratation peut s'appeler `feed-hydration.helper.ts` — c'est correct pour
   LUI, car il EST le processus. La symétrie helper↔repo ne se fait pas sur le nom du
   processus mais sur la donnée : `feed-hydration.helper.ts` consomme `feed-item.repo.ts`.
3. **Zéro jargon dans les noms** (copy, hydration, payload, blob…) quand un terme du domaine
   existe : `message`, `item`, `zone`, `device`. Test : un dev qui découvre le repo doit
   comprendre le contenu du fichier depuis son nom, sans connaître le pipeline.
4. Rappels cumulés des corrections précédentes : pas de préfixe module redondant
   (`Note`, pas `PartyNote`, dans `party/note/`) ; suffixe = rôle de couche
   (`.repo`, `.helper`, `.service`), jamais un rôle inventé.

## Exemple

- ❌ **Avant (incorrect)** : `repos/feed-hydration.repo.ts` (`FeedHydrationRepo`) — nommé
  d'après le processus appelant ; `push-copy.constants.ts` (`PushCopy`) — jargon.
- ✅ **Après (correct)** : `repos/feed-item.repo.ts` (`FeedItemRepo`) — nommé d'après la
  donnée servie ; `push-message.constants.ts` (`PushMessage`) — terme du domaine.
