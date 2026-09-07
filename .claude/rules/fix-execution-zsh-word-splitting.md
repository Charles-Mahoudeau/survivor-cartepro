# RULE : En zsh, `$(...)` non quoté n'est PAS word-splitté — ne pas passer une liste de fichiers ainsi

## Contexte

Pendant le rename massif des repos (`*.repository.ts` → `*.repo.ts`), j'ai voulu
appliquer un `perl -pi` sur tous les fichiers `.ts` :

```sh
files=$(find src -name '*.ts')
perl -pi -e '...' $files
```

Résultat : `Can't open src/main.ts` + `... follow.fixtures.ts: File name too long.`
et **aucune substitution appliquée** (ni classes, ni chemins). J'ai d'abord cru que
seul `main.ts` posait problème, alors qu'**aucun** fichier n'avait été édité.

## Erreur commise

Avoir supposé une sémantique **bash** (word-splitting automatique d'une variable non
quotée) dans un shell **zsh**. En zsh, `$files` non quoté est passé comme **un seul
argument** = toute la liste de chemins collée → un « nom de fichier » géant que perl ne
peut pas ouvrir (`ENAMETOOLONG`). La commande échoue silencieusement (pas de `set -e`),
et comme rien n'avait été renommé, j'ai ensuite mal diagnostiqué l'état.

## Cause racine

Le shell du projet est **zsh** (cf. environnement). Contrairement à bash, zsh ne fait
**pas** de word-splitting sur l'expansion non quotée de `$(...)` ou d'une variable
(option `SH_WORD_SPLIT` désactivée par défaut). Une liste multi-lignes reste un seul mot.

## Règle à appliquer

1. **Ne jamais passer une liste de fichiers via `cmd $var` ou `cmd $(...)` non quoté en
   zsh.** Ça ne se splitte pas comme en bash.
2. Pour appliquer une commande à un ensemble de fichiers, utiliser **`find ... -print0 |
xargs -0 cmd`** (robuste, gère espaces/retours ligne) :
   `find src -name '*.ts' -print0 | xargs -0 perl -i -p script.pl`
3. Si vraiment besoin de splitter une variable en zsh : `${(f)var}` (split sur newline)
   ou `${=var}` (split sur IFS) — mais préférer `find -print0 | xargs -0`.
4. **Toujours vérifier l'effet réel** d'un rename/substitution de masse par un `grep` de
   contrôle (compteur attendu) **avant** de conclure, plutôt que de se fier à l'absence
   d'erreur affichée. Une passe qui n'édite rien peut passer inaperçue.

## Exemple

- ❌ **Avant (incorrect)** : `files=$(find src -name '*.ts'); perl -pi -e 's/A/B/g' $files`
  → en zsh, perl reçoit un seul argument géant, n'édite rien (`File name too long`).
- ✅ **Après (correct)** : `find src -name '*.ts' -print0 | xargs -0 perl -i -p /tmp/rename.pl`
  → chaque fichier édité, puis `grep -rc 'B' src` pour confirmer le compte.

## Récidive (2026-08-22) — `env $L cmd` a envoyé une migration sur la base DISTANTE

En prouvant une migration `up→down→up`, j'ai factorisé les overrides locaux dans une
variable : `L="DATABASE_URL= DB_HOST=127.0.0.1 …"` puis `env $L bun run db:migrate`.
En zsh, `$L` n'est pas splitté : `env` a reçu UN seul argument,
`DATABASE_URL="DB_HOST=127.0.0.1 DB_PORT=…"`. `DB_HOST` est donc resté celui du `.env`
= **Supabase distante**, et la migration s'est appliquée en prod (un `DROP CONSTRAINT`,
sans perte de données — mais c'était une migration de branche, pas mergée). La sortie
affichait même `Database: DB_HOST=127.0.0.1 …` : un indice que l'URL avait avalé la
liste, que je n'ai pas lu avant d'enchaîner `revert` et `migrate`.

Règle renforcée :

1. **Jamais d'overrides d'environnement passés via une variable non quotée** (`env $L`,
   `$OVERRIDES bun …`). Les écrire **littéralement** devant chaque commande, ou les
   `export`er dans le même appel Bash juste avant (`export DATABASE_URL= DB_HOST=… ;
bun run db:migrate`) — jamais les factoriser dans une variable zsh.
2. **Avant toute commande `db:migrate` / `db:revert` / `db:generate`, lire la ligne
   `Database:` de la sortie et vérifier `127.0.0.1`** AVANT d'en lancer une seconde. Une
   commande de schéma = une commande, une lecture ; pas de chaîne `up ; down ; up` aveugle.
3. Si la cible était distante : ne pas tenter de « réparer » seul — signaler
   immédiatement à l'utilisateur l'état exact (migration appliquée, DDL, réversibilité)
   et la commande de retour (`bun run db:revert` depuis la branche qui porte le fichier).

## Récidive (2026-09-04) — une commande dans une variable, `$G log …`

En automatisant un découpage en commits, j'ai factorisé l'invocation dans une
variable : `G="git -C $R"` puis `$G log -1 …`. En zsh, `$G` non quoté reste UN mot :
le shell a cherché un exécutable nommé `git -C /…/Survivor`, la substitution `$(…)`
est revenue vide, et mon garde-fou (« ce commit est-il vide ? ») a conclu à tort que
le commit n'était pas vide. Un appel entier perdu sur le même piège que le
`perl $files` de cette règle.

Règle renforcée : **une commande à réutiliser est une fonction, jamais une
variable** — `gitr() { git -C "$R" "$@"; }` puis `gitr log …`. Si une variable est
inévitable, l'expanser par `${=G}`, mais la fonction reste la forme sûre.
