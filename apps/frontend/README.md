# @cartepro/frontend

Application web du dispositif CartePro.

## Stack

|           |                                          |
| --------- | ---------------------------------------- |
| Runtime   | Bun 1.3                                  |
| Framework | Next.js 16                               |
| UI        | React 19, shadcn/ui                      |
| Styles    | Tailwind 4                               |
| Tests     | `bun test`                               |
| Polices   | Marianne, Spectral, Geist Mono — locales |

## Démarrer

Depuis la racine du dépôt :

```bash
bun install
bun run dev
```

Pour ne lancer que cette application :

```bash
bun run --filter '@cartepro/frontend' dev
```

- Web : http://localhost:3000
- API : http://localhost:3001
