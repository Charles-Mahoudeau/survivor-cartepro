# RULE : Requêtes DB via le QueryBuilder TypeORM — JAMAIS de SQL brut (`dataSource.query` / `manager.query`)

## Contexte

En reviewant la PR read-enrichment (parcours rejoindre v3), l'utilisateur a repéré que
`src/modules/discovery/feed/services/helpers/feed-hydration.helper.ts` contient des
**requêtes SQL entièrement écrites à la main** (`dataSource.query(...)` avec des strings
SQL de 80+ lignes : SELECT multi-joins, LATERAL, CASE...). La PR a **étendu** ce pattern
(ajout d'un LATERAL zone + CASE distance) au lieu de le remettre en cause. L'utilisateur
a tranché : « on utilise un ORM c'est pas pour rien, il y a le query builder qui existe ».

## Erreur commise

1. Avoir écrit / étendu des requêtes en **SQL brut** (`dataSource.query`,
   `manager.query`) alors que TypeORM expose un **QueryBuilder** typé.
2. Double violation dans le cas du feed : le SQL vit dans un **helper de service**
   (`services/helpers/feed-hydration.helper.ts`), pas même dans un repo — alors que la
   règle du repo est « repos = seule couche ORM ».

## Cause racine

Reproduction du pattern existant du fichier (« le fichier faisait déjà comme ça ») au
lieu d'appliquer la convention du projet. Un pattern pré-existant non conforme ne
légitime pas son extension — il signale une dette à résorber.

## Règle à appliquer

1. **Toute requête DB s'écrit avec le QueryBuilder TypeORM** (`repository.createQueryBuilder()`,
   `.leftJoin`, `.select`, `.where` paramétrés) ou les méthodes repository (`find`, `findOne`,
   `upsert`...). **Jamais** `dataSource.query('SELECT ...')` / `manager.query('...')` avec un
   statement SQL écrit à la main.
2. **Et toujours dans un `*.repo.ts`** — jamais dans un service ou un helper. (Un helper qui
   « hydrate » en SQL = deux violations.)
3. **Exception étroite — les fragments d'expression** que le QueryBuilder ne sait pas exprimer
   (fonctions PostGIS `ST_*`, `md5`, agrégats exotiques) : autorisés comme **fragments** passés
   à `.select()` / `.addSelect()` / `.where()` **du QueryBuilder**, toujours paramétrés
   (`:param`), jamais concaténés avec de l'input. La **structure** de la requête (FROM, joins,
   pagination, mapping) reste au QueryBuilder.
4. Si un statement complet est réellement impossible au QueryBuilder (cas rarissime), il vit
   dans le repo avec un commentaire justifiant précisément pourquoi, et c'est un signal de
   design à remonter.
5. **Offenders connus à migrer** (dette trackée, refacto dédié — ne pas étendre en attendant) :
   `feed-hydration.helper.ts` (à déplacer vers un repo + QB), `feed-read.repo.ts`,
   `party-participation.repo.ts` (admitMembers), `party-statistics.repo.ts`.

## Exemple

- ❌ **Avant (incorrect)** :
  ```ts
  // services/helpers/feed-hydration.helper.ts
  const rows = await this.dataSource.query(
    `SELECT p.id, ... FROM party p INNER JOIN ...`,
    [userId],
  );
  ```
- ✅ **Après (correct)** :
  ```ts
  // repos/feed-item.repo.ts
  const rows = await this.partyRepository
    .createQueryBuilder('p')
    .innerJoin('p.organizer', 'u')
    .leftJoin(...)
    .addSelect('ST_Distance(p.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography)', 'distance')
    .setParameters({ lon, lat })
    .getRawMany();
  ```
  (structure au QueryBuilder ; seul le fragment PostGIS irremplaçable reste une expression brute paramétrée).
