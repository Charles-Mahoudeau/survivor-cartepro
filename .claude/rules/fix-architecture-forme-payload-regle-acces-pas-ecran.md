# RULE : La forme d'un payload se décide par la RÈGLE D'ACCÈS de ce qu'il porte, jamais par l'écran qui le consomme — et un champ n'y entre que s'il supprime une requête plus lourde

## Contexte

Chantier des lectures du domaine soirée (2026-08-27). La page de soirée iOS faisait quatre
requêtes, dont trois sérialisées derrière la première. J'ai proposé d'inliner la liste des
invités dans `GET /party/participation/:partyId/me` : « le serveur sait déjà si le viewer
est accepté, garde identique côté client, un aller-retour en moins ».

L'utilisateur a bloqué deux fois : « normalement un utilisateur en pending a accès à la
liste des participants », puis « j'ai l'impression qu'on est en train de garnir des
endpoints qui deviennent des fourre-tout ».

Il avait raison sur les deux points. La garde réelle de `/participants` est
`PartyRole !== NONE` (manager ou membre **accepté**) — un pending est `NONE` et reçoit un 404. Et la règle produit visée était encore une troisième chose. Inliner la liste dans
« ta participation » aurait **gravé la règle d'accès du parent sur l'enfant** et supprimé
l'endroit où celle de l'enfant pouvait évoluer.

## Erreur commise

Avoir choisi la forme d'un payload d'après **l'écran qui le consomme** (« la page peint
tout ça d'un coup ») au lieu de la **règle d'accès de la donnée** (« qui a le droit de lire
ça, et pour quelle raison »).

Aggravant : j'ai justifié la fusion par une « garde identique » que je n'avais pas mesurée.
Les deux gardes ne coïncidaient que par accident du moment, et le produit voulait
précisément les faire diverger.

## Cause racine

Confusion entre deux axes de regroupement qui se ressemblent sur un diagramme et n'ont rien
à voir dans le temps :

- **par écran** — ce qu'une vue peint en un rendu. Change à chaque redesign.
- **par ressource** — ce qui partage une règle d'accès et un cycle de vie. Change quand le
  produit change d'avis sur _qui a le droit_.

Un payload groupé par écran fige dans le contrat une composition d'interface, et absorbe
les règles d'accès de tout ce qu'il porte : la sous-ressource perd son autorité propre.
Un payload groupé par ressource survit aux redesigns et garde une seule autorité par règle.

## Règle à appliquer

1. **Deux critères, à appliquer dans cet ordre, avant d'ajouter quoi que ce soit à un payload :**
   - **Un CHAMP y entre s'il supprime une requête qui transporterait strictement plus.**
     `shareUrl` (une chaîne) remplace un `GET /party/:id` entier : il entre. Un compteur
     (un entier) remplace le téléchargement d'une file complète : il entre. Un champ qui ne
     supprime aucune requête ne se juge pas là-dessus — il se juge sur la correction (voir
     `fix-process-defaut-visible-jamais-classe-mineur-ni-descope-seul.md`), et le fait qu'il
     coûte des requêtes se règle en le **batchant**, pas en le retirant.
   - **Une SOUS-RESSOURCE n'y entre PAS si elle a sa propre règle d'accès.** Test : est-ce
     qu'on peut imaginer le produit changer qui la lit, sans changer qui lit le parent ? Si
     oui, elle reste une route.
2. **Ne jamais affirmer que deux gardes « sont identiques » sans les avoir lues toutes les
   deux dans le service** (pas dans la doc, pas dans le nom de la méthode, pas dans le code
   client qui les appelle). Une coïncidence de gardes à l'instant T n'est pas une propriété
   du système.
3. **Une garde côté client n'est pas une garde.** Le client qui s'abstient d'appeler
   (`guard isAccepted`) documente une intention d'UI, pas une règle de sécurité. Ne jamais
   citer une garde client comme justification d'une fusion côté serveur.
4. **Avant d'inventer une forme, chercher celle que le dépôt applique déjà.** Ici la phase 8
   (`.planning/phases/08-profile-reads-reorg-feed-hydration/08-SPEC.md`) avait déjà tranché
   pour le profil : **listes maigres + un endpoint d'hydratation par lots (`GET /feed?ids=`)
   - un prédicat d'admission unique partagé** (`party-admission.helper.ts`, invariant
     « liste ⊆ hydratable », décision D10). Le réutiliser vaut mieux que le réinventer.
5. **Mais ne pas forcer l'analogie non plus.** L'hydratation par lots résout « N cartes, une
   requête ». Une page qui affiche **une** ressource et ses quatre sous-ressources est un
   problème différent : sa cascade se casse en **parallélisant les appels**, pas en les
   fusionnant. Nommer le problème avant de choisir le patron.
6. **Quand un payload doit servir deux publics avec deux droits, servir DEUX BLOCS
   DISTINCTS, jamais une liste aux champs optionnels.** Une rangée dont le pseudo est
   « parfois là » oblige tous les clients à gérer le polymorphisme pour toujours ; deux
   blocs nommés (`participants` / `avatars`) restent honnêtes sur ce qu'ils contiennent et
   permettent au client de brancher sur la présence.

## Exemple

- ❌ **Avant (incorrect)** : « Les participants sont dans le header de la page, et le serveur
  sait déjà si le viewer est accepté — on les met dans `/me`, garde identique, un RTT en
  moins. » (Les deux gardes n'étaient pas identiques, et la fusion aurait empêché la règle
  d'accès de la liste d'évoluer indépendamment.)
- ✅ **Après (correct)** : « La liste des invités a sa propre règle d'accès, que le produit
  veut faire évoluer — elle reste une route. La cascade se casse côté client en lançant les
  quatre lectures en parallèle et en laissant chaque endpoint appliquer sa garde. Et sur la
  route des invités, un pending reçoit un **second bloc** (`avatars` + `total`), pas une
  version dégradée du premier. »
