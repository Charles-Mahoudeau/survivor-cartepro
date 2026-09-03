# RULE : Avant de juger une migration « redondante » / la supprimer, tracer le cycle de vie COMPLET de la colonne/table sur TOUTES les migrations (pas juste l'Initial)

## Contexte

En nettoyant la PR profil (#17) pour éviter une fausse « collision » de migration,
j'ai supprimé la migration `AddUserNameAndAvatar` (qui faisait `ALTER TABLE "user"
ADD "first_name" / "last_name"`). Mon raisonnement : « l'`Initial` crée déjà
`first_name`/`last_name` sur `user` (je l'ai vérifié au grep), donc ce `ADD` est
redondant et planterait (colonne déjà existante) ». J'ai vérifié UNIQUEMENT le
`CREATE TABLE "user"` de l'`Initial`.

## Erreur commise

Avoir conclu « migration redondante » à partir d'UNE SEULE migration (l'`Initial`),
sans regarder la SUITE. En réalité une migration intermédiaire (`UpdateUserSchema`)
faisait `ALTER TABLE "user" DROP COLUMN "first_name" / "last_name"`, et
`AddUserNameAndAvatar` les **re-créait** bien plus tard. Le cycle réel était :
`Initial` (create) → `UpdateUserSchema` (drop) → `AddUserNameAndAvatar` (re-add).
Supprimer le re-add a laissé les colonnes **absentes** sur toute DB fraîche. Comme
l'entity `User` (ajoutée par #17) les référence, **toute requête user cassait**
(`column User.first_name does not exist`) — 206 tests d'intégration rouges, et
`main` cassé au runtime en prod, pas seulement en test.

## Cause racine

Vérification partielle : j'ai lu le `CREATE` d'une colonne et supposé qu'il reflétait
l'état final du schéma. Une migration n'est pas l'état du schéma — c'est un DELTA. Une
colonne créée à l'`Initial` peut être droppée puis re-ajoutée plus loin. Raisonner sur
un seul fichier de migration = raisonner sur un instantané faux.

## Règle à appliquer

1. **Avant de supprimer une migration ou de la déclarer redondante, tracer le cycle de
   vie COMPLET de chaque colonne/table concernée sur TOUTES les migrations** :
   `grep -rn "<colonne>" database/migrations/` puis lire chaque `ADD`/`DROP`/`CREATE`
   dans l'ordre des timestamps. Un `ADD` n'est redondant que si la colonne existe
   **à ce point de la séquence** (donc pas droppée entre-temps).
2. **Mieux : ne pas raisonner sur les fichiers, mesurer le schéma réel.** Reconstruire
   la DB locale au HEAD des migrations (`db:start` + wipe + `db:migrate`) puis
   interroger `information_schema.columns` — c'est la seule source de vérité de l'état
   final. Si la colonne manque et que l'entity la référence, la migration est nécessaire.
3. **Une entity qui référence une colonne absente du schéma migré = régression
   bloquante** (runtime, pas juste test). Lancer `bun run test:integration` en local
   avant de conclure sur une suppression de migration ou un changement de schéma.
   ⚠️ **Correctif du 2026-08-27** : cette rule affirmait que la CI ne lançait PAS
   `test:integration`. C'est **faux depuis** — la CI a un job « Integration Tests »,
   vérifié vert sur la PR #143 aux côtés de Lint / Format / Typecheck / Unit Tests /
   Build / Image (amd64, arm64). Ne plus s'appuyer sur l'ancienne affirmation pour
   justifier une vérification locale « parce que la CI ne la fera pas » : la raison de
   la lancer en local est de ne pas découvrir la casse après le push, pas un trou de CI.
4. Corollaire : pour réconcilier deux branches sur une migration, comparer les SCHÉMAS
   effectifs (DB reconstruite de chaque côté), pas les seuls fichiers `Initial`.

## Exemple

- ❌ **Avant (incorrect)** : `git show main:...Initial.ts | grep first_name` → présent →
  « `AddUserNameAndAvatar` est redondant » → suppression → `main` cassé (colonnes
  droppées par `UpdateUserSchema`, jamais re-ajoutées).
- ✅ **Après (correct)** : `grep -rn first_name database/migrations/` → `Initial` (create),
  `UpdateUserSchema` (drop), `AddUserNameAndAvatar` (re-add) → le re-add est ESSENTIEL.
  Confirmation : DB reconstruite au HEAD → `first_name` absent sans lui → on garde/génère.
