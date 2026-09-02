> # ⛔⛔⛔ RÈGLE ABSOLUE — AUCUN DDL DE SCHÉMA ÉCRIT/MODIFIÉ À LA MAIN DANS UNE MIGRATION ⛔⛔⛔
>
> **Le SCHÉMA d'une migration provient EXCLUSIVEMENT de `bun run db:generate` (l'ORM).**
> On ne tape JAMAIS, on ne « convertit » JAMAIS, on ne « corrige » JAMAIS du DDL de schéma
> à la main. Sont INTERDITS écrits/édités manuellement :
> `CREATE/ALTER/DROP TABLE`, `ALTER TABLE … RENAME`, `ALTER TYPE … RENAME` / `… ADD VALUE`,
> `ALTER INDEX … RENAME`, `CREATE/DROP INDEX`, `ADD/DROP CONSTRAINT`, `ADD/DROP COLUMN`.
>
> **Seul ajout manuel autorisé = une migration de DONNÉES** (INSERT/UPDATE/DELETE de backfill)
> que l'ORM ne sait structurellement pas produire. Rien d'autre.
>
> **Corollaire RENOMMAGE DE TABLE :** TypeORM **ne sait pas** générer un `RENAME` — il émet
> `DROP` + `CREATE`. ⇒ On ne renomme **JAMAIS** une table physique en bricolant un
> `ALTER … RENAME` à la main pour contourner ce DROP/CREATE. On renomme la **CLASSE**
> d'entité ; le nom de table dans `@Entity('…')` **reste inchangé**, et `db:generate` ne
> produit alors que du DDL **additif propre**. Un vrai renommage physique de table doit faire
> l'objet d'une **décision explicite de l'utilisateur**, jamais d'un DDL tapé à la main.
>
> Si `db:generate` produit un DDL « moche » (DROP/CREATE sur un rename invisible, churn
> d'enum…), la réponse n'est PAS d'éditer le DDL : c'est de **changer le code des entités**
> jusqu'à ce que le diff généré soit propre, puis de **re-générer**.

# RULE : Migrations TypeORM — TOUJOURS partir de `bun run db:generate`, jamais écrire le DDL à la main

## Contexte

Pour le fix du cascade user/préférences/auth, j'ai **écrit la migration entièrement
à la main** (`1781229157606-LinkUserPreferencesAndAuthCascade.ts`) : tout le DDL
(`ADD COLUMN`, `ADD CONSTRAINT FK/UNIQUE`, `DROP COLUMN`…) tapé moi-même, avec des
noms de contraintes inventés (`FK_user_preferences_user`, `UQ_user_preferences_user`).
La convention du projet (notée dans `.context/context.md`) est claire : **« Migrations
via `bun run db:generate` (jamais de SQL manuel) »**.

## Erreur commise

Avoir produit la migration en SQL manuel from scratch, au lieu de générer le squelette
via `bun run db:generate <Name>` (qui diffe les entities contre la DB et écrit le DDL
avec les **noms de contraintes de la naming strategy TypeORM**). Conséquence concrète :
les noms de contraintes custom divergent de ce que TypeORM attend → un futur
`db:generate` proposera un `DROP/ADD` parasite pour « renommer » ces contraintes.

## Cause racine

Application d'un réflexe générique « j'écris la migration » au-dessus du workflow
documenté du projet. Les conventions du projet priment sur le réflexe par défaut.

## Règle à appliquer

1. **Toujours, dans cet ordre** : (a) modifier les `*.entity.ts` ; (b) `bun run
db:generate <NomMigration>` pour générer le squelette depuis le diff des entities ;
   (c) relire/ajuster le fichier généré. **Ne jamais taper le DDL de schéma à la main.**
2. **N'ajouter manuellement QUE ce que `db:generate` ne sait PAS produire** (data, pas
   schéma), en l'insérant dans le fichier généré :
   - migrations de **données** (`UPDATE`/`DELETE` de backfill, nettoyage d'orphelins) —
     TypeORM ne génère que du DDL, jamais de data migration ;
   - ⚠️ Si on ajoute une colonne `NOT NULL` sur une table déjà peuplée : TypeORM génère
     un `ADD … NOT NULL` qui **casse** à l'apply → découper en `ADD` nullable → backfill
     → `SET NOT NULL` (manuel). (Si la table est vide partout, rien à faire.)
   - ⚠️ Un FK **validé** (généré) scanne les lignes existantes → nettoyer les données
     invalides AVANT d'appliquer (ex. supprimer les lignes orphelines dont la clé
     référencée n'existe plus), sinon l'`ADD CONSTRAINT` échoue.
3. **Ne jamais inventer de nom de contrainte** : laisser TypeORM les nommer (sinon drift).
4. `db:generate` diffe contre la **DB courante** : si la migration est déjà appliquée,
   le diff est vide. Pour régénérer proprement → `bun run db:revert` d'abord.

## Exemple

- ❌ **Avant (incorrect)** : créer `XxxMigration.ts` et y taper à la main
  `ALTER TABLE "session" ADD CONSTRAINT … FOREIGN KEY ("user_id") REFERENCES "user"("id")`.
- ✅ **Après (correct)** : déclarer la relation sur l'entity (`@ManyToOne`, `@JoinColumn`,
  `onDelete: 'CASCADE'`) → `bun run db:generate LinkSessionToUser` émet le FK **lui-même**
  (nom de convention, zéro churn) → on ne touche au fichier QUE pour un éventuel backfill
  de données.

## Récidive (Phase 3 — participation single-source) — DDL de rename écrit à la main

### Ce qui s'est passé

Dans `1781563028419-ParticipationSingleSource.ts`, le renommage de table
`party_participation_request` → `party_participation` (entity renommée via `git mv`) a fait
émettre à `db:generate` un `DROP TABLE` + `CREATE TABLE` (TypeORM ne détecte pas les renames).
Pour préserver les lignes, j'ai **converti ce DDL à la main** en
`ALTER TABLE … RENAME TO`, `ALTER TYPE … RENAME`, `ALTER INDEX … RENAME` (+ renommage des
contraintes). C'est exactement le DDL de schéma tapé/édité à la main que cette règle interdit.
L'utilisateur a corrigé fermement : « arrête de faire les migrations à la main, utilise
uniquement l'ORM ».

### Règle renforcée

1. **Ne jamais renommer une TABLE physique pour résoudre un `DROP/CREATE` généré.** Garder le
   nom de table d'origine dans `@Entity('…')` (la **classe** peut être renommée librement, le
   nom de table non) ⇒ `db:generate` ne produit que du DDL additif propre
   (`ADD COLUMN`, nouvel index unique, etc.), zéro `ALTER … RENAME` manuel.
2. **Quand `db:generate` produit un diff moche, on corrige les ENTITÉS, pas le fichier de
   migration.** On re-`db:revert` puis re-`db:generate` jusqu'à un diff propre. Le seul ajout
   manuel toléré reste le backfill de **données**.
3. Un renommage de table physique réellement souhaité = **décision explicite utilisateur**,
   tracée comme telle, jamais un contournement DDL silencieux.

## Récidive #2 (EP-SOCIAL — block + fix FK follows) — édition manuelle d'un type-change et suppression de drift

### Ce qui s'est passé

En réparant le FK de `follows` (colonnes `follower_id`/`followee_id` varchar → uuid), `db:generate`
a émis un `DROP COLUMN` + `ADD COLUMN uuid` (TypeORM ne sait pas faire un changement de type
in-place). Pour « préserver les données », j'ai **réécrit le fichier de migration à la main** en
`ALTER COLUMN … TYPE uuid USING …::uuid`, **supprimé** une ligne parasite `feed_sessions ALTER`,
et ajouté des commentaires. Sur la migration `BlockUser` j'avais aussi **supprimé à la main** la
même ligne `feed_sessions`. Trois éditions manuelles de DDL de schéma — interdites par cette règle.
L'utilisateur a re-corrigé : « t'as pas modifié la migration à la main ? ».

### Cause racine

Re-justification de l'édition manuelle par « préservation de données » alors que la règle est un
hard-block : un changement de **type** de colonne est du **schéma**, pas une migration de données
(seules INSERT/UPDATE/DELETE de backfill sont tolérées). Le `USING` n'est donc PAS couvert par
l'exception data.

### Règle renforcée

1. **Ne jamais éditer la migration pour transformer un `DROP/ADD COLUMN` généré en `ALTER … TYPE
… USING`.** Un changement de type que l'ORM rend destructeur (DROP+ADD) sur une table **non
   vide** = **décision explicite utilisateur** (au même titre qu'un rename physique), jamais un
   `USING` glissé à la main en douce.
2. **Ne pas « nettoyer » à la main un drift parasite** (ex. `feed_sessions ALTER COLUMN … SET
DEFAULT`) dans la migration. La bonne manière ORM : **le laisser**, l'appliquer une fois —
   l'ORM réconcilie la DB et le drift disparaît des générations suivantes. Supprimer la ligne =
   édition manuelle de DDL = interdit.
3. **Procédure quand plusieurs changements d'entités sont en attente** : `db:revert` jusqu'à la
   base saine, supprimer les fichiers de migration touchés, puis `db:generate` **une fois** —
   l'ORM produit une migration unique, complète et non éditée. Ne jamais « réparer » le fichier.
4. Si la préservation de données d'un type-change est réellement nécessaire en prod, **demander**
   et tracer la décision ; ne pas la prendre seul via une édition de migration.

## Cas nouveau (2026-08-10, PR-5 légal) — drift INTER-BRANCHES : la DB locale n'est pas à la baseline de la branche

### Ce qui s'est passé

Deux branches en parallèle : `refactor/drop-user-location` (qui supprime `user.location`) et
`feat/legal-review-readiness` (branchée sur `origin/main`, où la colonne existe encore).
En travaillant sur la première, j'avais appliqué sa migration en local — la DB locale n'avait
donc plus la colonne. En basculant sur la seconde pour générer la migration des tables légales,
`db:generate` a émis, au milieu du DDL attendu :

```sql
ALTER TABLE "user" ADD "location" geography(Point,4326)
```

C'est logique : l'entité de CETTE branche déclare encore `location`, la DB ne l'a plus, l'ORM
propose donc de la recréer. Rien à voir avec la feature en cours.

### Erreur commise

Aucune édition manuelle (la règle a tenu), mais j'ai failli conclure « ligne parasite, je la
retire » — ce que la section « Récidive #2 » ci-dessus interdit, en recommandant de **laisser le
drift et l'appliquer une fois**. Or ce conseil est **faux dans ce cas précis** : appliquer aurait
recréé une colonne que la branche sœur venait de supprimer, et le `down()` de la migration
légale l'aurait ensuite droppée — une colonne étrangère embarquée dans une migration qui ne la
concerne pas.

### Cause racine

Confusion entre deux drifts qui se ressemblent :

- **Drift intra-branche** (couvert par Récidive #2) : la DB a divergé de l'entité _sur la même
  branche_ (ex. un `SET DEFAULT` jamais appliqué). L'ORM a raison, on applique, ça se réconcilie.
- **Drift inter-branches** (ce cas) : la DB porte les migrations d'une AUTRE branche. L'ORM a
  raison _par rapport à une DB qui n'est pas la bonne_. Le problème est l'état de la DB, pas le
  diff.

### Règle à appliquer

1. **Avant tout `db:generate`, s'assurer que la DB locale est exactement à la baseline de la
   branche courante** : mêmes migrations appliquées que celles présentes dans
   `database/migrations/` sur cette branche. Le contrôle qui tranche :
   `select name from migrations order by timestamp desc limit 3;` comparé au contenu du dossier.
2. **Si la DB est en avance** (elle porte la migration d'une branche sœur) : récupérer le fichier
   de cette migration le temps de la révoquer, puis le retirer —
   `git show <autre-branche>:database/migrations/<fichier> > database/migrations/<fichier>` →
   `db:revert` → `rm`. La DB revient à la baseline, et `db:generate` produit un diff propre.
   (`db:revert` a besoin du FICHIER : sans lui, TypeORM ne sait pas jouer le `down()`.)
3. **Toute ligne de DDL qui ne concerne pas la feature en cours = signal d'alerte, jamais un
   détail à raboter.** Se demander « d'où vient cette table/colonne ? » avant de faire quoi que
   ce soit. Si elle appartient à une autre branche → point 2. Si elle appartient bien à cette
   branche → c'est le drift intra-branche de Récidive #2, on applique.
4. **Toujours vérifier le fichier généré avant de committer** (`grep` des tables/colonnes
   attendues, et lecture du diff complet). Ici, un `grep -c 'ADD "location"'` sur la migration
   régénérée a confirmé `0` avant commit.

### Exemple

- ❌ **Avant (incorrect)** : `db:generate LegalDocumentsAndConsent` sur une DB portant la
  migration d'une branche sœur → migration contenant `ALTER TABLE "user" ADD "location"` en plus
  des deux tables voulues → soit on l'édite à la main (interdit), soit on l'applique (on
  ressuscite une colonne supprimée ailleurs).
- ✅ **Après (correct)** : constater que la DB est en avance → rapatrier temporairement le fichier
  de la migration sœur → `db:revert` → le supprimer → re-`db:generate` → migration ne contenant
  que `legal_document` et `legal_consent`, `up`→`down`→`up` prouvée, re-generate « No changes ».
