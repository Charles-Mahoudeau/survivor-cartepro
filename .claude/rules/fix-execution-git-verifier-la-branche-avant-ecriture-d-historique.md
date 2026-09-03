# RULE : Toute commande git qui ÉCRIT de l'historique doit relire la branche courante dans le MÊME appel — la branche d'il y a dix minutes n'est pas la branche d'maintenant

## Contexte

Après le merge de la PR #131, je rebasais `fix/user-search-excludes-self` sur `main`
pour résorber un conflit sur `.planning/STATE.md`. Rebase propre, gates relancés verts.
Restait à corriger deux références de commit dans les artefacts (le rebase avait réécrit
`f3c53f7` → `170d043`) puis à amender le commit de docs. J'ai envoyé :

```sh
python3 - <<'PY'
... réécriture de SUMMARY.md et STATE.md ...
PY
git add .planning && git commit -q --amend --no-edit
```

Le python a échoué (`FileNotFoundError` sur `SUMMARY.md`), et le `git commit --amend`
s'est exécuté quand même. Pire : entre mes deux commandes, **une autre session avait fait
`git checkout main` puis `git pull`** (merge de la PR #130). Le `--amend` a donc réécrit
non pas mon commit de docs, mais **le commit de merge de la PR #130 en tête de `main`**.

Dégâts réels : nuls en contenu (arbre identique `4037849442…`, `git diff` vide entre
l'ancien et le nouveau), rien de poussé, `origin/main` intact, ma branche intacte. Mais
`main` local avait divergé d'`origin/main` d'un commit réécrit — une bombe à retardement
pour la session qui travaillait dessus.

## Erreur commise

1. Avoir lancé `git commit --amend` — une **réécriture d'historique** — sans vérifier,
   dans le même appel, sur quelle branche `HEAD` se trouvait.
2. Avoir enchaîné une commande git mutante derrière un heredoc python faillible en
   croyant le `&&` protecteur : le `&&` ne liait que `git add` et `git commit`. Le python
   et la ligne suivante sont **deux commandes séparées** ; l'échec du premier n'arrête
   rien. C'est une **récidive** du point 3 de
   `fix-raisonnement-ne-pas-halluciner-contenu-fichier.md` (« ne jamais batcher un appel
   faillible avec une écriture »), transposée de `Write`/`rm` à git.
3. `--amend --no-edit` avec **rien de staged** ne dit rien et ne rate rien : il réécrit
   silencieusement le commit de tête. Aucun signal d'erreur ne m'a alerté ; c'est le
   `git log` suivant qui a montré le désastre.

## Cause racine

Avoir traité la branche courante comme un **état acquis** au lieu d'une valeur volatile.
Dans un dépôt où une autre session peut faire `checkout`/`pull` à tout moment (règle 6 du
CLAUDE.md global), la branche sur laquelle j'ai travaillé il y a trois commandes n'est pas
une propriété du monde : c'est une lecture périmée. Une commande de réécriture d'historique
appliquée à la mauvaise branche ne prévient pas — elle réussit.

## Règle à appliquer

1. **Toute commande git qui écrit de l'historique** — `commit`, `commit --amend`,
   `rebase`, `reset`, `cherry-pick`, `merge`, `push` — **doit être précédée, dans le MÊME
   appel Bash, d'une lecture de la branche courante** :
   `git branch --show-current` (ou `git rev-parse --abbrev-ref HEAD`), et l'action ne part
   que si elle correspond à la branche attendue. Forme sûre :
   ```sh
   [ "$(git branch --show-current)" = "fix/ma-branche" ] || { echo "MAUVAISE BRANCHE"; exit 1; }
   git commit --amend --no-edit
   ```
2. **Ne jamais enchaîner une commande git mutante derrière un heredoc ou un script
   faillible en comptant sur un `&&` placé plus loin.** Le `&&` ne protège que ce qui est
   à sa gauche _dans la même commande_. Un heredoc sur sa propre ligne est une commande
   séparée : son échec n'empêche rien. Séparer en deux appels d'outil, lire le résultat du
   premier, puis lancer le second.
3. **Ne jamais lancer `--amend` avec rien de staged.** S'il n'y a rien à ajouter, il n'y a
   rien à amender : la commande ne peut que réécrire un commit qu'on ne voulait pas
   toucher. Vérifier `git status --short` d'abord.
4. **Quand `git log` ne montre pas ce qu'on attend, s'arrêter et lire le `git reflog`
   avant toute autre commande.** Le reflog distingue en trois lignes ce que j'ai fait de ce
   qu'une autre session a fait (`checkout: moving from … to …`, `pull: Fast-forward`)
   — c'est lui qui a permis de qualifier l'incident sans rien casser de plus.
5. **Pousser une branche sans la checkouter** quand le working tree appartient à quelqu'un
   d'autre : `git push origin ma-branche:ma-branche` fonctionne depuis n'importe quelle
   branche et n'arrache le tree à personne. Un `checkout` pour pousser est un effet de bord
   inutile.
6. **Réparer sa propre casse ≠ écraser le travail d'autrui.** Ici, remettre `main` local
   sur `origin/main` restaure exactement ce que l'autre session avait pull — après avoir
   _prouvé_ l'équivalence (`git rev-parse <ref>^{tree}` des deux côtés + `git diff` vide)
   et vérifié qu'aucun commit local propre ne vivait sur `main`. Sans cette preuve, on
   demande.

## Exemple

- ❌ **Avant (incorrect)** :
  ```sh
  python3 - <<'PY'
  ... réécriture de fichiers ...
  PY
  git add .planning && git commit -q --amend --no-edit
  ```
  → le python échoue, le `--amend` part quand même, sur une branche changée entre-temps
  par une autre session : le commit de merge d'une PR déjà mergée est réécrit.
- ✅ **Après (correct)** : un appel pour le python, on **lit son exit code** ; puis un
  second appel qui commence par vérifier la branche et le staging avant d'amender.

## Récidive (2026-08-21) — `cd` échoué, `git merge` exécuté dans le tree d'une autre session

En voulant fusionner `origin/main` dans `feat/party-memories` **sans déranger une autre
session**, j'ai envoyé :

```sh
git worktree add "$WT" feat/party-memories
cd "$WT" && echo "worktree sur : $(git rev-parse --abbrev-ref HEAD)"
git merge origin/main --no-edit
```

`worktree add` a échoué (« already used by worktree ») parce que l'autre session venait
de checkouter cette même branche dans le tree principal. Le dossier n'existant pas, le
`cd` a échoué à son tour — et le `git merge` de la **troisième ligne, commande séparée**,
s'est exécuté dans le **tree principal**, laissant l'autre session avec un merge en
conflit qu'elle n'avait pas demandé.

C'est exactement le point 2 de cette règle, transposé du heredoc au `cd` : le `&&` ne
liait que `cd` et `echo`. Une commande de mutation sur la ligne suivante n'est protégée
par rien.

Dégâts réels : nuls après `git merge --abort` (branche à `58be3db`, aucun fichier suivi
modifié, les deux fichiers non suivis intacts). Mais le tree d'autrui est resté dans un
état `MERGING` conflictuel entre-temps.

Règle renforcée :

7. **Un `cd` est une commande faillible au même titre qu'un heredoc.** Ne jamais faire
   suivre un `cd` d'une commande git mutante sur une ligne séparée. Soit tout est dans
   la même chaîne `&&` (`cd "$WT" && git merge …`), soit on utilise `git -C "$WT" merge …`
   qui ne dépend d'aucun cwd — la forme à préférer systématiquement.
8. **`git worktree add` peut échouer pour une raison qui n'a rien à voir avec moi** (la
   branche vient d'être checkoutée ailleurs). Lire son exit code **dans un appel séparé**
   avant d'enchaîner quoi que ce soit dans le worktree supposé créé.
9. **Corollaire de la règle 6 du CLAUDE.md global** : quand une autre session est active
   sur le tree, la vérification de branche ne suffit pas — l'état peut changer **entre
   deux de mes commandes**. Toute opération mutante doit soit viser un chemin explicite
   (`git -C`), soit être précédée d'une revérification dans le même appel.
