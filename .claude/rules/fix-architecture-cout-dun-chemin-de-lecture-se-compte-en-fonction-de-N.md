# RULE : Le coût d'un chemin de lecture se COMPTE en fonction de N avant d'être livré — batch obligatoire, et jamais relire ce qu'une jointure a déjà chargé

## Contexte

Audit des lectures du domaine soirée (2026-08-27). Deux chemins servent la même donnée
(une soirée, son organisateur, sa cover) avec deux ordres de grandeur d'écart, mesurés :

| Chemin                                       | Requêtes SQL                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /feed` (page rankée ou `?ids=`)         | **4, quel que soit N** — le repo transverse joint tout en une passe                                                                        |
| `GET /party` / `GET /party/participation/me` | **3 × N** — `toResponses` boucle `toResponse`, qui par soirée appelle `listHydrated` (co-organisateurs), `getPlaybackUrl` et `getCoverUrl` |

Sur une liste de 20 soirées : 4 requêtes d'un côté, une soixantaine de l'autre.

Pire, deux des trois requêtes par soirée relisaient une ligne **déjà en mémoire** :
`resolvePlaybackUrl`/`resolveCoverUrl` passaient un identifiant à `AssetService`, qui
refaisait un `findByIdOrThrow` sur le `MediaAsset` que le repo party venait de charger par
sa jointure (`defaultRelations = ['video','cover','organizer']`).

En parallèle, côté client, deux appels compensatoires sont apparus faute de champs :
un `GET /party/:id` **complet par carte de feed affichée** pour en extraire deux chaînes,
et le téléchargement de la file entière des demandes pour n'en garder que la longueur.

## Erreur commise

Avoir livré et étendu des chemins de lecture sans jamais **compter les requêtes en fonction
de N**. Le N+1 ne se voit pas : chaque appel isolé est correct, la boucle est un
`Promise.all` qui a l'air parallèle, et les tests d'intégration passent — ils vérifient le
contenu, pas le nombre d'allers-retours.

Aggravant : avoir raisonné sur le nombre d'_endpoints_ appelés par un écran (« 4 requêtes »)
en ignorant leur coût unitaire et leur **sérialisation**, alors que c'est là que se joue la
latence perçue.

## Cause racine

Le coût d'un chemin de lecture est une propriété **du chemin entier**, jamais visible depuis
un seul fichier. `toResponse` a l'air d'un mapper ; c'est trois requêtes. `getCoverUrl(id)`
a l'air d'un accesseur ; c'est un `SELECT`. Une projection qui appelle un service par ligne
est un N+1 déguisé en composition propre.

Second facteur : un champ manquant dans un payload ne coûte rien **au serveur** — il coûte
une requête **au client**, et cette requête-là n'apparaît dans aucune métrique backend.

## Règle à appliquer

1. **Avant de livrer ou d'étendre un chemin de lecture, compter les requêtes SQL en fonction
   de N** (le nombre de lignes rendues) et l'écrire dans la PR. Une composante qui grandit
   avec N est un finding, pas un détail.
2. **Aucun `await` vers un service ou un repo à l'intérieur d'un `map`/d'une boucle de
   projection.** Toute résolution transverse (identités, follows, hashtags, compteurs,
   co-organisateurs) se collecte sur **toute la réponse** puis se résout en **un** appel
   groupé. `findSummaries`, `getFollowedAmong`, `getFollowersAmong`, `findRefsByIds` sont
   déjà là pour ça. Un `Promise.all` sur N éléments n'est pas un batch : c'est N requêtes
   lancées en même temps.
3. **Ne jamais relire par identifiant une entité qu'une jointure a déjà chargée.** Si le repo
   a joint la relation, la couche au-dessus travaille sur l'objet en mémoire. Quand un
   service d'un autre module n'expose qu'une variante par id, **ajouter une variante qui
   prend l'entité** et garder l'ancienne pour ses autres appelants.
   ⚠️ Vérifier d'abord que la relation est réellement chargée sur **tous** les chemins : une
   colonne `@RelationId` (`coverId`) est peuplée même quand la relation (`cover`) ne l'est
   pas — basculer sans garde y transforme silencieusement une URL en `null`.
4. **Un champ manquant se paie en requêtes client.** Avant de refuser un champ pour son coût,
   mesurer ce que son absence coûte de l'autre côté : un `GET` complet par carte affichée
   pour deux chaînes est infiniment plus cher que ces deux chaînes dans le payload.
5. **Regarder la SÉRIALISATION autant que le nombre.** Des lectures gardées par le résultat
   d'une lecture précédente coûtent un aller-retour complet de plus et n'apparaissent dans
   aucun compteur de requêtes. Mesure faite sur ce produit, écrite dans le code du client :
   sérialiser quatre lectures indépendantes coûtait **la somme** des latences (~1,4 s) au
   lieu de la plus lente (~0,6 s).
6. **Quand deux chemins servent la même donnée à des coûts très différents, l'écart EST le
   finding** : ce n'est pas une occasion d'optimisation, c'est le signe que les deux chemins
   ne partagent pas le même code de lecture.

## Exemple

- ❌ **Avant (incorrect)** :
  ```ts
  return Promise.all(parties.map((party) => this.toResponse(party, viewerId)));
  // toResponse → listHydrated(party.id)      : 1 requête par soirée
  //            → assetService.getPlaybackUrl(party.videoId) : findByIdOrThrow sur un asset déjà joint
  //            → assetService.getCoverUrl(party.coverId)    : idem
  ```
- ✅ **Après (correct)** : les co-organisateurs de **toutes** les soirées en une requête
  (`listHydratedByPartyIds`), les URLs résolues depuis `party.video` / `party.cover` déjà en
  mémoire (variantes entité, repli par id là où la relation peut manquer), et le compte de
  requêtes annoncé dans la PR : `1 + 1 + 1` au lieu de `3N`.
