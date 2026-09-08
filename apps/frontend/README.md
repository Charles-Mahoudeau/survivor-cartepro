# @tickettout/frontend

Application web du dispositif CartePro.

## Stack

|           |                        |
| --------- | ---------------------- |
| Runtime   | Bun 1.3                |
| Framework | Next.js 16             |
| UI        | React 19, shadcn/ui    |
| Styles    | Tailwind 4             |
| Tests     | `bun test`             |
| Polices   | Geist Sans, Geist Mono |

## Démarrer

`bun run dev` depuis la racine démarre la base, l'API et le web ensemble. Le web
répond alors sur http://localhost:3000.

Pour ne lancer que cette application, sans base ni API :

```bash
bun run --filter '@tickettout/frontend' dev
```

Les écrans qui appellent l'API échouent tant qu'elle ne tourne pas.

## Compiler et servir

```bash
bun run --filter '@tickettout/frontend' build
bun run --filter '@tickettout/frontend' start
```

`start` sert le résultat de `build` : il échoue s'il n'a pas été lancé avant.
Le port reste 3000, réglable par `FRONTEND_PORT`.

Depuis la racine, `bun run build` compile toutes les applications ; `bun run start`
les sert toutes, la base comprise.

## Scripts

| Commande                          | Effet                                                |
| --------------------------------- | ---------------------------------------------------- |
| `bun run dev`                     | Serveur de développement.                            |
| `bun run build`                   | Compilation de production.                           |
| `bun run start`                   | Sert la compilation. Exige un `build` préalable.     |
| `bun run typegen`                 | Types de routes générés par Next dans `.next/types`. |
| `bun run typecheck`               | `typegen` puis `tsc --noEmit`.                       |
| `bun run lint` / `lint:check`     | ESLint, avec ou sans correction automatique.         |
| `bun run format` / `format:check` | Prettier, avec ou sans écriture.                     |
| `bun run test`                    | Tests unitaires.                                     |
| `bun run test:watch`              | Tests en mode surveillance.                          |
| `bun run test:cov`                | Tests avec la couverture.                            |

Les cinq tâches vérifiées par la CI — `format:check`, `lint:check`, `typecheck`,
`test`, `build`

`typecheck` lance `typegen` d'abord parce que `LayoutProps`, `PageProps` et les
autres types de routes sont générés par Next dans `.next/types`, absent d'un
dépôt fraîchement cloné.

## Docker

Le `Dockerfile` du paquet produit une image autonome à partir de la sortie
`standalone` de Next. Il est construit par `docker-compose.yaml` à la racine.
