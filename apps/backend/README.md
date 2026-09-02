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
NestJS. Elles ne traversent ni le pipe de validation, ni le sérialiseur, ni le
log de requêtes — la bibliothèque valide avec ses propres schémas, et une
requête d'authentification n'est jamais loggée. Le handler répond à **tout** ce
qui passe sous ce préfixe, y compris ce qu'il ne connaît pas : NestJS ne peut
donc posséder aucune route sous `/auth`.

| Route                      | Effet                                             |
| -------------------------- | ------------------------------------------------- |
| `POST /auth/sign-up/email` | Crée le compte, ouvre la session, pose le cookie. |
| `POST /auth/sign-in/email` | Ouvre une session.                                |
| `POST /auth/sign-out`      | Supprime la session, expire les cookies.          |
| `GET /me`                  | Le compte connecté, dans la forme de cette API.   |
| `GET /admin/users`         | Liste des comptes, réservée au rôle `admin`.      |

Le contrat complet des 45 routes d'authentification est fusionné dans `/docs` :
elles n'ont pas de décorateur NestJS, donc leur schéma vient du plugin OpenAPI
de la bibliothèque.

**Deux rôles**, `user` et `admin`. Un compte créé par inscription est `user` ;
le rôle n'est jamais lu depuis le corps de la requête. Toutes les routes
d'administration exigent déjà un administrateur, donc le premier se pose hors
bande :

```bash
bun run auth:promote quelquun@exemple.fr
```

Le rôle est relu en base à chaque requête — il n'y a pas de cache de session,
volontairement : une promotion, une révocation ou un bannissement prennent effet
à la requête suivante, pas à l'expiration d'un cookie.

Les choix et leurs raisons sont dans
[docs/design/authentication.md](../../docs/design/authentication.md).

## Scripts base de données

| Commande                    | Effet                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| `bun run db:generate <Nom>` | Génère une migration depuis le diff des entities.                             |
| `bun run db:migrate`        | Applique les migrations en attente.                                           |
| `bun run db:show`           | Liste les migrations et leur état.                                            |
| `bun run db:revert`         | Annule la dernière migration appliquée.                                       |
| `bun run db:drop`           | Supprime tout le schéma. Refuse de tourner en production.                     |
| `bun run db:reset`          | `db:drop`, `db:migrate` puis `auth:migrate`. Refuse de tourner en production. |

Le schéma d'authentification a son propre migrateur, celui de Better Auth :
TypeORM ne déclare pas ses cinq tables et ne les voit donc pas. Il s'applique au
démarrage de l'application, comme les migrations TypeORM.

| Commande                              | Effet                                                   |
| ------------------------------------- | ------------------------------------------------------- |
| `bun run auth:migrate`                | Applique le schéma d'authentification en attente.       |
| `bun run auth:show`                   | Imprime le SQL manquant sans l'exécuter.                |
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
