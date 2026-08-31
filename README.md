# CartePro

Dispositif d'avantages salariés dématérialisés — trois espaces : salarié,
partenaire, administration.

Projet Epitech tek3, cahier des charges `JEB/DNI/2026-002`.

## Structure

```
apps/backend/     API NestJS
packages/     code partagé entre applications
docker/       stack de développement local (PostgreSQL 18)
```

## Démarrer

```bash
bun install
cp apps/backend/.env.example apps/backend/.env
bun run db:up
cd apps/backend && bun run db:migrate && bun run start:dev
```

L'API répond sur http://localhost:3000, sa documentation sur
http://localhost:3000/docs. Détail des scripts et des conventions dans
[apps/backend/README.md](apps/backend/README.md).

La base écoute sur le port **5434** et non 5432 : une machine de développement
fait souvent déjà tourner un Postgres, et le port standard est le premier à
entrer en collision. Surchargeable par `DB_PORT`, qui doit rester aligné entre
`apps/backend/.env` et `docker/compose.yml`.

## Commandes racine

| Commande                          | Effet                                              |
| --------------------------------- | -------------------------------------------------- |
| `bun run db:up` / `db:down`       | Démarre / arrête PostgreSQL 18.                    |
| `bun run db:nuke`                 | Arrête et **supprime le volume** de données.       |
| `bun run typecheck`               | Vérification de types sur toutes les applications. |
| `bun run lint` / `lint:check`     | ESLint, avec ou sans correction automatique.       |
| `bun run format` / `format:check` | Prettier, avec ou sans écriture.                   |
| `bun run test`                    | Tests unitaires.                                   |
| `bun run build`                   | Compilation de toutes les applications.            |

Les tâches passent par Turbo et sont mises en cache : relancer une commande sans
avoir modifié ses entrées ne recompile rien.

## Contribution

Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org).
Deux crochets Git sont installés automatiquement par `bun install` :

- `pre-commit` — vérification de types puis lint et format sur les fichiers indexés
- `commit-msg` — validation du message par commitlint

Une fonctionnalité tient dans une branche et une pull request.
