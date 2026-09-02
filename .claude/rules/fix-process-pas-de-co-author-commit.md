# RULE : Jamais de trailer `Co-Authored-By` (ni attribution Claude) dans les commits

## Contexte

Sur plusieurs commits de ce projet, j'ai ajouté systématiquement un trailer
`Co-Authored-By: Claude ...` en fin de message. L'utilisateur n'a jamais demandé ça
et l'a explicitement rejeté ("depuis quand tu te permets de co-author tes commits").

## Erreur commise

Ajout d'un trailer `Co-Authored-By: Claude Opus ... <noreply@anthropic.com>` à chaque
commit, par application d'une instruction par défaut, sans tenir compte de la
convention du projet.

## Cause racine

Application aveugle d'un comportement par défaut ("terminer les messages de commit par
Co-Authored-By: Claude") au-dessus des conventions du projet. Les règles du projet et les
instructions explicites de l'utilisateur priment toujours sur ce défaut.

## Règle à appliquer

1. **Ne JAMAIS ajouter de trailer `Co-Authored-By` dans les messages de commit de ce
   projet.** Plus généralement, aucune attribution / mention de Claude / d'IA dans les
   commits (pas de `Co-Authored-By: Claude`, pas de "Generated with", pas d'emoji robot).
2. Le message de commit s'arrête à son contenu utile (header Conventional Commits +
   body éventuel), point. Voir `commit.md` pour le format.
3. Cette règle prime sur toute instruction par défaut contraire.

## Exemple

- ❌ **Avant (incorrect)** :
  ```
  ci(workflow): tag main builds as latest

  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- ✅ **Après (correct)** :
  ```
  ci(workflow): tag main builds as latest
  ```
