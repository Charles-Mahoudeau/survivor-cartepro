# RULE : En zsh, `$VAR:chemin` déclenche les MODIFIERS d'expansion (`:s`, `:h`, `:t`…) — ne jamais concaténer `rev:path` git via une variable non protégée

## Contexte

En inspectant des fichiers d'une autre révision (`git show <rev>:<path>`), j'ai fait :

```sh
MAIN=$(git rev-parse origin/main)
git show $MAIN:src/modules/party/engagement/like/entities/like.entity.ts
```

Résultat : au lieu du contenu du fichier, `git show` a affiché **le commit lui-même**
(header + diff CI), et l'appel suivant a produit un chemin mutilé
(`…f3eence/entities/…`) avec `fatal: ambiguous argument`.

## Erreur commise

Avoir concaténé `$MAIN:chemin` en zsh. La sortie était silencieusement fausse :
le premier appel « marchait » (exit 0) en montrant TOUT AUTRE CHOSE que le fichier
demandé — exactement le genre de sortie qu'on risque de lire comme si c'était le bon
contenu.

## Cause racine

En **zsh**, `$VAR:xxx` applique les **modifiers d'expansion** hérités de l'historique :
`:h` (head), `:t` (tail), `:r`, `:e`, `:s/x/y/` (substitution), `:l`, `:u`…
`$MAIN:src/modules/party/…` est donc lu comme `${MAIN}` suivi du modifier `:s` avec
`/modules/party/…` comme arguments de substitution — pas comme la chaîne
`<sha>:src/modules/…`. Selon le reste du chemin, la substitution échoue silencieusement
(reste le sha nu → `git show <sha>` = le commit) ou mange une partie du chemin.
Bash n'a pas ce comportement — c'est un piège de portage bash→zsh, comme
`PIPESTATUS` et le word-splitting déjà documentés.

## Règle à appliquer

1. **Ne jamais écrire `$VAR:qqchose` nu en zsh.** Pour un spec git `rev:path`, utiliser
   le littéral direct : `git show "origin/main:src/…/file.ts"` (forme sûre, déjà utilisée
   ailleurs dans le projet), ou protéger l'expansion : `git show "${MAIN}:src/…"` n'est
   PAS suffisant (les modifiers s'appliquent aussi entre quotes) → préférer le littéral,
   ou construire en deux temps : `spec="origin/main"; git show "$spec":"$path"` où le
   `:` est hors de l'expansion.
2. **Se méfier d'un `git show` qui affiche un header de commit** quand on attendait un
   contenu de fichier : c'est le symptôme immédiat de ce bug (le chemin a été perdu).
   Ne jamais raisonner sur cette sortie.
3. Corollaire général zsh (avec `fix-execution-zsh-pipestatus` et
   `fix-execution-zsh-word-splitting`) : toute idiome shell copié d'un réflexe bash doit
   être vérifié pour zsh avant d'interpréter son résultat.

## Exemple

- ❌ **Avant (incorrect)** : `MAIN=$(git rev-parse origin/main); git show $MAIN:src/a/b.ts`
  → zsh applique le modifier `:s…` → affiche le commit entier ou un chemin mutilé.
- ✅ **Après (correct)** : `git show "origin/main:src/a/b.ts"` → contenu du fichier.
