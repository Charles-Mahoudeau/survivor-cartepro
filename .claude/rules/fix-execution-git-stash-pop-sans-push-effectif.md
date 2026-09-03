# RULE : Ne jamais enchaîner `git stash push <fichier>` et `git stash pop` — un push qui ne sauvegarde rien fait dépiler la remise d'AVANT

## Contexte

Après le merge de la PR #108, je resynchronisais `main` local sur `origin/main`. Le
dépôt portait une modification utilisateur sur `.planning/APP-REVIEW-NOTES.md` lors des
manipulations précédentes, donc j'ai réutilisé le même enchaînement que plus tôt dans la
session :

```sh
git stash push .planning/APP-REVIEW-NOTES.md
git reset --hard origin/main
git stash pop
```

Sauf qu'entre-temps ce fichier avait été **commité**. Le `stash push` a répondu
« No local changes to save » et n'a créé **aucune entrée**. Le `stash pop` a donc dépilé
`stash@{0}`, une remise vieille de plusieurs semaines d'une autre branche
(« scrapped T5 read-module reveal — reference only »), et a produit trois conflits
`UU` dans `party/participation` et `party.module.ts`, plus une arborescence
`src/modules/party/read/` ressuscitée d'un travail abandonné.

## Erreur commise

Avoir traité `git stash pop` comme l'opération inverse garantie du `git stash push` qui
le précède, alors que les deux commandes ne sont liées par rien : `pop` dépile le sommet
de la pile, quelle que soit son origine. Sur un dépôt qui traîne des remises anciennes —
ici trois, dont une de mai — c'est une bombe à retardement.

Aggravant : l'enchaînement était dans une seule commande `&&`, donc le `pop` s'est
exécuté sans que je lise le « No local changes to save » du `push`.

## Cause racine

Confusion entre une pile globale et un presse-papier local. `git stash` est une **pile
partagée par tout le dépôt**, pas un emplacement associé à mon opération. Un `push` qui
échoue à empiler ne laisse pas la pile vide : il la laisse **telle qu'elle était**, et le
`pop` suivant frappe le travail de quelqu'un d'autre — ou de moi-même, des semaines plus
tôt.

Second facteur : `git stash push <chemin>` ne considère que les modifications **non
commitées** du chemin donné. Un fichier commité entre-temps le rend silencieusement
inopérant, et rien dans la sortie ne ressemble à une erreur.

## Règle à appliquer

1. **Ne jamais enchaîner `stash push` et `stash pop` dans une commande composée.** Lancer
   le `push`, LIRE sa sortie, et ne dépiler que s'il a réellement créé une entrée.
2. **Préférer une référence explicite** quand un dépilage est nécessaire :
   `git stash pop stash@{0}` ne protège de rien, mais `git stash push -m "resync-<tâche>"`
   puis `git stash list` pour vérifier que l'entrée du sommet porte bien CE message, avant
   de dépiler, protège.
3. **Préférer ne pas stasher du tout.** Pour resynchroniser une branche locale sur son
   amont en préservant des modifications non commitées, `git rebase origin/main` ou
   `git merge --ff-only` échouent proprement au lieu de détruire ; et si le seul but est
   d'aligner `main`, `git fetch` + travailler depuis `origin/main` sans checkout de `main`
   évite entièrement la question.
4. **Vérifier la pile avant tout dépilage sur un dépôt qu'on ne connaît pas à fond** :
   `git stash list`. Ce dépôt portait trois remises dormantes ; ce n'est pas une anomalie,
   c'est le cas courant sur un projet vivant.
5. **Après un `pop` en conflit** : `git reset --hard <ref>` annule le dépilage, et Git
   **conserve l'entrée** (« The stash entry is kept in case you need it again ») — donc
   rien n'est perdu. Mais les fichiers **non suivis** restaurés par la remise survivent au
   reset : les identifier avec
   `git stash show --include-untracked --name-only stash@{0}` et les retirer un par un,
   jamais avec un `git clean -fd` aveugle qui emporterait aussi le travail en cours.

## Exemple

- ❌ **Avant (incorrect)** : `git stash push fichier.md && git reset --hard origin/main && git stash pop`
  → le push ne sauvegarde rien (fichier déjà commité), le pop dépile une remise de mai,
  trois conflits `UU` et un module supprimé qui réapparaît.
- ✅ **Après (correct)** : `git stash push -m "resync" fichier.md` → lire la sortie →
  `git stash list` pour confirmer que `stash@{0}` porte bien « resync » → seulement alors
  `git reset --hard origin/main` puis `git stash pop`.
