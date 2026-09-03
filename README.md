# Ticket Tout

Dispositif d'avantages salariés dématérialisés — trois espaces : salarié,
partenaire, administration.

Projet Epitech tek3, cahier des charges `JEB/DNI/2026-002`.

## Structure

```
apps/backend/     Backend NestJS
apps/frontend/    Frontend NextJS
packages/     code partagé entre applications
docker/       stack de développement local (PostgreSQL 18)
```

## Démarrer

```bash
bun install
cp .env.example .env
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env
bun run dev
```

Un seul `.env`, à la racine : `docker compose` le lit, et le backend le trouve
en remontant depuis son dossier. `BETTER_AUTH_SECRET` n'a pas de valeur par
défaut utilisable — l'application refuse de démarrer sans.

`bun run dev` démarre la base puis toutes les applications en mode watch.
Le frontend répond sur http://localhost:3000.
Le backend répond sur http://localhost:3001.
La documentation sur http://localhost:3001/docs.
Les migrations en attente s'appliquent au démarrage de l'application.

Détail des scripts et des conventions dans
[apps/backend/README.md](apps/backend/README.md) et
[apps/frontend/README.md](apps/frontend/README.md). Les choix d'authentification
sont documentés dans [docs/design/authentication.md](docs/design/authentication.md).

La base écoute sur le port `5432`. Surchargeable par `DATABASE_PORT`.
Le fichier `compose.override.yaml` permet de surcharger le compose de production pour les options de développement.

## Commandes racine

| Commande                          | Effet                                              |
| --------------------------------- | -------------------------------------------------- |
| `bun run dev`                     | Base + toutes les applications en mode watch.      |
| `bun run start`                   | Base + toutes les applications, sans watch.        |
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
