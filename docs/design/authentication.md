# Authentification — spécification d'implémentation

> **Source** : cahier des charges `JEB/DNI/2026-002` §3.1 (« authentification
> multi-rôles avec sessions »), documentation Better Auth 1.7.2.
> **Portée** : inscription, connexion, déconnexion, les trois rôles du
> dispositif, garde de session côté NestJS, limitation de débit. Hors portée :
> le domaine partenaire, l'usage des clés d'API, la vérification d'e-mail, la
> réinitialisation de mot de passe, la fédération OAuth.
> **Vérifié contre** : `better-auth@1.7.2`, `@nestjs/common@12.0.1`,
> `express@5.2.1`, PostgreSQL 18, Bun 1.3.14.

## 1. Ce que ce lot livre

| Capacité                     | Servi par                                   |
| ---------------------------- | ------------------------------------------- |
| Créer un compte salarié      | `POST /auth/sign-up/email`                  |
| Se connecter                 | `POST /auth/sign-in/email`                  |
| Se déconnecter               | `POST /auth/sign-out`                       |
| Lire sa session              | `GET /auth/get-session`                     |
| Administrer les comptes      | `/auth/admin/*` (liste, rôle, bannissement) |
| Protéger une route métier    | `SessionGuard`, globale                     |
| Réserver une route à un rôle | `@Roles(ROLES.ADMIN)`                       |
| Promouvoir un compte         | `bun run auth:promote <email> [rôle]`       |
| Poser le schéma              | `bun run db:migrate`, appliqué au démarrage |

Les routes d'authentification sont servies par Better Auth et appelées
**directement par le frontend**, à travers son client (`better-auth/react`,
construit avec le même `basePath`). Cette API n'en réexpose aucune (§2, D11).

Trois rôles, un par espace du sujet : `employee`, `partner`, `admin`. Un compte
en porte exactement un — `user.role` est une colonne scalaire, rien n'y écrit de
liste. L'inscription attribue `employee` ; les deux autres se donnent hors bande,
un compte partenaire étant validé par l'administration avant de pouvoir
encaisser.

## 2. Décisions verrouillées

| #   | Décision                                                                                   | Raison                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Better Auth porte la **logique** d'authentification, pas le schéma.                        | Mots de passe, sessions, rôles et bannissement sont du code déjà écrit et déjà audité. Les tables, elles, sont du domaine de ce dépôt.                                     |
| D2  | Le schéma appartient à TypeORM : six entities, migrations par `db:generate`.               | §3. Une seule source de vérité, un seul migrateur, et une clé étrangère métier vers `user.id` devient une relation ordinaire.                                              |
| D3  | Aucun second migrateur. Le schéma s'applique au démarrage comme les autres.                | Le dépôt promet déjà « récupérer une branche et lancer le serveur suffit à être sur son schéma ». Une promesse, un mécanisme.                                              |
| D4  | Montage à `/auth`, pas à `/api/auth`.                                                      | Le préfixe global `api` et le versioning d'URI ne s'appliquent qu'au routeur NestJS, et le handler est monté avant lui. Le client web utilise le même `basePath`. Voir O9. |
| D5  | Pas de plugin `organization`.                                                              | Il modélise des espaces à plusieurs membres avec invitations ; le sujet décrit un compte partenaire unique. Refusé le 2026-09-01.                                          |
| D6  | Pas de `cookieCache`.                                                                      | §11 — un cache garde un compte banni et un rôle périmé vivants jusqu'à son expiration. Ce lot existe pour bannir et promouvoir.                                            |
| D7  | Clés primaires `uuid` avec défaut `uuidv7()`, comme toutes les tables.                     | `generateId: false` laisse la base générer. Sans ça les identifiants d'auth seraient des chaînes base62 et les FK métier des colonnes `text`.                              |
| D8  | La bibliothèque `@thallesp/nestjs-better-auth` n'est pas utilisée.                         | §7.1 — elle déclare `@nestjs/common@^11.1.6` en peer non optionnelle, ce dépôt est en NestJS 12.                                                                           |
| D9  | Longueur minimale de mot de passe : 12 caractères.                                         | Recommandation ANSSI-PG-078 pour un compte sans second facteur. La valeur par défaut de la bibliothèque est 8.                                                             |
| D10 | Limitation de débit activée, stockée en base.                                              | Les routes d'authentification sont la surface brute-forçable de ce lot. Le stockage mémoire perd son compteur à chaque redémarrage.                                        |
| D11 | **Aucun controller NestJS d'authentification.**                                            | §5.2 — le client Better Auth du frontend appelle `/auth/*` directement. Un controller qui les réexpose est une seconde copie du contrat.                                   |
| D12 | Colonnes en `snake_case`, mapping **calculé**, jamais recopié.                             | §4.2 — le mapping et la stratégie de nommage partagent une seule implémentation, donc ils ne peuvent pas diverger.                                                         |
| D13 | `NODE_ENV` est chargé **avant** le premier import de la bibliothèque.                      | §7.4 — elle le lit une seule fois, au chargement de son module, et cette lecture décide des cookies `Secure` et du repli d'adresse IP.                                     |
| D14 | Limitation de débit et contrôle d'origine **épinglés**, jamais déduits de l'environnement. | §7.4 — les deux défauts de la bibliothèque se calculent depuis `NODE_ENV`. Un contrôle de sécurité qui s'éteint sur un nom d'environnement n'en est pas un.                |
| D15 | Isolation des tests par TRUNCATE, suite en série.                                          | §12 — Better Auth écrit par son propre pool : un rollback de transaction TypeORM ne verrait rien de ses écritures et ne les annulerait pas.                                |

## 3. Pourquoi le schéma est à nous

Better Auth sait poser ses tables lui-même : `getMigrations()` construit un plan
et l'exécute par Kysely. Ce chemin a été écarté.

| Critère                              | Migrateur Better Auth                                                                           | Entities TypeORM (retenu)           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| Nombre de migrateurs sur une base    | 2                                                                                               | 1                                   |
| `db:drop` puis remise en état        | deux commandes, dont une que le dépôt doit inventer                                             | `db:reset`, inchangé                |
| Nommage des colonnes                 | `"camelCase"` cité, contre `snake_case` partout ailleurs                                        | `snake_case`, `SnakeNamingStrategy` |
| Clé primaire                         | `text` base62 générée en JS                                                                     | `uuid` `DEFAULT uuidv7()`           |
| FK d'une table métier vers `user.id` | colonne `text` vers une table que l'ORM ne déclare pas — entity miroir non gérée, `@ForeignKey` | `@ManyToOne` ordinaire              |
| Ce que `db:generate` voit            | rien : il proposerait de créer ce qui existe déjà                                               | le schéma complet                   |

Le coût de l'inversion est un mapping de noms de champs (§4.2), calculé et
testé. Le coût de l'autre chemin se serait payé à chaque table métier qui
référence un compte.

## 4. Modèle de données

Six entities dans `src/modules/user/entities/`, deux migrations générées par
`bun run db:generate`.

`api_key.reference_id` ne porte volontairement aucune clé étrangère. Le plugin
n'en déclare pas, et ce qu'une clé représente n'est pas tranché : une clé pour un
SIRH appartient plus vraisemblablement à un employeur qu'à une personne. La
contraindre vers `user.id` aujourd'hui serait à défaire par le lot qui répond à
la question.

### 4.1 Ce que chaque table porte, et ce qui casse sans elle

| Table          | Rôle                                                                     | Sans elle                                                                                                   |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `user`         | L'identité : e-mail unique, nom, rôle, état de bannissement.             | Rien à authentifier.                                                                                        |
| `account`      | Le moyen de preuve. Le hash du mot de passe vit ici, pas sur `user`.     | Le hash finirait sur `user`, donc dans chaque projection qui sert un profil.                                |
| `session`      | Une ligne par session ouverte, avec son jeton, son IP et son user-agent. | Pas de déconnexion réelle ni de révocation à distance : un jeton signé vit jusqu'à expiration.              |
| `verification` | Jetons à durée de vie courte (changement d'e-mail, réinitialisation).    | Les flux qui les consomment échouent à la première utilisation, pas au démarrage.                           |
| `rate_limit`   | Compteur par clé pour la limitation de débit.                            | Le compteur repart à zéro à chaque redémarrage, donc à chaque déploiement.                                  |
| `api_key`      | Clés de la surface tierce (§3.3, un SIRH lisant un solde).               | Rien aujourd'hui : aucune route n'en consomme. La table est posée avec le reste plutôt que seule plus tard. |

La séparation `user` / `account` est ce qui fait qu'un mot de passe ne peut pas
fuir par une route de profil : `ClassSerializerInterceptor` ne filtre que de
vraies instances de classe, et une projection brute passerait au travers. Ici il
n'y a rien à filtrer, la colonne est dans une autre table.

Cette section est la référence de la fiche de registre RGPD art. 30 exigée pour
vendredi : `user.email`, `user.name`, `session.ip_address` et
`session.user_agent` sont les seules données à caractère personnel de ce lot.

### 4.2 Le mapping des noms

Better Auth nomme ses champs en camelCase, nos colonnes sont en `snake_case`.
Le mapping n'est pas une table écrite à la main : il est **calculé** dans
`src/config/auth/auth.schema.ts` par la fonction `snakeCase` que
`SnakeNamingStrategy` utilise pour produire le DDL.

```ts
function columnsOf(...fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, snakeCase(field)]));
}
```

Deux descriptions de la même règle finiraient par diverger ; ici il n'y en a
qu'une. Seuls les **noms** des champs sont listés, et seulement ceux que la
transformation change — `email` et `token` se mappent sur eux-mêmes. Un nom
manquant échoue bruyamment à la première requête qui touche la colonne, jamais
en silence.

Les colonnes du plugin `admin` (`role`, `banned`, `ban_reason`, `ban_expires`,
`impersonated_by`) passent par `admin({ schema })`, même mécanisme. Elles sont
déclarées comme entities au même titre que les autres : une colonne qu'aucune
entity ne déclare est une colonne que `db:generate` proposerait de supprimer.

### 4.3 Schéma appliqué

Extrait de `database/migrations/*-AuthenticationSchema.ts`, généré :

```sql
CREATE TABLE "user" (
  "id" uuid NOT NULL DEFAULT uuidv7(), "name" text NOT NULL,
  "email" text NOT NULL, "email_verified" boolean NOT NULL DEFAULT false,
  "image" text, "role" text, "banned" boolean DEFAULT false,
  "ban_reason" text, "ban_expires" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_…" UNIQUE ("email"), CONSTRAINT "PK_…" PRIMARY KEY ("id"));

CREATE TABLE "session" (
  "id" uuid NOT NULL DEFAULT uuidv7(), "token" text NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ip_address" text,
  "user_agent" text, "impersonated_by" text, "user_id" uuid NOT NULL, …);
CREATE INDEX … ON "session" ("user_id");
ALTER TABLE "session" ADD CONSTRAINT "FK_…"
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
```

`account` porte en plus `password` et les jetons OAuth, avec un unique
`(issuer, account_id)`. `verification` a un index sur `identifier` — non unique,
une adresse peut avoir plusieurs preuves en attente.

Les identifiants sont bien des UUIDv7 : un compte créé par inscription reçoit
`01a062a4-6fcf-7862-…`, généré par Postgres et non par la bibliothèque.

## 5. Surface HTTP

### 5.1 Routes servies par Better Auth

47 routes sous `/auth`. Celles qui portent ce lot :

| Méthode | Route                    | Rôle requis | Effet                                                       |
| ------- | ------------------------ | ----------- | ----------------------------------------------------------- |
| `POST`  | `/auth/sign-up/email`    | —           | Crée `user` + `account`, ouvre une session, pose le cookie. |
| `POST`  | `/auth/sign-in/email`    | —           | Vérifie le mot de passe, ouvre une session.                 |
| `POST`  | `/auth/sign-out`         | session     | Supprime la ligne `session`, expire les trois cookies.      |
| `GET`   | `/auth/get-session`      | session     | Renvoie `{ session, user }`, ou `null`.                     |
| `GET`   | `/auth/list-sessions`    | session     | Sessions ouvertes du compte courant.                        |
| `POST`  | `/auth/change-password`  | session     | Change le mot de passe, révoque optionnellement les autres. |
| `GET`   | `/auth/admin/list-users` | `admin`     | Liste paginée des comptes.                                  |
| `POST`  | `/auth/admin/set-role`   | `admin`     | Change le rôle d'un compte.                                 |
| `POST`  | `/auth/admin/ban-user`   | `admin`     | Bannit, avec motif et échéance, et révoque ses sessions.    |
| `GET`   | `/auth/ok`               | —           | Sonde de vie de la couche d'authentification.               |

### 5.2 Pourquoi NestJS n'en réexpose aucune

Le frontend parle à ces routes par le client Better Auth, qui connaît leurs
chemins, leurs corps et leurs cookies. Un controller NestJS `GET /me` qui
appelle `auth.api.getSession` pour renvoyer les mêmes champs serait une seconde
description du même contrat : deux formes à documenter, deux à faire évoluer, et
une qui finit en retard sur l'autre.

Deux contraintes rendent d'ailleurs la duplication coûteuse :

- Le handler monté à `/auth` répond à **toute** requête du préfixe, y compris
  celles qu'il ne connaît pas — `GET /auth/inexistant` renvoie `404` sans passer
  la main au routeur NestJS. Une route NestJS d'authentification devrait donc
  vivre ailleurs que sous `/auth`, avec un nommage qui ment.
- Le contrat des 47 routes est déjà publié : le plugin `openAPI` en produit le
  schéma, que `swagger.ts` fusionne dans le document NestJS (§7.5).

Ce que NestJS apporte, c'est la **garde**, pas la route : le jour où une route
métier existe, elle est protégée par défaut et peut nommer les rôles qu'elle
accepte.

### 5.3 Routes présentes mais inopérantes

| Route                                | Réponse observée                                           |
| ------------------------------------ | ---------------------------------------------------------- |
| `POST /auth/request-password-reset`  | `400 RESET_PASSWORD_DISABLED` — aucun `sendResetPassword`. |
| `POST /auth/send-verification-email` | `400 VERIFICATION_EMAIL_NOT_ENABLED`                       |
| `POST /auth/delete-user`             | `404` — la route n'est pas enregistrée, option désactivée. |
| `POST /auth/sign-in/social`          | Aucun fournisseur configuré.                               |

Elles deviennent opérantes le jour où un envoi d'e-mail existe. C'est une
décision ouverte (§13), pas un oubli.

## 6. Fonctionnalités

### F1 — Inscription

```mermaid
sequenceDiagram
    participant C as Client Better Auth (front)
    participant E as Express (helmet, CORS)
    participant B as Better Auth
    participant D as PostgreSQL

    C->>E: POST /auth/sign-up/email {name, email, password}
    E->>B: handler monté avant le routeur NestJS
    B->>B: origine dans trustedOrigins ? sinon 403
    B->>B: longueur du mot de passe >= 12 ? sinon 400
    B->>D: insert user (id = uuidv7(), role = 'user')
    B->>D: insert account (provider_id = 'credential', password = scrypt(...))
    B->>D: insert session (token, expires_at, ip_address, user_agent)
    B-->>C: 200 {token, user} + Set-Cookie better-auth.session_token
```

`autoSignIn` est actif : l'inscription ouvre la session. Le rôle vient de
`defaultRole`, il n'est jamais accepté depuis le corps de la requête.

### F2 — Connexion

```mermaid
sequenceDiagram
    participant C as Client Better Auth (front)
    participant B as Better Auth
    participant D as PostgreSQL

    C->>B: POST /auth/sign-in/email {email, password}
    B->>D: select account where provider_id = 'credential'
    alt e-mail inconnu ou mot de passe faux
        B->>B: opération factice de même coût
        B-->>C: 401, message identique dans les deux cas
    else compte banni
        B-->>C: 403 + bannedUserMessage
    else
        B->>D: insert session
        B-->>C: 200 + Set-Cookie
    end
```

Le message identique entre « e-mail inconnu » et « mot de passe faux » est ce
qui empêche d'énumérer les comptes du dispositif.

### F3 — Déconnexion

```mermaid
sequenceDiagram
    participant C as Client Better Auth (front)
    participant B as Better Auth
    participant D as PostgreSQL

    C->>B: POST /auth/sign-out (cookie de session, en-tête Origin)
    B->>B: origine de confiance ? sinon 403
    B->>D: delete session where token = ...
    B-->>C: 200 {success:true} + expiration des trois cookies
```

Les trois cookies expirés sont `better-auth.session_token`,
`better-auth.session_data` et `better-auth.dont_remember`. La ligne `session`
est **supprimée**, pas marquée : un jeton volé avant la déconnexion ne vaut plus
rien à la requête suivante, ce que D6 protège en refusant le cache de session.

### F4 — Requête sur une route métier

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Routeur NestJS
    participant G as SessionGuard
    participant B as auth.api.getSession
    participant D as PostgreSQL

    C->>N: GET /une-route-metier (cookie de session)
    N->>G: canActivate
    alt route marquée @Public()
        G-->>N: true, sans lecture
    else
        G->>B: getSession({ headers })
        B->>D: select session join user
        alt aucune session
            G-->>C: 401 UNAUTHENTICATED
        else bannissement en cours
            G-->>C: 403 ACCOUNT_BANNED
        else
            G->>G: request.session = {session, user}
            G-->>N: true
        end
    end
```

La garde est globale : une route est protégée sauf `@Public()` explicite. Le
défaut inverse laisserait un controller ouvert par omission, et une omission ne
se voit pas en revue. `/health` est la seule route qui s'en exempte.

Le bannissement est réévalué ici et pas seulement à la connexion. `ban-user`
révoque les sessions du compte, donc ce chemin-là finit en `401` ; ce que la
garde couvre, c'est la colonne posée **hors bande** — un script, une correction
de données — pendant qu'une session est vivante. Vérifié dans les deux sens :
`banned` posé en base sur une session ouverte donne `403`, et la même ligne avec
`ban_expires` dans le passé repasse à `200`.

### F5 — Route réservée à l'administration

```mermaid
sequenceDiagram
    participant C as Client
    participant G as SessionGuard
    participant R as RolesGuard
    participant H as Handler

    C->>G: GET /une-route-admin
    G->>R: session résolue, request.session posée
    R->>R: @Roles(ADMIN) ? session.user.role dans la liste ?
    alt rôle insuffisant
        R-->>C: 403 FORBIDDEN_ROLE
    else
        R->>H: passe
        H-->>C: 200
    end
```

Le rôle est relu en base à chaque requête (D6). Vérifié : une promotion par
`auth:promote` fait passer la **même** session ouverte de `403` à `200`, sans
reconnexion.

### F6 — Amorçage du premier administrateur

```mermaid
sequenceDiagram
    participant O as Opérateur
    participant S as bun run auth:promote
    participant T as Repository<User> (TypeORM)
    participant D as PostgreSQL

    O->>S: auth:promote nolan@exemple.fr
    S->>T: findOne({ where: { email } })
    alt compte inconnu
        S-->>O: sortie non nulle, rien n'est écrit
    else
        S->>T: update({ id }, { role: 'admin' })
        T->>D: update "user" set "role" = 'admin'
        S-->>O: ancien rôle -> nouveau rôle
    end
```

Le plugin `admin` n'expose que des routes qui exigent déjà un administrateur :
sans amorçage hors bande, aucun premier administrateur ne peut exister. C'est un
script et pas un endpoint — une route HTTP qui distribue le rôle admin est une
route que quelqu'un finit par appeler. Il écrit par l'entity, donc zéro SQL brut
et le nom de colonne vient d'où vient la migration.

### F7 — Application du schéma au démarrage

```mermaid
sequenceDiagram
    participant A as AppModule
    participant T as TypeOrmModule
    participant D as PostgreSQL

    A->>T: forRootAsync (migrationsRun: true)
    T->>D: applique les migrations en attente
    Note over T,D: les cinq tables d'authentification en font partie,<br/>comme n'importe quelle table du domaine
```

Il n'y a rien de spécifique à l'authentification dans ce diagramme, et c'est
exactement l'intérêt de D2.

## 7. Intégration NestJS

### 7.1 Pourquoi pas `@thallesp/nestjs-better-auth`

| Constat                                                                                  | Conséquence                                                           |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `peerDependencies` : `@nestjs/common@^11.1.6`, `@nestjs/core@^11.1.6`, non optionnelles. | Ce dépôt est en `@nestjs/common@^12.0.1`. Peer non satisfaite.        |
| Le paquet impose `bodyParser: false` sur toute l'application et réinstalle ses parseurs. | La configuration de parsing de l'API entière passe sous son contrôle. |
| Il enregistre son propre `AuthGuard` global, ses décorateurs et son layout de module.    | Deux conventions de garde et de module dans le même dépôt.            |
| Communauté, dernière publication 2026-07-04.                                             | Un correctif dépend d'un tiers.                                       |

Ce qu'il apporte réellement — monter le handler, lire la session, une garde,
trois décorateurs — tient dans une centaine de lignes aux conventions du dépôt.

### 7.2 Montage du handler

```ts
// src/bootstrap.ts
app.use(helmet({ contentSecurityPolicy: false }));
app.enableCors({ origin: trustedOrigins(), credentials: true });
app.use(AUTH_BASE_PATH, resolveClientAddress, toNodeHandler(auth));
// … puis, pour le routeur NestJS seulement :
app.setGlobalPrefix(API_PREFIX, { exclude: ['docs', 'health'] });
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: API_DEFAULT_VERSION,
});
```

Trois choses rendent ce montage correct, vérifiées et non supposées :

1. **Le chemin est reconstruit.** `app.use(path, handler)` retire le préfixe de
   `req.url` ; l'adaptateur Node de Better Auth relit `req.baseUrl` et le
   recompose, donc la route reçue est bien `/auth/sign-up/email`.
2. **Le parseur de corps de NestJS ne gêne pas.** L'adaptateur lit le flux brut
   quand il est encore lisible et, sinon, resérialise `req.body`.
   `bodyParser: false` n'est donc pas nécessaire — contrairement à ce que
   documente la bibliothèque communautaire, écrite pour des versions antérieures.
3. **L'ordre place le handler avant le routeur.** `app.use()` s'applique à
   l'instance Express immédiatement, tandis que NestJS enregistre ses parseurs et
   son routeur pendant `app.listen()`. C'est aussi pourquoi `setGlobalPrefix` ne
   déplace pas `/auth` : il ne réécrit que les routes du routeur NestJS.

### 7.3 Ce que les routes `/auth` ne traversent pas

| Élément global               | Traverse `/auth` ? | Conséquence                                                              |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `helmet`                     | oui                | En-têtes de sécurité posés.                                              |
| CORS                         | oui                | À condition d'être activé **avant** le montage (§7.4).                   |
| `LoggingInterceptor`         | **non**            | Aucune ligne de log sur les routes d'authentification.                   |
| `ValidationPipe`             | **non**            | Better Auth valide avec ses propres schémas Zod.                         |
| `ClassSerializerInterceptor` | **non**            | Les réponses sont celles de la bibliothèque, pas des instances d'entity. |
| Document OpenAPI de NestJS   | **non**            | Les 47 routes sont absentes de `/docs` sans traitement (§7.5).           |

L'absence de log n'est pas une régression de traçabilité : la denylist de
redaction masque déjà les identifiants de connexion, et une route non loggée ne
peut pas fuir un mot de passe par le log. À rouvrir le jour où il faudra tracer
les tentatives échouées — `databaseHooks.session.create.after` est le point
d'accroche.

### 7.4 Les deux pièges d'ordre

Ce sont les deux défauts qui ne se voient qu'en exécutant.

**CORS avant le montage.** Le handler répond à tout ce qui passe sous son
préfixe et ne connaît pas `OPTIONS` : un préflight qui l'atteint reçoit `404`, et
le navigateur n'envoie jamais la connexion qui devait suivre.

| Ordre                     | `OPTIONS /auth/sign-in/email`                           |
| ------------------------- | ------------------------------------------------------- |
| handler puis `enableCors` | `404`, aucun en-tête `Access-Control-*`                 |
| `enableCors` puis handler | `204` + `Access-Control-Allow-Origin` et `-Credentials` |

**`NODE_ENV` avant le premier import.** `@better-auth/core` lit `NODE_ENV`
**une seule fois**, à l'évaluation de son module :

```js
const nodeENV = env.NODE_ENV ?? '';
const isProduction = nodeENV === 'production';
const isDevelopment = () => nodeENV === 'dev' || nodeENV === 'development';
```

Cette lecture unique décide de trois choses : la limitation de débit (activée par
défaut **en production**), l'attribut `Secure` des cookies, et le repli sur
`127.0.0.1` quand aucun en-tête ne porte l'IP. Une valeur vide n'est ni l'un ni
l'autre — les trois sont perdues, silencieusement.

Bun charge automatiquement un `.env` du répertoire courant, mais **pas** celui de
la racine du dépôt quand on tourne depuis `apps/backend` (vérifié). Le `.env`
étant à la racine (§9), `import './config/env/load-env'` est donc la **première**
ligne d'import de `main.ts` et de `auth.ts`, avant tout module qui capture
l'environnement. Preuve observable : `session.ip_address` vaut `127.0.0.1` avec
l'ordre correct, et la chaîne vide sans lui.

En conteneur, `NODE_ENV` est passé explicitement par `docker-compose.yaml` : il
n'y a pas de `.env` dans l'image, donc rien ne le poserait autrement.

**Deux contrôles de sécurité se calculent depuis cette même lecture**, et les
deux sont désormais épinglés dans la configuration plutôt que déduits :

| Option                        | Défaut de la bibliothèque          | Ce que valait le défaut ici                                     |
| ----------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `rateLimit.enabled`           | activé **en production** seulement | éteint partout ailleurs, y compris sous un `NODE_ENV` vide      |
| `advanced.disableOriginCheck` | `disableOriginCheck ?? isTest()`   | contrôle CSRF **désactivé** dès que `NODE_ENV=test` ou `TEST=1` |

Le second a été trouvé en écrivant les tests : une assertion « une origine
hostile reçoit 403 » passait en `200` sans rien signaler, parce que le harnais
pose `NODE_ENV=test`. Un test vert qui ne teste rien est pire que pas de test —
et le même défaut existe hors des tests, `isTest()` honorant aussi une variable
`TEST` que n'importe quelle CI peut poser.

### 7.5 Documentation d'API

Le plugin `openAPI` publie le schéma des routes d'authentification sur
`GET /auth/open-api/generate-schema`, et `auth.api.generateOpenAPISchema()` le
rend en mémoire. `buildOpenApiDocument()` fusionne ses `paths` et ses
`components.schemas` dans le document NestJS au démarrage, préfixés par le
`basePath` — 48 chemins au total, dont 45 d'authentification et `/health`.

Le rendu Scalar par défaut du plugin est désactivé : une seule page de
documentation, celle du dépôt. Le schéma de sécurité déclaré est le cookie de
session, qui est ce que cette API lit réellement.

## 8. Garde de session et rôles

```
src/common/guards/session.guard.ts    ← résout la session, refuse 401 / 403
src/common/guards/roles.guard.ts      ← compare @Roles au rôle de la session
src/common/decorators/                ← @Public, @Roles, @CurrentUser
src/common/utils/ban.util.ts          ← isBanActive(user, now), pure
src/config/auth/auth.module.ts        ← enregistre les deux gardes en APP_GUARD
```

Les gardes vivent dans `src/common/`, à côté du `LoggingInterceptor`, et non dans
un module de domaine : ce sont des éléments transverses de la couche HTTP, comme
lui. Il n'y a pas de module `auth` dans `src/modules/` — il n'aurait ni table ni
route à lui.

`SessionGuard` interroge `auth.api.getSession` plutôt que la table `session`. Le
jeton du cookie n'est pas la colonne : le valider est le travail de la
bibliothèque, et une seconde implémentation de ce contrôle est un second endroit
où se tromper.

| Garde          | Ce qu'elle refuse                        | Code  |
| -------------- | ---------------------------------------- | ----- |
| `SessionGuard` | Aucune session, session expirée          | `401` |
| `SessionGuard` | Bannissement en cours (échéance honorée) | `403` |
| `RolesGuard`   | Rôle absent de la liste `@Roles(...)`    | `403` |

L'ordre d'enregistrement des deux `APP_GUARD` est l'ordre d'exécution.
`SessionGuard` d'abord, parce que `RolesGuard` lit la session qu'il attache :
les inverser fait voir un rôle indéfini à chaque contrôle et refuse tout, ce
qu'un test du seul chemin nominal ne verrait pas.

## 9. Configuration

`src/config/auth/auth.ts` lit `process.env` directement, sans `ConfigService` :
le script de promotion charge ce fichier sans conteneur NestJS.

| Variable               | Requise | Rôle                                                                                   |
| ---------------------- | ------- | -------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`   | oui     | Signe les cookies et les jetons. 32 caractères minimum, jamais commitée.               |
| `BETTER_AUTH_URL`      | oui     | URL publique de l'API. Son origine est automatiquement de confiance.                   |
| `AUTH_TRUSTED_ORIGINS` | oui     | Origines autorisées, séparées par des virgules. Alimente CORS **et** le contrôle CSRF. |
| `NODE_ENV`             | oui     | Voir §7.4. Une valeur vide désactive la limitation de débit sans le dire.              |
| `DATABASE_*`           | oui     | Réutilisées telles quelles ; Better Auth ouvre son propre pool `pg`.                   |

Un seul `.env`, à la racine du dépôt : `docker compose` le lit, et le backend le
trouve en remontant depuis son dossier de travail (`load-env`). Deux fichiers
produisaient l'inverse — un `DATABASE_PORT` déplacé pour le conteneur et pas pour
`bun run dev`.

Toutes sont validées dans `src/config/env/env.schema.ts`, donc un secret absent
fait échouer le démarrage plutôt que la première inscription.

Better Auth ouvre un second pool `pg` vers la même base : il parle par Kysely et
ne peut pas emprunter la connexion de TypeORM. Deux pools au défaut de `pg`
(10 connexions chacun) contre un Postgres à 100 connexions — sans effet à cette
échelle, à revoir si un pool est dimensionné explicitement.

## 10. Cycle de vie du schéma

| Commande                    | Effet sur les tables d'authentification               |
| --------------------------- | ----------------------------------------------------- |
| démarrage de l'application  | Applique les migrations en attente (`migrationsRun`). |
| `bun run db:migrate`        | Idem, sans démarrer l'API.                            |
| `bun run db:generate <Nom>` | Diffe les entities, y compris ces cinq-là.            |
| `bun run db:reset`          | `db:drop` puis `db:migrate`. Inchangé.                |

Ajouter un plugin Better Auth qui apporte des colonnes se fait en deux temps :
déclarer les colonnes sur l'entity, puis `db:generate`. La configuration du
plugin reçoit le mapping, comme `admin` aujourd'hui.

## 11. Sécurité

| Contrôle                | État dans ce lot                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Hachage du mot de passe | `scrypt`, défaut de la bibliothèque. Le hash vit dans `account.password`.                                            |
| Longueur minimale       | 12 caractères (D9). L'ANSSI recommande 16 pour un administrateur ; l'option est unique, non différenciable par rôle. |
| Énumération de comptes  | Réponses et coûts identiques entre e-mail inconnu et mot de passe faux.                                              |
| CSRF                    | Validation d'`Origin` + Fetch Metadata, active. `disableCSRFCheck` reste à `false`.                                  |
| Cookies                 | `httpOnly`, `SameSite=Lax`, `Secure` en production, préfixe `better-auth.`.                                          |
| Limitation de débit     | Activée en production, stockée en base. 3 requêtes / 10 s sur `/sign-in`, `/sign-up`, `/change-password`.            |
| Révocation              | Immédiate : pas de cache de session (D6).                                                                            |
| Élévation de privilège  | `role` n'est jamais lu depuis le corps d'une inscription ; il vient de `defaultRole`.                                |
| Télémétrie              | Désactivée explicitement.                                                                                            |

Les deux contrôles les plus fragiles sont ceux qui dépendent de `NODE_ENV`
(§7.4) : la limitation de débit et l'attribut `Secure`. Ils ne cassent pas
bruyamment, ils disparaissent. C'est ce qui justifie D13 et la variable passée
explicitement en conteneur.

Deux points restent ouverts et sont nommés comme tels : aucune vérification
d'e-mail (donc une adresse peut être fausse) et aucun second facteur.

## 12. Tests

Deux suites, deux commandes, deux jobs de CI. `bun run test` ne touche rien
d'externe ; `bun run test:integration` démarre un conteneur et monte la vraie
application.

### 12.1 Ce que couvre l'unitaire

Seulement de la logique pure — c'est la définition du niveau, pas une
préférence. Une garde a des dépendances : la tester unitairement demanderait les
mocks que le contrat de tests interdit, donc elle relève de l'intégration.

| Unité                 | Ce qui est couvert                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `isBanActive`         | Six cas, dont l'instant exact d'expiration et une échéance oubliée sur un compte non banni.                                         |
| `parseTrustedOrigins` | Une origine, plusieurs, virgule traînante, variable absente ou blanche.                                                             |
| Mapping de champs     | Les correspondances écrites **littéralement**, pour qu'un changement de `snakeCase` échoue ici et non à la première connexion.      |
| Constantes de rôle    | Trois valeurs distinctes, `ADMIN_ROLES` inclus dans `ROLES`, et l'administration jamais donnée au rôle de l'inscription.            |
| Règle de débit        | `max = 5` et `window = 60` : le critère parle de la sixième tentative, l'option du nombre autorisé, et un décalage d'un les sépare. |

### 12.2 Le harnais d'intégration

```
test/global-setup.ts        ← démarre postgres:18-alpine, applique les migrations
test/setup-integration.ts   ← pose la connexion dans l'env, AVANT le premier import
test/db/truncate.ts         ← vide les tables entre deux tests
test/app.ts                 ← monte la vraie application via configureApp
test/probe.controller.ts    ← un consommateur pour les gardes
test/fixtures/user.fixture.ts
```

Quatre contraintes ont dicté sa forme. Trois viennent de la concurrence.

**TRUNCATE, pas un rollback de transaction.** Le motif habituel — ouvrir une
transaction, la défaire après chaque test — est inapplicable ici : Better Auth
écrit par **son propre pool**. Une fixture posée dans une transaction TypeORM
lui serait invisible, et ses écritures à elle survivraient au rollback.
L'isolation serait une illusion dans les deux sens. Committer pour de vrai garde
en prime observables les choses qui méritent un test : une contrainte d'unicité
lève réellement, une cascade cascade, et le compteur de débit est une ligne comme
une autre.

**Un seul worker.** L'isolation étant un TRUNCATE, deux workers sur le même
conteneur se videraient mutuellement les fixtures en plein milieu d'une
assertion — et l'échec tomberait dans la spec la plus lente, pas dans la
fautive.

**Le compteur de débit est un état partagé.** Sa clé est adresse + chemin, et
toutes les requêtes de la suite viennent de la même adresse. Sans un TRUNCATE
entre les tests, une spec qui se connecte six fois offre un `429` à la suivante,
pour des raisons qui ne la concernent pas. Ce n'est pas du rangement, c'est ce
qui rend les specs indépendantes de leur ordre.

**L'environnement avant le premier import.** `auth.ts` construit son pool et lit
`NODE_ENV` au chargement de son module (§7.4). `setup-integration.ts` tourne
dans chaque worker **avant** que la spec ne soit requise, ce qui est exactement
la fenêtre nécessaire : posée après, la connexion viserait la base de
développement.

Deux détails qui ne sont pas des détails. L'image est `postgres:18-alpine` et
pas « un Postgres » : chaque clé primaire du schéma a `uuidv7()` pour défaut, un
builtin de la 18, donc une image plus ancienne échoue à la première table — le
harnais ne peut pas tourner en silence sur une version que le schéma ne supporte
pas. Et `closeTestApp` ferme **les deux** pools : `app.close()` libère celui de
TypeORM, celui de Better Auth n'est connu de personne dans le cycle de vie Nest,
et laissé ouvert il fait pendre Jest après la dernière assertion sans rien à
montrer.

`configureApp` est appelé par la suite comme par `main.ts`. L'ordre des
middlewares est lui-même porteur — c'est le défaut CORS de §7.4 — donc une suite
qui le réassemblerait à la main testerait son propre assemblage.

Les gardes n'ont pas encore de route métier à protéger, alors la suite en fournit
une : `test/probe.controller.ts`, trois formes — sans annotation, avec un rôle
requis, et explicitement publique. Ce n'est pas un mock : les gardes, les
décorateurs et la lecture de session dessous sont les vrais. Le jour où un module
métier existe, ses routes exercent le même code et ce fichier peut partir.

### 12.3 Ce que couvre l'intégration

43 tests, trois specs.

| Spec                                | Ce qui est couvert                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.integration.spec.ts`          | Inscription, longueur de mot de passe (11 refusé, 12 accepté), doublon d'adresse, rôle par défaut et non choisi par le client, réponse identique entre mot de passe faux et compte inconnu, message de bannissement, débit (`[401 ×5, 429]`), déconnexion et origine hostile. Plus le schéma : colonnes `snake_case`, PK v7, mot de passe absent de `user`, adresse et agent enregistrés. |
| `session.guard.integration.spec.ts` | 401 sans session et sur un jeton mort, 200 avec, 401 après déconnexion, route publique, 403 pour un salarié et pour un partenaire, 200 pour un administrateur, promotion **et** rétrogradation prises en compte à la requête suivante, bannissement hors bande et échéance dépassée.                                                                                                      |
| `user.repo.integration.spec.ts`     | Les quatre méthodes du repo, l'unicité de l'adresse levée par la base, et la cascade qui ferme les sessions d'un compte supprimé.                                                                                                                                                                                                                                                         |

Les trois critères d'acceptation de l'issue EPI-45 sont couverts par une
assertion chacun, dans la première spec.

## 13. Décisions ouvertes

| #   | Question                                                                                                             | Bloque                                               |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| O1  | Envoi d'e-mail : quel transport ? Sans lui, vérification d'adresse et réinitialisation restent indisponibles.        | La récupération de compte.                           |
| O2  | `requireEmailVerification` : à activer en même temps que O1, sinon tout le monde est verrouillé dehors.              | Rien tant que O1 n'est pas tranché.                  |
| O5  | Durée de session : 7 jours par défaut. Le sujet ne dit rien ; un dispositif d'avantages salariés peut vouloir moins. | Rien, la valeur est une constante.                   |
| O8  | Bannissement hors bande non appliqué aux routes `/auth` — mesuré, suivi dans EPI-166.                                | La suspension d'un compte.                           |
| O6  | Journalisation des connexions échouées via `databaseHooks` — attendue par la fiche de registre ?                     | La fiche RGPD, si elle décrit un journal.            |
| O9  | Le reste de l'API répond sous `/api/v1` ; `/auth` reste à la racine. Faut-il aligner sur `/api/auth` ?               | Rien — à trancher avant que le client web soit figé. |

Fermées depuis : le troisième rôle est tranché (`partner`, §1), et le harnais
d'intégration existe (§12).

**Ce que les clés d'API laissent ouvert.** Le plugin est activé et sa table
posée, mais rien ne l'utilise : à quoi une clé se rattache — un employeur, un
compte — se décidera avec la surface tierce du §3.3. D'où l'absence de clé
étrangère sur `api_key.reference_id`.

## 14. Sources

- Better Auth — [Installation](https://www.better-auth.com/docs/installation)
- Better Auth — [Database](https://www.better-auth.com/docs/concepts/database)
- Better Auth — [Session Management](https://www.better-auth.com/docs/concepts/session-management)
- Better Auth — [Cookies](https://www.better-auth.com/docs/concepts/cookies)
- Better Auth — [Email & Password](https://www.better-auth.com/docs/authentication/email-password)
- Better Auth — [Rate Limit](https://www.better-auth.com/docs/concepts/rate-limit)
- Better Auth — [Admin plugin](https://www.better-auth.com/docs/plugins/admin)
- Better Auth — [OpenAPI plugin](https://www.better-auth.com/docs/plugins/open-api)
- Better Auth — [Express integration](https://www.better-auth.com/docs/integrations/express)
- Better Auth — [NestJS integration](https://www.better-auth.com/docs/integrations/nestjs)
- Better Auth — [Options reference](https://www.better-auth.com/docs/reference/options)
- npm — [`@thallesp/nestjs-better-auth`](https://www.npmjs.com/package/@thallesp/nestjs-better-auth)
- ANSSI — [Recommandations relatives à l'authentification multifacteur et aux mots de passe (ANSSI-PG-078)](https://cyber.gouv.fr/publications/recommandations-relatives-lauthentification-multifacteur-et-aux-mots-de-passe)
