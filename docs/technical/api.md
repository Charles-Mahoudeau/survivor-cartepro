# Spécification de base de l'API

Ce document donne les repères nécessaires pour appeler l'API CartePro : où elle
répond, comment s'authentifier, sous quelle forme reviennent les erreurs, et
quelles ressources elle expose. Il ne remplace pas le contrat complet — chaque
route, chaque DTO et chaque code d'erreur remontable sont documentés à jour
sur **`/docs`** (voir §5), généré depuis le code et donc incapable d'en
diverger.

## 1. Lancer l'API avant d'appeler quoi que ce soit

Consultez la sonde `/health` ou testez une route avant d'avoir démarré
l'API. Deux façons d'avoir l'API disponible, selon ce que vous voulez faire :

- **Consulter l'API sans installer de toolchain de développement**, à partir
  de l'artéfact construit par la CI (images Docker déjà prêtes, une seule
  commande à lancer) : suivez
  [`docs/technical/install.md`](install.md). C'est le chemin le plus rapide
  pour simplement ouvrir `/docs` et essayer des requêtes.
- **Développer contre l'API depuis les sources** : `bun install` puis
  `bun run dev` depuis la racine du dépôt, décrit dans le
  [README racine](../../README.md#démarrer). Les migrations en attente
  s'appliquent automatiquement au démarrage.

Dans les deux cas, l'API démarre avec sa propre base de données déjà migrée —
aucune étape manuelle de schéma n'est nécessaire pour commencer à l'appeler.

## 2. Racine et préfixe

| Environnement                      | Racine des routes API       |
| ---------------------------------- | --------------------------- |
| `bun run dev` (depuis les sources) | `http://localhost:3001`     |
| Artéfact Docker (`install.md`)     | `http://cartepro.localhost` |

Toutes les routes métier vivent sous un préfixe **`/api`**, avec un
**versionnement dans l'URL** — la version par défaut est `1`, donc une route
s'appelle en pratique sous `/api/v1/...` (par exemple
`GET /api/v1/employers`).

Trois familles de routes vivent **hors** de ce préfixe, à la racine :

| Route         | Rôle                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| `GET /health` | Sonde de vie du process. Ne touche pas la base. Seule route publique.               |
| `/docs`       | Documentation interactive (voir §5).                                                |
| `/docs/json`  | Le contrat OpenAPI brut, JSON.                                                      |
| `/auth/*`     | Authentification (Better Auth), servie par un middleware avant le routeur de l'API. |

## 3. Authentification

L'API s'authentifie par **cookie de session**, jamais par un jeton porté dans
un en-tête. Le cookie (`better-auth.session_token`) est posé par
`POST /auth/sign-in/email` et doit être renvoyé par le client sur chaque appel
suivant.

| Route                      | Effet                                             |
| -------------------------- | ------------------------------------------------- |
| `POST /auth/sign-up/email` | Crée le compte, ouvre la session, pose le cookie. |
| `POST /auth/sign-in/email` | Ouvre une session.                                |
| `POST /auth/sign-out`      | Supprime la session, expire le cookie.            |
| `GET /auth/get-session`    | La session courante, ou `null`.                   |

Un compte porte exactement un rôle parmi `employee`, `partner`, `admin`, relu
en base à chaque requête. Une route sans annotation `@Public()` explicite
exige une session valide, et certaines exigent en plus un rôle précis.

`POST /auth/sign-in/email` est limité à six tentatives par minute et par
adresse : la sixième répond `429`.

## 4. Format des erreurs

Toute erreur renvoyée par l'API prend la forme :

```json
{ "statusCode": 403, "message": "FORBIDDEN_ROLE" }
```

`message` est un **code stable**, pris dans un registre fermé — c'est lui que
le client doit brancher, jamais un texte libre. Les codes transverses,
communs à la plupart des routes protégées :

| Code              | Statut | Déclencheur                                                |
| ----------------- | :----: | ---------------------------------------------------------- |
| `UNAUTHENTICATED` |  401   | Aucune session sur la requête, ou session expirée.         |
| `ACCOUNT_BANNED`  |  403   | Le compte est banni, ou le portefeuille est désactivé.     |
| `FORBIDDEN_ROLE`  |  403   | La session est valide mais son rôle n'est pas accepté ici. |

Chaque route documente en plus, sur `/docs`, ses propres codes de domaine
(par exemple `PARTNER_NOT_FOUND`, `INSUFFICIENT_BALANCE`,
`PAYMENT_TOKEN_EXPIRED`) — un fichier par code remontable, à côté de la route
qui peut le lever.

## 5. Le contrat complet : `/docs`

`/docs` sert une documentation interactive (Scalar) de l'intégralité de
l'API — routes métier **et** routes d'authentification fusionnées dans le
même contrat. Elle est construite à partir des décorateurs du code à chaque
démarrage : elle ne peut donc pas être en retard sur ce que l'API accepte
réellement.

- **Explorer et essayer des requêtes** : ouvrez `/docs` dans un navigateur
  une fois l'API démarrée (§1) — `http://localhost:3001/docs` en développement,
  `http://cartepro.localhost/docs` depuis l'artéfact.
- **Récupérer le contrat brut** (génération de client, import dans un outil
  d'API) : `GET /docs/json` renvoie le document OpenAPI 3 complet.

  ```bash
  curl -s http://localhost:3001/docs/json > openapi.json
  ```

## 6. Ressources exposées

Aperçu des domaines couverts par l'API — le détail des routes, paramètres et
réponses de chacun est sur `/docs`.

| Préfixe                  | Domaine                                               |
| ------------------------ | ----------------------------------------------------- |
| `/me/wallet`             | Portefeuille du salarié connecté : solde, historique. |
| `/me/payment-tokens`     | Jeton de paiement (QR) du salarié connecté.           |
| `/employees`             | Solde d'un salarié, côté consultation.                |
| `/employers`             | Employeurs.                                           |
| `/allocations`           | Abondements alloués aux employeurs.                   |
| `/partners`              | Fiches partenaires (catalogue, profil).               |
| `/partners/applications` | Dossiers de candidature partenaire.                   |
| `/partners/categories`   | Catégories de partenaires.                            |
| `/payments`              | Encaissement d'un paiement par un partenaire.         |
| `/admin`                 | Export des transactions (rôle `admin`).               |
| `/admin/audit`           | Journal d'audit (rôle `admin`).                       |
