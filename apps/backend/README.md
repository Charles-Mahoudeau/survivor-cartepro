# @cartepro/backend

API NestJS du dispositif CartePro.

## Stack

|               |                    |
| ------------- | ------------------ |
| Runtime       | Bun 1.3            |
| Framework     | NestJS 12          |
| ORM           | TypeORM 1.1        |
| Base          | PostgreSQL 18      |
| Documentation | OpenAPI 3 + Scalar |

## Démarrer

Depuis la racine du dépôt :

```bash
bun install
cp .env.example .env
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env
bun run dev
```

Le `.env` est à la racine du dépôt, pas dans cette application : `docker compose`
le lit, et cette application le trouve en remontant depuis son dossier de
travail. Un `.env` local ici reste possible et prime, clé par clé.

Pour ne lancer que cette application, la base tournant déjà :

```bash
bun run --filter '@cartepro/backend' dev
```

- API : http://localhost:3000
- Documentation : http://localhost:3000/docs
- Contrat OpenAPI brut : http://localhost:3000/docs/json

Les migrations en attente sont appliquées automatiquement au démarrage de
l'application, donc récupérer une branche qui en ajoute une et lancer le serveur
suffit à être sur son schéma.

## Sonde

`GET /health` répond que le process est vivant. Elle ne touche pas la base.
C'est la seule route publique de l'API : la garde de session est globale, donc
tout le reste exige un compte connecté sauf annotation `@Public()` explicite.

## Authentification

Better Auth sert ses routes sous `/auth`, montées en middleware avant le routeur
NestJS. **Le frontend les appelle directement**, par le client Better Auth
construit avec le même `basePath` : cette API n'en réexpose aucune.

| Route                      | Effet                                               |
| -------------------------- | --------------------------------------------------- |
| `POST /auth/sign-up/email` | Crée le compte, ouvre la session, pose le cookie.   |
| `POST /auth/sign-in/email` | Ouvre une session.                                  |
| `POST /auth/sign-out`      | Supprime la session, expire les cookies.            |
| `GET /auth/get-session`    | La session courante, ou `null`.                     |
| `/auth/admin/*`            | Liste, rôle, bannissement. Réservé au rôle `admin`. |

Le contrat complet des 45 routes est fusionné dans `/docs` : elles n'ont pas de
décorateur NestJS, donc leur schéma vient du plugin OpenAPI de la bibliothèque.

Ces routes ne traversent ni le pipe de validation, ni le sérialiseur, ni le log
de requêtes — la bibliothèque valide avec ses propres schémas, et une requête
d'authentification n'est jamais loggée. Le handler répond à **tout** ce qui passe
sous ce préfixe, y compris ce qu'il ne connaît pas, donc NestJS ne peut posséder
aucune route sous `/auth`.

### Protéger une route

`SessionGuard` et `RolesGuard` sont globales. Une route est protégée sauf
`@Public()` explicite — `/health` est la seule à s'en exempter.

```ts
@Get('solde')
@Roles(ROLES.ADMIN)
lire(@CurrentUser() user: AuthUser) { … }
```

| Refus                           | Code                  |
| ------------------------------- | --------------------- |
| Aucune session, session expirée | `401 UNAUTHENTICATED` |
| Bannissement en cours           | `403 ACCOUNT_BANNED`  |
| Rôle absent de `@Roles(...)`    | `403 FORBIDDEN_ROLE`  |

### Rôles

**Deux rôles**, `user` et `admin`. Un compte créé par inscription est `user` ; le
rôle n'est jamais lu depuis le corps de la requête. Toutes les routes
d'administration exigent déjà un administrateur, donc le premier se pose hors
bande :

```bash
bun run auth:promote quelquun@exemple.fr
```

Le rôle est relu en base à chaque requête — il n'y a pas de cache de session,
volontairement : une promotion, une révocation ou un bannissement prennent effet
à la requête suivante, pas à l'expiration d'un cookie.

### Schéma

Les cinq tables (`user`, `session`, `account`, `verification`, `rate_limit`) sont
des entities TypeORM dans `src/modules/user/entities/`. Elles sont créées,
altérées et supprimées par nos migrations comme toutes les autres — `db:generate`
les voit, `db:reset` les remet. Better Auth les lit et les écrit par sa propre
connexion ; le mapping entre ses noms de champs camelCase et nos colonnes
`snake_case` est **calculé** dans `src/config/auth/auth.schema.ts` avec la
fonction que `SnakeNamingStrategy` utilise, jamais recopié.

> **`NODE_ENV` doit exister avant le premier import de la bibliothèque.** Elle le
> lit une seule fois, au chargement de son module, et cette lecture décide de la
> limitation de débit, de l'attribut `Secure` des cookies et du repli d'adresse
> IP. D'où `import './config/env/load-env'` en première ligne de `main.ts`.

Les choix et leurs raisons sont dans
[docs/design/authentication.md](../../docs/design/authentication.md).

## Scripts base de données

| Commande                    | Effet                                                         |
| --------------------------- | ------------------------------------------------------------- |
| `bun run db:generate <Nom>` | Génère une migration depuis le diff des entities.             |
| `bun run db:migrate`        | Applique les migrations en attente.                           |
| `bun run db:show`           | Liste les migrations et leur état.                            |
| `bun run db:revert`         | Annule la dernière migration appliquée.                       |
| `bun run db:drop`           | Supprime tout le schéma. Refuse de tourner en production.     |
| `bun run db:reset`          | `db:drop` puis `db:migrate`. Refuse de tourner en production. |

Les cinq tables d'authentification passent par ce même chemin : ce sont des
entities comme les autres.

| Commande                              | Effet                                                   |
| ------------------------------------- | ------------------------------------------------------- |
| `bun run auth:promote <email> [rôle]` | Donne un rôle à un compte existant. Par défaut `admin`. |

`synchronize` n'existe pas, et il n'y a pas de variable d'environnement pour le
réactiver. Le cahier des charges impose que les transactions validées soient
non modifiables (§3.2), et une passe de synchronisation de schéma est exactement
ce qui peut réécrire la table qui les contient. Toute évolution de schéma passe
par une migration.

## Documentation d'API

`SwaggerModule` sert le contrat OpenAPI lui-même sur `/docs/json`, Scalar en rend
la version lisible sur `/docs`. Le document est construit à partir des
décorateurs, donc il ne peut pas diverger du code.

Pour en livrer un fichier :

```bash
curl -s http://localhost:3000/docs/json > openapi.json
```

## Conventions

**Clés primaires.** Postgres 18 fournit `uuidv7()` nativement. Une clé UUIDv7 est
triable chronologiquement, ce qui donne une pagination par curseur efficace sur
le catalogue partenaires (§3.4) et un ordre naturel sur l'historique des
transactions, sans exposer de compteur séquentiel qui laisserait deviner le
volume national.

**Nommage SQL.** `SnakeNamingStrategy` traduit les identifiants camelCase en
snake_case : une propriété `createdAt` devient une colonne `created_at` sans
`@Column({ name })`.

**Sérialisation.** `ClassSerializerInterceptor` est actif globalement, donc un
`@Exclude()` sur une propriété d'entity la retire réellement de la réponse.
Attention à sa limite : il n'agit que sur de vraies instances de classe, un objet
brut renvoyé par `getRawMany()` passe au travers sans être filtré.

**Logs.** Une ligne en entrée, une en sortie. Le corps de réponse n'est jamais
loggé, et l'URL loggée est le chemin seul — jamais la query string brute, qui
réafficherait en clair les paramètres que la denylist vient de masquer. Les
paramètres n'atteignent le log qu'à travers leur version redactée.

La denylist (`src/common/constants/logging.constants.ts`) masque les
identifiants de connexion, le QR de paiement et ses jetons, les données
personnelles des salariés, l'identité entreprise des partenaires, et les
montants. Elle laisse lisibles les identifiants techniques (`transactionId`,
`partnerId`) : ce sont les seuls repères qui restent pour corréler les deux
lignes d'une requête.

Le matching est **exact sur la clé normalisée** (minuscules, `_` et `-`
supprimés), jamais en sous-chaîne — sinon `translation` matcherait `lat` et
`credited` matcherait `credit`, et les logs deviendraient inutiles sans que
personne ne s'en aperçoive.
