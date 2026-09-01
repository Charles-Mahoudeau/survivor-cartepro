# CartePro

Dispositif d'avantages salariés dématérialisés — trois espaces : salarié,
partenaire, administration.

Projet Epitech tek3, cahier des charges `JEB/DNI/2026-002`.

## Structure

```
apps/backend/     Backend NestJS
apps/frontend/    Frontend NextJS
packages/     code partagé entre applications
flake.nix     socle : chaîne d'outils et base de données
scripts/db.ts base de données locale, native ou docker
```

## Démarrer

Le socle est [Nix](https://nixos.org) : il porte la chaîne d'outils **et** la
base de données. Avec lui et rien d'autre :

```bash
nix develop
cp .env.example .env
bun install
bun run dev
```

`nix develop` fournit bun, node et PostgreSQL 18. En entrant, le shell signale
ce qui manque — `.env`, les dépendances. Avec [direnv](https://direnv.net),
`direnv allow` une fois suffit à retrouver tout cela en arrivant dans le dossier.

`bun run dev` démarre la base puis toutes les applications en mode watch, depuis
n'importe où dans le dépôt. Le frontend répond sur http://localhost:3000, le
backend sur http://localhost:3001 et sa documentation sur
http://localhost:3001/docs. Les migrations en attente s'appliquent au démarrage
de l'application.

Détail des scripts et des conventions dans
[apps/backend/README.md](apps/backend/README.md).

La version de bun est celle de `flake.lock`. Elle vaut pour le devShell et pour
la CI, et deux endroits la recopient parce qu'ils ne savent pas lire le flake :
le champ `packageManager` de `package.json`, exigé par turbo pour résoudre le
workspace, et la ligne `FROM` des Dockerfile. Un `nix flake update nixpkgs` doit
donc les bouger ensemble.

## Base de données

`bun run db:up` démarre un PostgreSQL 18 natif, celui du flake. Un serveur
PostgreSQL, c'est un répertoire de données et un processus, en trois temps que
`scripts/db.ts` enchaîne : `initdb` crée le répertoire et le rôle, `pg_ctl`
démarre le serveur, `createdb` crée la base applicative. L'image docker fait
exactement cela dans son entrypoint.

Le cluster vit dans `~/.local/state/cartepro/<empreinte du chemin du clone>` :

- **Hors du dépôt**, parce que le serveur y crée une socket Unix. Un flake sur
  un chemin local recopie l'arbre de travail dans le magasin nix, dont le format
  ne connaît que fichiers, répertoires et liens symboliques : il s'arrête net
  sur une socket.
- **Par clone**, pour que deux copies du dépôt sur la même machine aient deux
  bases indépendantes. Elles se disputent en revanche le port : la deuxième
  demande un `DATABASE_PORT` différent dans son `.env`.

Le serveur n'écoute que sur la boucle locale, port **5432** par défaut,
surchargeable par `DATABASE_PORT`.

| Commande            | Effet                                                |
| ------------------- | ---------------------------------------------------- |
| `bun run db:up`     | Démarre la base, en l'initialisant au premier appel. |
| `bun run db:down`   | L'arrête, sans toucher aux données.                  |
| `bun run db:nuke`   | L'arrête et **supprime le cluster**.                 |
| `bun run db:status` | Dit si elle tourne, et où sont les données.          |
| `bun run db:shell`  | Ouvre un `psql` dessus.                              |

Chacune accepte `--docker`, qui passe par le service `postgres` de
`docker-compose.yaml` au lieu du binaire local.

## Docker

Docker est posé **par-dessus** le socle nix, pour deux usages.

- **Livrer.** `apps/backend/Dockerfile` et `apps/frontend/Dockerfile`
  construisent les deux images, chacune depuis un `turbo prune` du workspace.
- **Tourner sans nix.** `docker compose up` reste une voie complète pour qui n'a
  que docker : le backend attend que la base soit saine, et
  `compose.override.yaml` publie les ports en développement — `FRONTEND_PORT`,
  `BACKEND_PORT` et `DATABASE_PORT`.

`.env` sert les deux chemins. `DATABASE_HOST` y est l'adresse vue depuis
l'hôte ; dans le réseau compose, `docker-compose.yaml` donne au conteneur le nom
du service `postgres` à la place.

## Commandes racine

| Commande                          | Effet                                              |
| --------------------------------- | -------------------------------------------------- |
| `bun run dev`                     | Base + toutes les applications en mode watch.      |
| `bun run start`                   | Base + toutes les applications, sans watch.        |
| `bun run db:up` / `db:down`       | Démarre / arrête PostgreSQL 18 (voir plus haut).   |
| `bun run typecheck`               | Vérification de types sur toutes les applications. |
| `bun run lint` / `lint:check`     | ESLint, avec ou sans correction automatique.       |
| `bun run format` / `format:check` | Prettier, avec ou sans écriture.                   |
| `bun run test`                    | Tests unitaires.                                   |
| `bun run build`                   | Compilation de toutes les applications.            |

Les tâches passent par Turbo et sont mises en cache : relancer une commande sans
avoir modifié ses entrées ne recompile rien.

## Intégration continue

`.github/workflows/ci.yml` fait tourner les cinq tâches dans le flake, donc sur
les versions de `flake.lock` — la CI ne peut plus diverger du poste de
développement. Deux détails expliquent sa forme :

- **Deux shells.** `build` et `test` exigent un vrai node — `next build` y échoue sur
  « Expected CommonJS module to have a function wrapper » et `jest-runtime` sur
  « Attempted to assign to readonly property ».
- **Le magasin nix est mis en cache** entre les exécutions, par clé sur
  `flake.lock` — sans quoi chaque job retéléchargerait sa chaîne d'outils depuis
  cache.nixos.org. Le cache des dépendances bun est posé de la même façon, par
  clé sur `bun.lock`.

## Contribution

Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org).
Deux crochets Git sont installés automatiquement par `bun install` :

- `pre-commit` — vérification de types puis lint et format sur les fichiers indexés
- `commit-msg` — validation du message par commitlint

Une fonctionnalité tient dans une branche et une pull request.
