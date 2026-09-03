# RULE : Récupérer le code de sortie d'une commande pipée en zsh (pas `PIPESTATUS`)

## Contexte

En testant le hook lint-staged, j'ai voulu capturer le code de sortie réel de
`bunx lint-staged ... | tail -15`. J'ai écrit `${PIPESTATUS[0]:-$?}`. Le shell de
ce projet est **zsh** (cf. environnement). Résultat affiché : `exit: 0` alors que
lint-staged avait clairement **échoué** (`[FAILED] prettier --check`).

## Erreur commise

Lecture d'un code de sortie faux/trompeur : j'ai conclu « exit 0 » sur une commande
qui avait échoué, à cause d'une mauvaise récupération du statut de pipe.

## Cause racine

`PIPESTATUS` (majuscules, 0-indexé) est une variable **bash**. En **zsh** la variable
équivalente est `$pipestatus` (minuscules, **1-indexé**). `${PIPESTATUS[0]}` est donc
vide en zsh → le fallback `:-$?` renvoie le code de `tail` (dernière commande du pipe),
toujours 0. J'ai supposé une sémantique bash dans un shell zsh.

## Règle à appliquer

1. **Ne jamais lire le code de sortie d'une commande à travers un pipe pour juger de
   son succès.** Le `$?` après un pipe = code de la **dernière** commande du pipe.
2. Pour obtenir le vrai code de sortie d'une commande à tester : la lancer **sans pipe**,
   rediriger la sortie vers un fichier, puis lire `$?` immédiatement :
   `cmd > /tmp/out.txt 2>&1 ; echo "exit: $?"`.
3. Si une lecture de statut de pipe est indispensable en zsh, utiliser `$pipestatus[1]`
   (minuscules, 1-indexé), pas `${PIPESTATUS[0]}`.

## Exemple

- ❌ **Avant (incorrect)** : `bunx lint-staged | tail -15 ; echo ${PIPESTATUS[0]:-$?}` → affiche 0 même en échec.
- ✅ **Après (correct)** : `bunx lint-staged > /tmp/ls.txt 2>&1 ; echo "exit: $?"` → vrai code de sortie (1 en échec).
