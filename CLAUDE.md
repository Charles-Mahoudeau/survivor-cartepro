# CLAUDE.md

Instructions pour les agents qui travaillent sur ce dépôt. Elles complètent le
`CLAUDE.md` global de l'auteur, elles ne l'assouplissent jamais.

## Projet

**Ticket Tout** — dispositif d'avantages salariés dématérialisés, trois espaces
(salarié, partenaire, administration). Projet Epitech tek3, cahier des charges
`JEB/DNI/2026-002`.

Monorepo Bun 1.3 + Turbo :

| Chemin           | Contenu                                             |
| ---------------- | --------------------------------------------------- |
| `apps/backend/`  | API NestJS 12 — TypeORM 1.1, PostgreSQL 18, OpenAPI |
| `apps/frontend/` | Application Next.js                                 |
| `packages/`      | Code partagé entre applications                     |

## Conventions — à lire avant d'écrire du code

`.claude/rules/` est **toujours actif**. Chaque fichier y est une règle isolée,
née d'une erreur réelle. Les charger n'est pas optionnel : une règle violée est
un défaut, pas une préférence.

Points d'entrée, par situation :

| Situation                  | À appliquer                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| Créer / modifier un module | skill `architecture-module-conventions`                                           |
| Écrire un test             | skills `write-unit-tests`, `write-integration-tests`                              |
| Faire une revue            | `.claude/rules/code-review.md`                                                    |
| Committer                  | `.claude/rules/commit.md`, `.claude/rules/fix-process-pas-de-co-author-commit.md` |
| Toucher au schéma          | `.claude/rules/fix-process-migrations-via-db-generate.md`                         |
| Se tromper                 | `.claude/rules/errors-learning.md` — l'erreur produit une nouvelle règle          |

## Invariants du backend

- **Repos = seule couche qui touche l'ORM.** Aucun service ne manipule
  `Repository<Entity>`, aucun module n'importe le repo d'un autre module : on
  dépend des services exportés.
- **Aucun DDL de schéma écrit à la main.** Le schéma d'une migration sort
  exclusivement de `bun run db:generate`. Seul ajout manuel autorisé : une
  migration de **données**.
- **`synchronize` n'existe pas**, et aucune variable d'environnement ne le
  rallume. Le cahier des charges impose des transactions validées non
  modifiables (§3.2) ; une passe de synchronisation est exactement ce qui peut
  réécrire la table qui les porte.
- **Swagger obligatoire dès qu'il y a un controller** — `docs/commons/` +
  `docs/endpoints/`, un fichier par code d'erreur remontable.
- **`ClassSerializerInterceptor` est global** : `@Exclude()` ne filtre que de
  vraies instances de classe. Un objet brut (`getRawMany()`, littéral) passe au
  travers.
- **Toute variable d'environnement lue** est validée dans
  `apps/backend/src/config/env/env.schema.ts` et documentée dans `.env.example`.
- **Commentaires en anglais**, minimaux, sans référence à un ticket.

## Commandes

| Commande                                                 | Effet                                    |
| -------------------------------------------------------- | ---------------------------------------- |
| `bun run dev`                                            | Base + toutes les applications en watch  |
| `bun run typecheck` / `lint:check`                       | Gates de types et de lint                |
| `bun run format:check`                                   | Gate Prettier                            |
| `bun run test`                                           | Tests unitaires                          |
| `bun run build`                                          | Compilation                              |
| `bun run --filter '@tickettout/backend' db:generate <Nom>` | Génère une migration depuis les entities |

La CI rejoue les cinq mêmes gates sur chaque push d'une pull request
(`.github/workflows/ci.yml`). Ne jamais annoncer un gate vert sans en avoir lu
la sortie réelle.
