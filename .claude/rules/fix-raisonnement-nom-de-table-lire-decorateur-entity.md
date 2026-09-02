# RULE : Le nom d'une TABLE se lit dans `@Entity('…')` / le DDL des migrations — jamais déduit du nom de la classe ou du fichier

## Contexte

Après un `DELETE` manuel de comptes en doublon (chantier unicité du username), j'ai
livré à l'utilisateur un SQL d'audit + nettoyage des lignes orphelines. J'avais bien
ouvert les entités pour relever les **colonnes** (`user_id`, `author_id`, `created_by`,
`recipient_id`, `actor_id`) — c'était correct. Mais pour les **noms de tables**, je les
ai déduits du nom des classes / des fichiers d'entité. L'utilisateur a lancé la requête
en production et a reçu :

```
ERROR: 42P01: relation "party_participation" does not exist
```

La table s'appelle en réalité **`party_participation_request`** : la classe a été
renommée `PartyParticipation`, mais `@Entity('party_participation_request')` a
volontairement conservé le nom physique — précisément à cause de la règle
`fix-process-migrations-via-db-generate.md` (TypeORM ne sait pas générer un `RENAME`,
il émet `DROP` + `CREATE`, donc on renomme la classe et **jamais** la table).

## Erreur commise

Avoir déduit un nom de table d'un nom de classe/fichier, puis avoir livré du **SQL
destructif** (`DELETE`) bâti sur cette déduction, sans l'avoir confrontée au décorateur
`@Entity('…')` ni au `CREATE TABLE` des migrations.

Aggravant : dans le même fichier j'avais fait l'effort de vérifier les colonnes dans les
entités. J'ai donc appliqué deux standards de rigueur différents à deux moitiés de la
même requête, sans m'en rendre compte.

## Cause racine

Confusion entre le modèle **objet** et le schéma **physique**. Sur ce repo, la
convention ORM les dissocie _délibérément_ : renommer une classe d'entité sans toucher
au nom de table est la manœuvre standard pour éviter un `DROP`/`CREATE`. Le nom de
classe est donc structurellement un **mauvais** prédicteur du nom de table — c'est une
propriété du repo, pas un accident. J'ai appliqué une heuristique de nommage
(`PartyParticipation` → `party_participation`) là où le repo garantit l'inverse.

Note : la `SnakeNamingStrategy` fiabilise bien la conversion **propriété → colonne**
(`authorId` → `author_id`), ce qui explique pourquoi la moitié « colonnes » était juste.
Elle ne dit rien du nom de table quand `@Entity('…')` le fixe explicitement.

## Règle à appliquer

1. **Tout nom de table écrit dans une requête SQL doit être lu**, jamais déduit :
   `grep -oE "@Entity\([^)]*\)" <entity>.ts`, ou le `CREATE TABLE` dans
   `database/migrations/`. Si `@Entity()` est vide, alors seulement la convention
   s'applique.
2. **Corollaire spécifique à ce repo** : une classe d'entité renommée laisse le nom de
   table d'origine derrière elle (`fix-process-migrations-via-db-generate.md`). Donc
   `NomDeClasse ≠ nom_de_table` est le cas ATTENDU, pas l'exception. Se méfier
   particulièrement des entités dont le nom a bougé au fil des refactos.
3. **Avant de livrer du SQL destructif** (`DELETE`, `UPDATE`, `DROP`) que l'utilisateur
   va exécuter en production : vérifier que **chaque** identifiant — table ET colonne —
   provient d'une lecture, et le dire explicitement dans le livrable. Un `DELETE` bâti
   sur un identifiant supposé est un incident en puissance, pas une approximation.
4. **Rigueur uniforme sur un même livrable** : si une moitié de la requête a été
   vérifiée dans les fichiers, l'autre moitié doit l'être aussi. Un identifiant vérifié
   à côté d'un identifiant supposé donne une fausse impression de fiabilité globale.
5. **Toujours faire précéder un SQL destructif d'un audit en lecture seule** que
   l'utilisateur lance d'abord (ce point-là était bien fait : c'est l'audit qui a
   attrapé l'erreur avant le moindre `DELETE`, et c'est pour ça qu'elle est restée sans
   conséquence). Ne jamais livrer les `DELETE` seuls.
6. Complète `fix-raisonnement-ne-pas-halluciner-contenu-fichier.md` (« je n'ai pas lu le
   fichier ») et `fix-raisonnement-invariant-delegue-doit-etre-calcule.md` (« lu et bien
   analysé, mais paraphrasé faux en aval ») : ici, fichier lu et _à moitié_ exploité —
   les colonnes relevées, le nom de table inventé.

## Exemple

- ❌ **Avant (incorrect)** : entité `party-participation.entity.ts`, classe
  `PartyParticipation` → j'écris `FROM party_participation` → `ERROR 42P01: relation
"party_participation" does not exist` en production.
- ✅ **Après (correct)** :
  `grep -oE "@Entity\([^)]*\)" src/modules/party/participation/entities/party-participation.entity.ts`
  → `@Entity('party_participation_request')` → j'écris
  `FROM party_participation_request`. Vérification croisée :
  `grep -rhoE 'CREATE TABLE "party_participation_request"' database/migrations/` renvoie
  bien la table.
