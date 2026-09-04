# RULE : En zsh, `path` (minuscules) est l'alias tableau de `PATH` — l'affecter dans un script détruit le PATH de tout l'appel

## Contexte

En construisant des captures HTML des pages `/me`, `/me/history`, `/me/partners`, j'ai
écrit une boucle shell :

```sh
for pg in me me-history me-partners; do path=$(echo $pg | sed 's#-#/#'); curl … "$path" …; done
```

Toutes les commandes suivantes ont échoué : `command not found: curl`, `python3`, `sed`,
`head`. Rien n'était cassé sur la machine : la variable `path` que je venais d'affecter
**est** le `PATH` de zsh, et je l'avais remplacé par la chaîne `me`.

## Erreur commise

Avoir utilisé `path` comme nom de variable de travail dans un shell zsh. L'affectation
`path=…` réécrit `PATH` (zsh lie `path` tableau et `PATH` chaîne), et chaque commande
externe de la suite de l'appel devient introuvable — y compris celles qui auraient dû
produire le livrable.

## Cause racine

Réflexe bash : en bash, `path` est une variable ordinaire. En zsh, plusieurs noms
minuscules sont des **paramètres spéciaux liés** à leur homologue majuscule :
`path`/`PATH`, `cdpath`/`CDPATH`, `fpath`/`FPATH`, `manpath`/`MANPATH`, `psvar`,
`module_path`, `watch`. Écrire dedans a un effet global immédiat sur le processus.
Même famille de pièges de portage bash→zsh que `PIPESTATUS`, le word-splitting et les
modifiers `:` déjà documentés.

## Règle à appliquer

1. **Ne jamais nommer une variable shell `path`, `cdpath`, `fpath`, `manpath`,
   `module_path`, `watch`, `psvar`** en zsh. Utiliser `route`, `url_path`, `p`, `dir`…
2. **Quand plusieurs commandes de base deviennent « not found » d'un coup**, ne pas
   diagnostiquer la machine : chercher d'abord une affectation de `path` (ou un
   `export PATH=` sans `$PATH`) dans l'appel qui précède.
3. **Une variable qui porte un chemin d'URL se nomme d'après ce qu'elle contient**
   (`route`, `endpoint`), pas d'après le mot générique `path`.

## Exemple

- ❌ **Avant (incorrect)** : `for pg in …; do path=$(echo $pg | sed 's#-#/#'); curl "http://localhost:3000/$path"; done`
  → `command not found: curl` pour toute la suite de l'appel.
- ✅ **Après (correct)** : `for pg in …; do route=$(echo $pg | sed 's#-#/#'); curl "http://localhost:3000/$route"; done`
